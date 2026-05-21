import { useState, useRef } from 'react'
import './VideoPlayer.css'

const UploadIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`action-svg-icon ${active ? 'active' : ''}`}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const OverlayIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`action-svg-icon ${active ? 'active' : ''}`}>
    <path d="M3 12h4l3-9 4 18 3-9h4" />
  </svg>
)

const ShareIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`action-svg-icon ${active ? 'active' : ''}`}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)

const VolumeIcon = ({ muted }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="control-svg-icon">
    {muted ? (
      <>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </>
    ) : (
      <>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M15.54 8.46a5 10 0 0 1 0 7.07" />
      </>
    )}
  </svg>
)

const VideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(20)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [overlayActive, setOverlayActive] = useState(true)
  const videoRef = useRef(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="video-player-container">
      <div className="video-wrapper-inner">
        <video
          ref={videoRef}
          className="video-element"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration)
            }
          }}
          muted={isMuted}
        >
          <source src="/sample-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-placeholder">
          <div className="placeholder-content">
            <div className="placeholder-sailboat">
              <div className="sail"></div>
              <div className="hull"></div>
            </div>
            <p className="placeholder-text">Video Player</p>
            <p className="placeholder-subtext">Load a video to review sailing footage</p>
          </div>
        </div>
      </div>
      <div className="video-controls">
        <button className="control-button" onClick={toggleMute}>
          <VolumeIcon muted={isMuted} />
        </button>
        <span className="time-display">{formatTime(currentTime)}</span>
        <div className="progress-bar-container" onClick={handleSeek}>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="progress-handle"></div>
            </div>
          </div>
          <button
            className="play-button-overlay"
            onClick={togglePlay}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        </div>
        <span className="time-display">-{formatTime(duration - currentTime)}</span>
        <button className="control-button">⛶</button>
      </div>
      <div className="video-actions">
        <button className="action-button">
          <UploadIcon />
          <span>Upload</span>
        </button>
        <button 
          className={`action-button ${overlayActive ? 'active' : ''}`}
          onClick={() => setOverlayActive(!overlayActive)}
        >
          <OverlayIcon active={overlayActive} />
          <span>Video Overlay</span>
        </button>
        <button className="action-button">
          <ShareIcon />
          <span>Share</span>
        </button>
      </div>
    </div>
  )
}

export default VideoPlayer