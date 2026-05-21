import { useState } from 'react'
import './AIPromptBar.css'

const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
)

const AIPromptBar = () => {
  const [prompt, setPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [tags, setTags] = useState(['January 30, 2026', 'Boat 1', 'Boat 2', 'Boat 3'])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/ai/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, tags })
      })
      const data = await response.json()
      console.log('AI Response:', data)
      setPrompt('')
    } catch (error) {
      console.error('Error sending prompt:', error)
      alert('Failed to process prompt')
    } finally {
      setIsProcessing(false)
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="ai-prompt-container">
      <div className="ai-prompt-header">
        <div className="greeting-section">
          <div className="greeting-logo">
            <img 
              src="/deltatrim-logo.jpg" 
              alt="DELTATRIM Logo" 
              className="greeting-logo-image"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <span className="greeting-logo-text">DELTATRIM</span>
          </div>
          <h2 className="greeting-text">Hi Coach</h2>
        </div>
        <h1 className="ai-prompt-question">How can we help you go faster?</h1>
      </div>
      <form className="ai-prompt-form" onSubmit={handleSubmit}>
        <div className="prompt-input-wrapper">
          <div className="prompt-tools">
            <button type="button" className="tool-button">
              <span className="tool-icon">+</span>
              <span>Tools</span>
              <span className="tool-gear">⚙</span>
            </button>
          </div>
          <input
            type="text"
            className="prompt-input"
            placeholder="Enter a prompt for Trim +"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isProcessing}
          />
          <div className="prompt-actions">
            <select className="prompt-select">
              <option>Fast</option>
              <option>Balanced</option>
              <option>Detailed</option>
            </select>
            <button type="button" className="mic-button">
              <MicIcon />
            </button>
          </div>
        </div>
        {tags.length > 0 && (
          <div className="prompt-tags">
            {tags.map((tag, index) => (
              <span key={index} className="prompt-tag">
                {tag}
                <button
                  type="button"
                  className="tag-remove"
                  onClick={() => removeTag(tag)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}

export default AIPromptBar
