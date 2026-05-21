import { useState, useEffect, useRef } from 'react'
import './Timeline.css'

const Timeline = ({ selectedDate, onTimeSelect }) => {
  const [selectedTime, setSelectedTime] = useState(null)
  const timelineRef = useRef(null)

  // Generate timeline data for the selected date
  const generateTimelineData = (date) => {
    if (!date) return []
    
    const day = date.getDate()
    const month = date.getMonth()
    
    // Only generate detailed data for 28th and 29th January
    if (month === 0 && (day === 28 || day === 29)) {
      const data = []
      // Generate data from 12:00 PM to 12:10 PM (each minute) - smooth curve transitions
      for (let minute = 0; minute <= 10; minute++) {
        const time = `12:${minute.toString().padStart(2, '0')}`
        const progress = minute / 10 // 0 to 1 for smooth interpolation
        
        // Smooth curve transition - leech profile changes smoothly over 10 minutes
        // Starting curve at 12:00pm
        const startCurve = [
          { x: 0, y: 0 },
          { x: 2, y: -1 },
          { x: 5, y: -2 },
          { x: 4, y: -3 },
          { x: 1, y: -4 }
        ]
        
        // Ending curve at 12:10pm (slightly different shape)
        const endCurve = [
          { x: 0.5, y: 0 },
          { x: 2.5, y: -1 },
          { x: 5.2, y: -2 },
          { x: 4.2, y: -3 },
          { x: 1.2, y: -4 }
        ]
        
        // Interpolate between start and end curves
        const interpolatedCurve = startCurve.map((point, index) => ({
          x: point.x + (endCurve[index].x - point.x) * progress,
          y: point.y + (endCurve[index].y - point.y) * progress
        }))
        
        data.push({
          time,
          hour: 12,
          minute,
          displayTime: minute === 0 ? '12pm' : null,
          data: interpolatedCurve
        })
      }
      
      // Add hourly markers for the rest of the day (1pm, 2pm, 3pm)
      for (let hour = 13; hour <= 15; hour++) {
        const hourLabel = `${hour - 12}pm`
        data.push({
          time: `${hour.toString().padStart(2, '0')}:00`,
          hour,
          minute: 0,
          displayTime: hourLabel,
          data: [
            { x: 0, y: 0 },
            { x: 2, y: -1 },
            { x: 5, y: -2 },
            { x: 4, y: -3 },
            { x: 1, y: -4 }
          ]
        })
      }
      
      return data
    }
    
    // For other dates, show hourly markers
    const data = []
    for (let hour = 0; hour < 24; hour++) {
      const hourLabel = hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`
      data.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        hour,
        minute: 0,
        displayTime: hourLabel,
        data: [
          { x: 0, y: 0 },
          { x: 2, y: -1 },
          { x: 5, y: -2 },
          { x: 4, y: -3 },
          { x: 1, y: -4 }
        ]
      })
    }
    return data
  }

  const timelineData = generateTimelineData(selectedDate)

  const handleTimeClick = (timeData) => {
    setSelectedTime(timeData.time)
    if (onTimeSelect) {
      onTimeSelect(timeData)
    }
  }

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    if (hour === 0) return '12am'
    if (hour < 12) return `${hour}am`
    if (hour === 12) return '12pm'
    return `${hour - 12}pm`
  }

  return (
    <div className="timeline-widget">
      <div className="timeline-header">
        <h3 className="timeline-title">Timeline</h3>
      </div>
      <div className="timeline-scroll" ref={timelineRef}>
        {timelineData.length === 0 ? (
          <div className="timeline-empty">
            <p>Select a date to view timeline</p>
          </div>
        ) : (
          <div className="timeline-track">
            {timelineData.map((timeData, index) => (
              <div
                key={index}
                className={`timeline-marker ${selectedTime === timeData.time ? 'selected' : ''}`}
                onClick={() => handleTimeClick(timeData)}
                title={timeData.time}
              >
                {timeData.displayTime && (
                  <div className="timeline-label">{timeData.displayTime}</div>
                )}
                <div className="timeline-dot"></div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedTime && (
        <div className="timeline-info">
          Selected: {formatTime(selectedTime)}
        </div>
      )}
    </div>
  )
}

export default Timeline