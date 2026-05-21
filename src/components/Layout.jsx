import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Calendar from './Calendar'
import Timeline from './Timeline'
import './Layout.css'

const DashboardIcon = ({ active }) => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={`nav-svg-icon ${active ? 'active' : ''}`}
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const DebriefIcon = ({ active }) => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={`nav-svg-icon ${active ? 'active' : ''}`}
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

const TrimPlusIcon = ({ active }) => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={`nav-svg-icon ${active ? 'active' : ''}`}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const Layout = ({ children }) => {
  const location = useLocation()
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 30))
  const [selectedTime, setSelectedTime] = useState(null)

  const isActive = (path) => {
    if (path === '/dashboard' || path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard'
    }
    return location.pathname === path
  }

  const getPageTitle = () => {
    if (location.pathname === '/debrief') return 'Debrief'
    if (location.pathname === '/trim-plus') return 'Trim +'
    return 'Dashboard'
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (timeData) => {
    setSelectedTime(timeData)
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo">
            <img 
              src="/deltatrim-logo.jpg" 
              alt="DELTATRIM Logo" 
              className="logo-image"
              onError={(e) => {
                // Fallback if image doesn't exist yet
                e.target.style.display = 'none'
              }}
            />
          </div>
        </div>

        {/* Profile Icon under logo */}
        <div className="sidebar-profile">
          <div className="profile-avatar-small">
            <div className="profile-icon">CC</div>
          </div>
          <div className="profile-info-small">
            <div className="profile-name-small">Coach Casey</div>
            <div className="profile-role-small">Coach</div>
          </div>
        </div>
        <nav className="nav-menu">
          <Link
            to="/dashboard"
            className={`nav-button ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <DashboardIcon active={isActive('/dashboard')} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/debrief"
            className={`nav-button ${isActive('/debrief') ? 'active' : ''}`}
          >
            <DebriefIcon active={isActive('/debrief')} />
            <span>Debrief</span>
          </Link>
          <Link
            to="/trim-plus"
            className={`nav-button ${isActive('/trim-plus') ? 'active' : ''}`}
          >
            <TrimPlusIcon active={isActive('/trim-plus')} />
            <span>Trim +</span>
          </Link>
        </nav>

        {/* Calendar Widget */}
        <Calendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />

        {/* Timeline Widget */}
        <Timeline selectedDate={selectedDate} onTimeSelect={handleTimeSelect} />
      </aside>
      <main className="main-content">
        <header className="main-header">
          <div className="header-left">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search..." className="search-input" />
            </div>
          </div>
          <div className="header-right">
            <div className="main-profile">
              <div className="profile-avatar">
                <div className="profile-icon">CC</div>
              </div>
              <div className="profile-info">
                <div className="profile-name">Coach Casey</div>
                <div className="profile-role">Coach</div>
              </div>
              <span className="profile-dropdown">▼</span>
            </div>
          </div>
        </header>
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
