import { useState } from 'react'
import './Calendar.css'

const Calendar = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Generate calendar days
  const days = []
  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const handleDateClick = (day) => {
    if (day) {
      const date = new Date(year, month, day)
      onDateSelect(date)
    }
  }

  const isSelected = (day) => {
    if (!day || !selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    )
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <button className="calendar-nav" onClick={goToPreviousMonth}>‹</button>
        <div className="calendar-month-year">
          {monthNames[month]} {year}
        </div>
        <button className="calendar-nav" onClick={goToNextMonth}>›</button>
      </div>
      <div className="calendar-grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="calendar-day-header">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <button
            key={index}
            className={`calendar-day ${day ? '' : 'empty'} ${isSelected(day) ? 'selected' : ''}`}
            onClick={() => handleDateClick(day)}
            disabled={!day}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Calendar