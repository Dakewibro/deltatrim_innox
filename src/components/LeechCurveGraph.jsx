import { useState, useEffect, useRef, useMemo } from 'react'
import './LeechCurveGraph.css'

// Catmull-Rom spline interpolation
const catmullRom = (points, samplesPerSeg = 60) => {
  if (points.length < 2) return points
  const out = []
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    
    for (let j = 0; j <= samplesPerSeg; j++) {
      const t = j / samplesPerSeg
      const t2 = t * t
      const t3 = t2 * t
      
      const x = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
      )
      const y = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
      )
      out.push({ x, y })
    }
  }
  return out
}

const LeechCurveGraph = ({ boats, colors, title }) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const startTimeRef = useRef(Date.now())
  
  // Random phase offsets for each boat and each node - generated once on mount
  const phaseOffsets = useMemo(() => {
    return boats.map(() => ({
      phases: Array(5).fill(0).map(() => Math.random() * Math.PI * 2),
      speeds: Array(5).fill(0).map(() => 0.8 + Math.random() * 0.8)
    }))
  }, [boats.length])
  
  // Node data state for each boat
  const [nodeData, setNodeData] = useState(() => 
    boats.map((boat, idx) => ({
      name: boat.name,
      color: colors[idx],
      nodes: Array(5).fill(0).map((_, i) => ({
        id: i + 1,
        roll: 0,
        pitch: 0,
        age_ms: 30,
        ok: true
      }))
    }))
  )
  
  // Graph dimensions
  const margin = { top: 30, right: 30, bottom: 50, left: 50 }
  const width = 600
  const height = 400
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  
  // Scale functions (x: -10 to 20, y: 0 to -4)
  const xScale = (x) => ((x - (-10)) / (20 - (-10))) * innerWidth + margin.left
  const yScale = (y) => ((y - 0) / (-4 - 0)) * innerHeight + margin.top
  
  // Build points for leech curve - TOP is fixed, oscillation increases toward bottom
  const buildPoints = (boatIndex, time) => {
    const { phases, speeds } = phaseOffsets[boatIndex]
    const pts = []
    
    // Fixed top point at y=0
    pts.push({ x: 0, y: 0 })
    
    // Each subsequent point has increasing amplitude (more movement toward bottom)
    // Natural, subtle oscillation - like a real sail leech
    for (let i = 1; i <= 4; i++) {
      const yVal = -i // y goes from -1 to -4
      const amplitude = (i * 0.6) + 0.5 // Subtle amplitude: ~1.1, 1.7, 2.3, 2.9
      const phase = phases[i]
      const speed = speeds[i] * 0.5 // Slower, more natural movement
      
      const xVal = amplitude * Math.sin(time * speed + phase + i * 0.5)
      pts.push({ x: xVal, y: yVal })
    }
    
    return pts
  }
  
  // Update node data
  const updateNodeData = (boatIndex, points) => {
    setNodeData(prev => {
      const newData = [...prev]
      for (let i = 0; i < 5; i++) {
        const pt = points[i]
        newData[boatIndex].nodes[i] = {
          id: i + 1,
          roll: pt.x,
          pitch: (i === 0) ? 0 : pt.x * 0.7,
          age_ms: 30 + Math.floor(Math.random() * 10),
          ok: true
        }
      }
      return newData
    })
  }
  
  // Draw function
  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    
    // Set canvas size
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Background
    ctx.fillStyle = '#141920'
    ctx.fillRect(0, 0, width, height)
    
    // Draw grid
    ctx.strokeStyle = 'rgba(232, 240, 255, 0.08)'
    ctx.lineWidth = 1
    
    // Vertical grid lines
    const xTicks = [-10, -5, 0, 5, 10, 15, 20]
    xTicks.forEach(tick => {
      ctx.beginPath()
      ctx.moveTo(xScale(tick), margin.top)
      ctx.lineTo(xScale(tick), height - margin.bottom)
      ctx.stroke()
    })
    
    // Horizontal grid lines
    const yTicks = [0, -1, -2, -3, -4]
    yTicks.forEach(tick => {
      ctx.beginPath()
      ctx.moveTo(margin.left, yScale(tick))
      ctx.lineTo(width - margin.right, yScale(tick))
      ctx.stroke()
    })
    
    // Draw axes
    ctx.strokeStyle = 'rgba(136, 146, 176, 0.8)'
    ctx.lineWidth = 1
    
    // X-axis
    ctx.beginPath()
    ctx.moveTo(margin.left, height - margin.bottom)
    ctx.lineTo(width - margin.right, height - margin.bottom)
    ctx.stroke()
    
    // Y-axis
    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top)
    ctx.lineTo(margin.left, height - margin.bottom)
    ctx.stroke()
    
    // Axis labels
    ctx.fillStyle = '#8892b0'
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial'
    ctx.textAlign = 'center'
    
    xTicks.forEach(tick => {
      ctx.fillText(tick.toString(), xScale(tick), height - margin.bottom + 18)
    })
    
    ctx.textAlign = 'right'
    yTicks.forEach(tick => {
      ctx.fillText(tick.toString(), margin.left - 10, yScale(tick) + 4)
    })
    
    // Calculate elapsed time
    const elapsed = (Date.now() - startTimeRef.current) / 1000
    
    // Draw each boat's curve
    boats.forEach((boat, boatIndex) => {
      const color = colors[boatIndex]
      const rawPoints = buildPoints(boatIndex, elapsed)
      
      // Update node data
      updateNodeData(boatIndex, rawPoints)
      
      // Convert to canvas coordinates
      const canvasPoints = rawPoints.map(p => ({
        x: xScale(p.x),
        y: yScale(p.y)
      }))
      
      // Interpolate with Catmull-Rom spline (~300 points total)
      const smoothPoints = catmullRom(canvasPoints, 75)
      
      // Draw the smooth curve
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      
      smoothPoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.stroke()
      
      // Draw the main points (nodes)
      canvasPoints.forEach((p, i) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5
        ctx.stroke()
      })
    })
    
    // Request next frame
    animationRef.current = requestAnimationFrame(draw)
  }
  
  useEffect(() => {
    startTimeRef.current = Date.now()
    draw()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [boats, colors])
  
  return (
    <div className="leech-graph-container">
      <div className="leech-graph-header">
        {boats.map((boat, index) => (
          <div key={index} className="boat-legend">
            <div
              className="legend-dot"
              style={{ backgroundColor: colors[index] }}
            />
            <span className="legend-text">{boat.name}</span>
            <span className="dropdown-arrow">▼</span>
          </div>
        ))}
        <button className="graph-add-button">+</button>
      </div>
      
      <div className="leech-graph-content">
        <canvas ref={canvasRef} className="leech-canvas" />
      </div>
      
      {/* Node Data Cards */}
      <div className="node-cards-section">
        {nodeData.map((boatData, boatIdx) => (
          <div key={boatIdx} className="boat-nodes-wrapper">
            <div className="boat-nodes-header" style={{ borderColor: boatData.color }}>
              <span className="boat-indicator" style={{ backgroundColor: boatData.color }} />
              <span>{boatData.name} Nodes</span>
            </div>
            <div className="node-cards-grid">
              {boatData.nodes.map((node) => (
                <div key={node.id} className="node-card">
                  <div className="node-head">
                    <span className="node-title">Node {node.id}</span>
                    <span className={`node-status ${node.ok ? 'ok' : ''}`} />
                  </div>
                  <div className="node-data">
                    <div className="node-row">
                      <span className="node-label">roll</span>
                      <span className="node-value">{node.roll.toFixed(2)}°</span>
                    </div>
                    <div className="node-row">
                      <span className="node-label">pitch</span>
                      <span className="node-value">{node.pitch.toFixed(2)}°</span>
                    </div>
                    <div className="node-row">
                      <span className="node-label">age</span>
                      <span className="node-value">{node.age_ms} ms</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LeechCurveGraph
