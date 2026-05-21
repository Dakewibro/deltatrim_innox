import { useState } from 'react'
import './Graph.css'

const Graph = ({ title, boats, colors }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null)

  // Graph dimensions and scales - responsive
  const margin = { top: 20, right: 20, bottom: 40, left: 40 }
  const containerWidth = 600
  const containerHeight = 400
  const width = containerWidth
  const height = containerHeight
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Scale functions
  const xScale = (x) => {
    const xMin = -10
    const xMax = 20
    return ((x - xMin) / (xMax - xMin)) * innerWidth + margin.left
  }

  const yScale = (y) => {
    const yMin = 0
    const yMax = -4
    return ((y - yMin) / (yMax - yMin)) * innerHeight + margin.top
  }

  // Generate smooth spline path for a line
  const generatePath = (data) => {
    if (!data || data.length < 2) return ''
    
    const sortedData = [...data].sort((a, b) => a.x - b.x)
    const points = sortedData.map(p => ({ x: xScale(p.x), y: yScale(p.y) }))
    
    let path = `M ${points[0].x} ${points[0].y}`
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[i + 2 === points.length ? i + 1 : i + 2]
      
      // Catmull-Rom to Bezier conversion
      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
    }
    
    return path
  }

  // Generate ticks
  const xTicks = [-10, 0, 10, 20]
  const yTicks = [0, -1, -2, -3, -4]

  const lines = boats.map((boat, index) => ({
    name: boat.name,
    data: boat.data || [],
    color: colors[index] || '#00d4aa'
  }))

  const handlePointHover = (point, boatName, color) => {
    setHoveredPoint({ ...point, boatName, color })
  }

  const handlePointLeave = () => {
    setHoveredPoint(null)
  }

  return (
    <div className="graph-container">
      <div className="graph-header">
        {lines.map((line, index) => (
          <div key={index} className="boat-legend">
            <div
              className="legend-dot"
              style={{ backgroundColor: line.color }}
            ></div>
            <span className="legend-text">{line.name}</span>
            <span className="dropdown-arrow">▼</span>
          </div>
        ))}
        <button className="graph-add-button">+</button>
      </div>
      <div className="graph-content">
        <svg viewBox={`0 0 ${width} ${height}`} className="graph-svg" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          {xTicks.map((tick) => (
            <line
              key={`x-grid-${tick}`}
              x1={xScale(tick)}
              y1={margin.top}
              x2={xScale(tick)}
              y2={height - margin.bottom}
              stroke="#1a1f2e"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          ))}
          {yTicks.map((tick) => (
            <line
              key={`y-grid-${tick}`}
              x1={margin.left}
              y1={yScale(tick)}
              x2={width - margin.right}
              y2={yScale(tick)}
              stroke="#1a1f2e"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          ))}

          {/* Draw lines */}
          {lines.map((line, lineIndex) => {
            const path = generatePath(line.data)
            return (
              <g key={lineIndex}>
                <path
                  d={path}
                  fill="none"
                  stroke={line.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Draw points */}
                {line.data.map((point, pointIndex) => {
                  const x = xScale(point.x)
                  const y = yScale(point.y)
                  return (
                    <circle
                      key={pointIndex}
                      cx={x}
                      cy={y}
                      r={4}
                      fill={line.color}
                      stroke="#ffffff"
                      strokeWidth={1}
                      onMouseEnter={() => handlePointHover(point, line.name, line.color)}
                      onMouseLeave={handlePointLeave}
                      style={{ cursor: 'pointer' }}
                    />
                  )
                })}
              </g>
            )
          })}

          {/* X-axis */}
          <line
            x1={margin.left}
            y1={height - margin.bottom}
            x2={width - margin.right}
            y2={height - margin.bottom}
            stroke="#8892b0"
            strokeWidth={1}
          />
          {xTicks.map((tick) => (
            <g key={`x-tick-${tick}`}>
              <line
                x1={xScale(tick)}
                y1={height - margin.bottom}
                x2={xScale(tick)}
                y2={height - margin.bottom + 5}
                stroke="#8892b0"
                strokeWidth={1}
              />
              <text
                x={xScale(tick)}
                y={height - margin.bottom + 20}
                textAnchor="middle"
                fill="#8892b0"
                fontSize="12"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* Y-axis */}
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={height - margin.bottom}
            stroke="#8892b0"
            strokeWidth={1}
          />
          {yTicks.map((tick) => (
            <g key={`y-tick-${tick}`}>
              <line
                x1={margin.left}
                y1={yScale(tick)}
                x2={margin.left - 5}
                y2={yScale(tick)}
                stroke="#8892b0"
                strokeWidth={1}
              />
              <text
                x={margin.left - 10}
                y={yScale(tick)}
                textAnchor="end"
                fill="#8892b0"
                fontSize="12"
                dominantBaseline="middle"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* Tooltip */}
          {hoveredPoint && (
            <g>
              <circle
                cx={xScale(hoveredPoint.x)}
                cy={yScale(hoveredPoint.y)}
                r={6}
                fill={hoveredPoint.color}
                stroke="#ffffff"
                strokeWidth={2}
              />
              <foreignObject
                x={xScale(hoveredPoint.x) + 10}
                y={yScale(hoveredPoint.y) - 30}
                width="150"
                height="50"
              >
                <div className="graph-tooltip">
                  <div style={{ color: hoveredPoint.color, fontWeight: 'bold' }}>
                    {hoveredPoint.boatName}
                  </div>
                  <div style={{ color: '#ffffff', fontSize: '12px' }}>
                    ({hoveredPoint.x}, {hoveredPoint.y})
                  </div>
                </div>
              </foreignObject>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}

export default Graph