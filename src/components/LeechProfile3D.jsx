import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Sphere, Grid, Html } from '@react-three/drei'
import * as THREE from 'three'
import { createESP32Polling } from '../utils/esp32DataService'
import './LeechProfile3D.css'

const SmoothLeechLine = ({ points, color = 'blue' }) => {
  const lineRef = useRef()

  // Create a CatmullRomCurve3 from the points
  const curve = useMemo(() => {
    if (points.length < 2) return null
    return new THREE.CatmullRomCurve3(
      points.map(p => new THREE.Vector3(p.x, p.y, p.z))
    )
  }, [points])

  const smoothPoints = useMemo(() => {
    if (!curve) return []
    return curve.getPoints(100)
  }, [curve])

  return (
    <Line
      ref={lineRef}
      points={smoothPoints}
      color={color}
      lineWidth={2}
    />
  )
}

// Real-time leech points from ESP32 data
const RealTimeLeechPoints = ({ nodes, mode, zeroOffsets, flip, color }) => {
  const [positions, setPositions] = useState(() => {
    // Initial positions - same y coordinates as before
    const yCoords = [-5, -1.25, 2.5, 6.25, 10]
    return yCoords.map((y, i) => ({ x: 0, y, z: 0 }))
  })

  useEffect(() => {
    if (!nodes || nodes.length === 0) return

    // Convert ESP32 data to 3D positions
    // Algorithm matches ESP32 HTML: x = x + L * sin(theta)
    const L = 3.0 // Segment length (scaled for 3D view)
    const yCoords = [-5, -1.25, 2.5, 6.25, 10]
    
    const newPositions = []
    let currentX = 0
    let currentY = yCoords[0]
    
    // First point (top) is fixed
    newPositions.push({ x: currentX, y: currentY, z: 0 })
    
    // Build subsequent points from angles
    for (let i = 1; i <= 4; i++) {
      const node = nodes[i - 1] // nodes[0] is node 1, nodes[1] is node 2, etc.
      
      if (node && node.connected) {
        // Get angle based on mode (roll or pitch)
        let angleDeg = mode === 'roll' ? node.roll : node.pitch
        
        // Apply flip if enabled
        if (flip) {
          angleDeg = -angleDeg
        }
        
        // Apply zero offset
        const zeroOffset = zeroOffsets[i] || 0
        const adjustedAngle = angleDeg - zeroOffset
        
        // Convert to radians
        const thetaRad = (adjustedAngle * Math.PI) / 180.0
        
        // Calculate next point position
        currentX = currentX + L * Math.sin(thetaRad)
        currentY = yCoords[i]
        
        newPositions.push({ x: currentX, y: currentY, z: 0 })
      } else {
        // Node disconnected - use previous position or default
        newPositions.push({ x: currentX, y: yCoords[i], z: 0 })
      }
    }
    
    setPositions(newPositions)
  }, [nodes, mode, zeroOffsets, flip])

  return (
    <>
      <SmoothLeechLine points={positions} color={color} />
      {positions.map((p, i) => {
        const node = nodes[i]
        const isConnected = node && node.connected
        return (
          <Sphere key={i} args={[0.2, 16, 16]} position={[p.x, p.y, p.z]}>
            <meshBasicMaterial 
              color={isConnected ? color : '#666666'} 
              transparent 
              opacity={isConnected ? 0.6 : 0.3} 
            />
          </Sphere>
        )
      })}
    </>
  )
}

const LeechProfile3D = () => {
  const [esp32Nodes, setEsp32Nodes] = useState([])
  const [connectionStatus, setConnectionStatus] = useState({ connected: 0, total: 5 })
  const [mode, setMode] = useState('roll') // 'roll' or 'pitch'
  const [flip, setFlip] = useState(false)
  const [zeroOffsets, setZeroOffsets] = useState(Array(6).fill(null))
  const [useSimulated, setUseSimulated] = useState(false)
  const [error, setError] = useState(null)

  // ESP32 data polling
  useEffect(() => {
    if (useSimulated) return

    const stopPolling = createESP32Polling(
      (nodes, rawData) => {
        setEsp32Nodes(nodes)
        
        // Count connected nodes
        const connected = nodes.filter(n => n.connected).length
        setConnectionStatus({ connected, total: 5 })
        setError(null)
      },
      (err) => {
        setError(err.message)
        // Fallback to simulated data if ESP32 unavailable
        if (esp32Nodes.length === 0) {
          setUseSimulated(true)
        }
      }
    )

    return () => {
      stopPolling()
    }
  }, [useSimulated])

  // Simulated data state (for fallback)
  const [simulatedNodes, setSimulatedNodes] = useState(() => 
    Array(5).fill(null).map((_, i) => ({
      nodeId: i + 1,
      roll: 0,
      pitch: 0,
      connected: true,
      age: 50
    }))
  )

  // Animate simulated data if needed
  useEffect(() => {
    if (!useSimulated && esp32Nodes.length > 0) return

    const interval = setInterval(() => {
      setSimulatedNodes(prev => 
        prev.map((node, i) => ({
          ...node,
          roll: Math.sin(Date.now() / 1000 + i * 0.5) * 10,
          pitch: Math.cos(Date.now() / 1000 + i * 0.5) * 5
        }))
      )
    }, 50)

    return () => clearInterval(interval)
  }, [useSimulated, esp32Nodes.length])

  // Fallback to simulated data if no ESP32 data
  const displayNodes = useSimulated || esp32Nodes.length === 0 
    ? simulatedNodes
    : esp32Nodes

  const handleZeroNow = () => {
    // Capture current angles as zero offsets
    const newOffsets = [...zeroOffsets]
    displayNodes.forEach((node, index) => {
      if (node && node.connected) {
        const angle = mode === 'roll' ? node.roll : node.pitch
        newOffsets[index + 1] = angle // Index 0 is not used (top point is fixed)
      }
    })
    setZeroOffsets(newOffsets)
  }

  return (
    <div className="leech-profile-3d-container">
      <div className="leech-profile-3d-controls">
        <div className="control-group">
          <label>
            Mode:
            <select 
              value={mode} 
              onChange={(e) => setMode(e.target.value)}
              className="control-select"
            >
              <option value="roll">roll</option>
              <option value="pitch">pitch</option>
            </select>
          </label>
        </div>

        <div className="control-group">
          <label>
            <input 
              type="checkbox" 
              checked={flip} 
              onChange={(e) => setFlip(e.target.checked)}
              className="control-checkbox"
            />
            flip
          </label>
        </div>

        <button 
          onClick={handleZeroNow}
          className="control-button"
        >
          zero now
        </button>

        <div className="connection-status">
          {useSimulated ? (
            <span className="status-simulated">Simulated Data</span>
          ) : (
            <span className={`status-connected ${connectionStatus.connected > 0 ? 'active' : ''}`}>
              Connected: {connectionStatus.connected}/{connectionStatus.total}
            </span>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      <div className="leech-profile-3d-canvas-wrapper">
        <Canvas camera={{ position: [0, 2.5, 25], fov: 45 }}>
          <color attach="background" args={['#141920']} />
          <ambientLight intensity={0.8} />
          
          {/* Vertical Graph Grid */}
          <Grid
            position={[0, 2.5, -0.5]}
            rotation={[Math.PI / 2, 0, 0]}
            args={[50, 50]}
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#1a1f2e"
            cellColor="#0f1419"
            cellSize={1}
            cellThickness={0.5}
            infiniteGrid={true}
            fadeDistance={100}
          />

          <RealTimeLeechPoints 
            nodes={displayNodes}
            mode={mode}
            zeroOffsets={zeroOffsets}
            flip={flip}
            color="#00d4aa"
          />

          {/* Axis Number Markers */}
          {[0, 5, 10, -5].map((val) => (
            <Html key={`y-${val}`} position={[-15, val, 0]} center>
              <span style={{ color: '#8892b0', fontSize: '10px', userSelect: 'none' }}>{val}</span>
            </Html>
          ))}
          {[-10, -5, 0, 5, 10].map((val) => (
            <Html key={`x-${val}`} position={[val, -8, 0]} center>
              <span style={{ color: '#8892b0', fontSize: '10px', userSelect: 'none' }}>{val}</span>
            </Html>
          ))}
          
          <OrbitControls 
            enableRotate={false} // Lock to 2D view
            enableZoom={true}
            enablePan={true}
            makeDefault 
          />
        </Canvas>
      </div>
      
      <div className="leech-profile-3d-label">
        Leech Profile Analysis {useSimulated ? '(Simulated)' : '(Live ESP32 Data)'}
      </div>
      
      {/* 2D Axis Labels overlay */}
      <div className="axis-label-x">
        X ({mode === 'roll' ? 'Roll' : 'Pitch'} Oscillation)
      </div>
      <div className="axis-label-y">
        Y (Height)
      </div>
    </div>
  )
}

export default LeechProfile3D
