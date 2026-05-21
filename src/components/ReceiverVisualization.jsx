import { useState, useEffect, useRef, useMemo } from 'react'
import { createReceiverPolling } from '../utils/receiverDataService'
import './ReceiverVisualization.css'

const ReceiverVisualization = () => {
  const [nodes, setNodes] = useState([])
  const [connected, setConnected] = useState(false)
  const [updateRate, setUpdateRate] = useState('0.0')
  const [chartData, setChartData] = useState([]) // Rolling buffer of {roll, pitch, time}
  
  const tiltBoxRef = useRef(null)
  const chartCanvasRef = useRef(null)
  const chartContainerRef = useRef(null)
  const pollingServiceRef = useRef(null)
  const updateRateIntervalRef = useRef(null)
  
  const MAX_CHART_POINTS = 48 // ~10 seconds at 250ms
  
  // Get active node (first connected node, or node 1 if none connected)
  const activeNode = useMemo(() => {
    const connectedNode = nodes.find(n => n.connected)
    return connectedNode || nodes[0] || { id: 1, roll: 0, pitch: 0, connected: false }
  }, [nodes])
  
  // Update chart data
  useEffect(() => {
    if (activeNode && activeNode.connected) {
      setChartData(prev => {
        const newData = [...prev, {
          roll: activeNode.roll,
          pitch: activeNode.pitch,
          time: Date.now()
        }]
        // Keep only last MAX_CHART_POINTS
        return newData.slice(-MAX_CHART_POINTS)
      })
    }
  }, [activeNode])
  
  // Setup polling
  useEffect(() => {
    const pollingService = createReceiverPolling(
      (newNodes, rawData) => {
        setNodes(newNodes)
        
        // Check if any node is connected
        const hasConnection = newNodes.some(n => n.connected && n.age_ms < 1000)
        setConnected(hasConnection)
      },
      (error) => {
        console.warn('Receiver polling error:', error)
        setConnected(false)
      }
    )
    
    // Store polling service reference
    pollingServiceRef.current = pollingService
    
    // Update rate display (refresh every second)
    updateRateIntervalRef.current = setInterval(() => {
      if (pollingServiceRef.current && pollingServiceRef.current.getUpdateRate) {
        const rate = pollingServiceRef.current.getUpdateRate()
        setUpdateRate(rate)
      }
    }, 1000)
    
    return () => {
      if (pollingService && typeof pollingService.stop === 'function') {
        pollingService.stop()
      }
      if (updateRateIntervalRef.current) {
        clearInterval(updateRateIntervalRef.current)
      }
    }
  }, [])
  
  // Draw tilt box
  useEffect(() => {
    if (!tiltBoxRef.current || !activeNode) return
    
    const box = tiltBoxRef.current
    const ctx = box.getContext('2d')
    const width = box.width
    const height = box.height
    const centerX = width / 2
    const centerY = height / 2
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw grid background
    ctx.strokeStyle = 'rgba(136, 146, 176, 0.2)'
    ctx.lineWidth = 1
    
    // Vertical lines
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    
    // Horizontal lines
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    // Draw crosshairs
    ctx.strokeStyle = 'rgba(136, 146, 176, 0.4)'
    ctx.lineWidth = 1
    ctx.setLineDash([])
    
    // Vertical line
    ctx.beginPath()
    ctx.moveTo(centerX, 0)
    ctx.lineTo(centerX, height)
    ctx.stroke()
    
    // Horizontal line
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    ctx.lineTo(width, centerY)
    ctx.stroke()
    
    // Draw moving point (roll/pitch visualization)
    // Scale: ±45 degrees maps to ±50% of box
    const rollOffset = (activeNode.roll / 45) * (width / 2)
    const pitchOffset = (activeNode.pitch / 45) * (height / 2)
    
    const pointX = centerX + rollOffset
    const pointY = centerY - pitchOffset // Invert Y (canvas Y increases downward)
    
    // Draw point
    ctx.fillStyle = activeNode.connected ? '#00d4aa' : '#8892b0'
    ctx.beginPath()
    ctx.arc(pointX, pointY, 6, 0, Math.PI * 2)
    ctx.fill()
    
    // Draw point border
    ctx.strokeStyle = '#0a0e1a'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [activeNode])
  
  // Resize chart canvas to container
  useEffect(() => {
    const resizeCanvas = () => {
      if (!chartCanvasRef.current || !chartContainerRef.current) return
      
      const container = chartContainerRef.current
      const canvas = chartCanvasRef.current
      
      // Set canvas size to match container (accounting for padding)
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight || 200
      
      // Update canvas dimensions
      canvas.width = containerWidth
      canvas.height = containerHeight
    }
    
    // Initial resize
    resizeCanvas()
    
    // Resize on window resize
    window.addEventListener('resize', resizeCanvas)
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])
  
  // Draw chart
  useEffect(() => {
    if (!chartCanvasRef.current || chartData.length === 0) return
    
    const canvas = chartCanvasRef.current
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw grid
    ctx.strokeStyle = 'rgba(136, 146, 176, 0.35)'
    ctx.lineWidth = 1
    
    // Horizontal grid lines (degrees)
    const degrees = [-45, -30, -15, 0, 15, 30, 45]
    degrees.forEach(deg => {
      const y = padding + ((45 - deg) / 90) * chartHeight
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
      
      // Label
      ctx.fillStyle = '#8892b0'
      ctx.font = '11px system-ui'
      ctx.textAlign = 'right'
      ctx.fillText(`${deg}°`, padding - 8, y + 4)
    })
    
    // Draw roll line (solid)
    if (chartData.length > 1) {
      ctx.strokeStyle = '#00d4aa'
      ctx.lineWidth = 2
      ctx.setLineDash([])
      ctx.beginPath()
      
      chartData.forEach((point, index) => {
        const x = padding + (index / (chartData.length - 1)) * chartWidth
        const y = padding + ((45 - point.roll) / 90) * chartHeight
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    }
    
    // Draw pitch line (dashed)
    if (chartData.length > 1) {
      ctx.strokeStyle = '#00d4aa'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      
      chartData.forEach((point, index) => {
        const x = padding + (index / (chartData.length - 1)) * chartWidth
        const y = padding + ((45 - point.pitch) / 90) * chartHeight
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    }
    
    // Reset line dash
    ctx.setLineDash([])
    
    // Draw labels
    ctx.fillStyle = '#ffffff'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText('Roll (solid) / Pitch (dashed)', padding, 20)
    
    ctx.fillStyle = '#8892b0'
    ctx.font = '11px system-ui'
    ctx.textAlign = 'right'
    ctx.fillText('Scale: ± 45 deg', width - padding, height - 8)
  }, [chartData])
  
  return (
    <div className="receiver-visualization">
      <div className="receiver-header">
        <h2 className="receiver-title">Receiver Data</h2>
        <div className="receiver-status">
          <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">{connected ? 'CONNECTED' : 'NO DATA'}</span>
          <span className="update-rate">Update Rate: {updateRate} Hz</span>
        </div>
      </div>
      
      <div className="receiver-content">
        {/* Tilt Box */}
        <div className="tilt-box-section">
          <h3 className="section-title">Tilt Box</h3>
          <div className="tilt-box-container">
            <canvas
              ref={tiltBoxRef}
              className="tilt-box-canvas"
              width={300}
              height={300}
            />
            <div className="tilt-box-labels">
              <span className="label-pitch">Pitch +/-</span>
              <span className="label-roll">Roll + →</span>
            </div>
          </div>
        </div>
        
        {/* Chart */}
        <div className="chart-section">
          <h3 className="section-title">Roll (solid) / Pitch (dashed)</h3>
          <div ref={chartContainerRef} className="chart-container">
            <canvas
              ref={chartCanvasRef}
              className="chart-canvas"
            />
          </div>
        </div>
        
        {/* Node Status Table */}
        <div className="node-table-section">
          <h3 className="section-title">Node Status</h3>
          <table className="node-table">
            <thead>
              <tr>
                <th>Node</th>
                <th>Status</th>
                <th>Age (ms)</th>
                <th>Roll</th>
                <th>Pitch</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map(node => (
                <tr key={node.id}>
                  <td>{node.id}</td>
                  <td>
                    <span className={`node-status ${node.connected ? 'connected' : 'no-data'}`}>
                      {node.connected ? '● CONNECTED' : '○ NO DATA'}
                    </span>
                  </td>
                  <td>{node.age_ms < 999999 ? node.age_ms : '—'}</td>
                  <td>{node.connected ? `${node.roll.toFixed(2)}°` : '0.00°'}</td>
                  <td>{node.connected ? `${node.pitch.toFixed(2)}°` : '0.00°'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ReceiverVisualization
