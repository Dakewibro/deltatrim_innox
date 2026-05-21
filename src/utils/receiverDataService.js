/**
 * Receiver Data Service
 * Handles fetching and processing data from ESP32-S3 receiver
 * Receiver format: {"ms": millis(), "nodes": [{"id": 1, "connected": true, "age_ms": 50, "roll": 1.23, "pitch": 4.56}, ...]}
 */

const POLL_INTERVAL_MS = 250 // Match receiver's update rate

/**
 * Fetch data from receiver via backend proxy
 * @returns {Promise<Object>} Receiver data or null if error
 */
export const fetchReceiverData = async () => {
  try {
    const response = await fetch('/api/esp32/data', {
      method: 'GET',
      cache: 'no-cache'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.warn('Receiver fetch failed:', error.message)
    return null
  }
}

/**
 * Convert receiver's array format to component-friendly format
 * @param {Object} receiverData - Raw receiver data: {"ms": ..., "nodes": [...]}
 * @returns {Array} Array of node data: [{id, connected, age_ms, roll, pitch}, ...]
 */
export const convertReceiverNodes = (receiverData) => {
  if (!receiverData || !receiverData.nodes) {
    // Return empty nodes if no data
    return Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      connected: false,
      age_ms: 999999,
      roll: 0,
      pitch: 0
    }))
  }
  
  // Ensure we have 5 nodes (fill missing ones)
  const nodes = []
  for (let i = 1; i <= 5; i++) {
    const node = receiverData.nodes.find(n => n.id === i)
    if (node) {
      nodes.push({
        id: node.id,
        connected: node.connected || false,
        age_ms: node.age_ms || 999999,
        roll: node.roll || 0,
        pitch: node.pitch || 0
      })
    } else {
      nodes.push({
        id: i,
        connected: false,
        age_ms: 999999,
        roll: 0,
        pitch: 0
      })
    }
  }
  
  return nodes
}

/**
 * Create a polling service for receiver data
 * @param {Function} onData - Callback when new data arrives: (nodes, rawData) => void
 * @param {Function} onError - Callback on error: (error) => void
 * @returns {Object} Object with stop() and getUpdateRate() functions
 */
export const createReceiverPolling = (onData, onError) => {
  let isPolling = true
  let lastDataHash = null
  let updateCount = 0
  let startTime = Date.now()
  let lastUpdateTime = Date.now()
  
  const getUpdateRate = () => {
    const elapsed = (Date.now() - startTime) / 1000 // seconds
    if (elapsed < 1) return '0.0'
    return (updateCount / elapsed).toFixed(1)
  }
  
  const poll = async () => {
    if (!isPolling) return
    
    try {
      const data = await fetchReceiverData()
      
      if (data) {
        // Create hash to detect changes
        const dataHash = JSON.stringify(data)
        
        // Always call onData (even if data hasn't changed, to show connection status)
        // But only increment updateCount if data changed
        if (dataHash !== lastDataHash) {
          lastDataHash = dataHash
          updateCount++
          lastUpdateTime = Date.now()
        }
        
        const nodes = convertReceiverNodes(data)
        onData(nodes, data)
      } else {
        // No data available
        if (onError) {
          onError(new Error('Receiver data unavailable'))
        }
      }
    } catch (error) {
      if (onError) {
        onError(error)
      }
    }
    
    // Schedule next poll
    if (isPolling) {
      setTimeout(poll, POLL_INTERVAL_MS)
    }
  }
  
  // Start polling
  poll()
  
  // Return stop function and getUpdateRate function
  return {
    stop: () => {
      isPolling = false
    },
    getUpdateRate
  }
}
