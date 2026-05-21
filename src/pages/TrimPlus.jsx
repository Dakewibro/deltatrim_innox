import { useState, useEffect } from 'react'
import Graph from '../components/Graph'
import ImageGallery from '../components/ImageGallery'
import AIPromptBar from '../components/AIPromptBar'
import './TrimPlus.css'

const TrimPlus = () => {
  const [boat1Data, setBoat1Data] = useState([])
  const [boat2Data, setBoat2Data] = useState([])
  const [boat3Data, setBoat3Data] = useState([])
  const [boat4Data, setBoat4Data] = useState([])

  useEffect(() => {
    // Load default data immediately
    loadDefaultData()
    // Try to fetch from API
    fetchBoatData()
  }, [])

  const loadDefaultData = () => {
    setBoat1Data([
      { x: 0, y: 0 },
      { x: 2, y: -1 },
      { x: 5, y: -2 },
      { x: 4, y: -3 },
      { x: 1, y: -4 }
    ])
    setBoat2Data([
      { x: 0, y: 0 },
      { x: 6.75, y: -1 },
      { x: 7, y: -2 },
      { x: 4.5, y: -3 },
      { x: 2, y: -4 }
    ])
    setBoat3Data([
      { x: 0, y: 0 },
      { x: 1, y: -1 },
      { x: 3, y: -2 },
      { x: 5, y: -3 },
      { x: 2, y: -4 }
    ])
    setBoat4Data([
      { x: 0, y: 0 },
      { x: 3, y: -1 },
      { x: 5.5, y: -2 },
      { x: 5.5, y: -3 },
      { x: 6, y: -4 }
    ])
  }

  const fetchBoatData = async () => {
    try {
      const response = await fetch('/api/boats')
      if (!response.ok) throw new Error('API not available')
      const data = await response.json()
      
      if (data.boat1) setBoat1Data(data.boat1)
      if (data.boat2) setBoat2Data(data.boat2)
      if (data.boat3) setBoat3Data(data.boat3)
      if (data.boat4) setBoat4Data(data.boat4)
    } catch (error) {
      // Silently fail - default data is already loaded
      console.log('API server not available, using default data')
    }
  }

  return (
    <div className="trim-plus">
      <div className="trim-plus-top">
        <div className="trim-plus-graphs">
          <div className="graph-wrapper">
            <Graph
              title="Boat Comparison 1"
              boats={[
                { name: 'Boat 1', data: boat1Data },
                { name: 'Boat 2', data: boat2Data }
              ]}
              colors={['#9d4edd', '#4dabf7']}
            />
          </div>
          <div className="graph-wrapper">
            <Graph
              title="Boat Comparison 2"
              boats={[
                { name: 'Boat 3', data: boat3Data },
                { name: 'Boat 4', data: boat4Data }
              ]}
              colors={['#ff6b9d', '#4dabf7']}
            />
          </div>
        </div>
        <div className="gallery-wrapper">
          <ImageGallery />
        </div>
      </div>
      <div className="trim-plus-bottom">
        <AIPromptBar />
      </div>
    </div>
  )
}

export default TrimPlus