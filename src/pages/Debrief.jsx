import { useState, useEffect } from 'react'
import LeechProfile3D from '../components/LeechProfile3D'
import VideoPlayer from '../components/VideoPlayer'
import './Debrief.css'

const Debrief = () => {
  const [selectedDate] = useState(new Date(2026, 0, 30))

  const formatDate = (date) => {
    const day = date.getDate()
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  return (
    <div className="debrief">
      <h2 className="debrief-date">{formatDate(selectedDate)}</h2>
      <div className="debrief-grid">
        <div className="graph-wrapper">
          <LeechProfile3D />
        </div>
        <div className="video-wrapper">
          <VideoPlayer />
        </div>
      </div>
      <div className="debrief-timeline">
        <div className="timeline-thumbnails">
          {['12pm', '1pm', '2pm', '3pm'].map((time, index) => (
            <div key={index} className="timeline-thumbnail">
              <div className="thumbnail-image">
                <div className="thumbnail-placeholder">
                  <div className="thumbnail-sailboat">
                    <div className="sail-thumb"></div>
                    <div className="hull-thumb"></div>
                  </div>
                </div>
              </div>
              <div className="thumbnail-time">{time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Debrief