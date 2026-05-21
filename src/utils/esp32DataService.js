/**
 * ESP32 Data Service
 * Handles fetching and processing data from ESP32 receiver
 * Supports both direct ESP32 AP connection and cloud services (Supabase/Firebase)
 */

// Default ESP32 AP IP (typically 192.168.4.1) - for local development
const ESP32_DEFAULT_IP = '192.168.4.1'
const ESP32_DATA_ENDPOINT = '/data'
const POLL_INTERVAL_MS = 50 // Match ESP32 HTML refresh rate

// Supabase Configuration (for Vercel deployment)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const SUPABASE_TABLE = 'leech_data'
const USE_SUPABASE = SUPABASE_URL && SUPABASE_KEY // Auto-detect if Supabase is configured

/**
 * Convert ESP32 JSON format to component-friendly format
 * @param {Object} esp32Data - Raw ESP32 data: {"t": millis(), "n1": {...}, ...}
 * @returns {Array} Array of node data: [{nodeId, roll, pitch, connected, age}, ...]
 */
export const convertESP32Data = (esp32Data) => {
  const nodes = []
  
  for (let i = 1; i <= 5; i++) {
    const nodeKey = `n${i}`
    const nodeData = esp32Data[nodeKey]
    
    if (nodeData) {
      nodes.push({
        nodeId: i,
        roll: nodeData.roll || 0,
        pitch: nodeData.pitch || 0,
        connected: nodeData.ok === 1,
        age: nodeData.age_ms || 0
      })
    } else {
      // Node not present in data
      nodes.push({
        nodeId: i,
        roll: 0,
        pitch: 0,
        connected: false,
        age: 999999
      })
    }
  }
  
  return nodes
}

/**
 * Fetch data from ESP32 directly (may have CORS issues)
 * @param {string} esp32IP - IP address of ESP32 AP
 * @returns {Promise<Object>} ESP32 data or null if error
 */
export const fetchESP32DataDirect = async (esp32IP = ESP32_DEFAULT_IP) => {
  try {
    const url = `http://${esp32IP}${ESP32_DATA_ENDPOINT}`
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.warn('Direct ESP32 fetch failed:', error.message)
    return null
  }
}

/**
 * Fetch data from backend proxy (recommended, handles CORS)
 * @returns {Promise<Object>} ESP32 data or null if error
 */
export const fetchESP32DataProxy = async () => {
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
    console.warn('Proxy ESP32 fetch failed:', error.message)
    return null
  }
}

/**
 * Fetch ESP32 data (tries proxy first, falls back to direct)
 * @param {string} esp32IP - IP address of ESP32 AP (for direct fallback)
 * @returns {Promise<Object>} ESP32 data or null if both methods fail
 */
export const fetchESP32Data = async (esp32IP = ESP32_DEFAULT_IP) => {
  // Try proxy first (handles CORS better)
  let data = await fetchESP32DataProxy()
  
  // Fallback to direct if proxy fails
  if (!data) {
    data = await fetchESP32DataDirect(esp32IP)
  }
  
  return data
}

/**
 * Fetch latest data from Supabase
 * @returns {Promise<Object>} ESP32-formatted data or null
 */
export const fetchSupabaseData = async () => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return null
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?order=timestamp.desc&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    if (data.length === 0) return null
    
    // Convert Supabase format to ESP32 format
    const latest = data[0]
    return {
      t: latest.timestamp,
      n1: latest.n1,
      n2: latest.n2,
      n3: latest.n3,
      n4: latest.n4,
      n5: latest.n5
    }
  } catch (error) {
    console.warn('Supabase fetch failed:', error)
    return null
  }
}

/**
 * Create a polling service for ESP32 data
 * Automatically uses Supabase if configured, otherwise falls back to direct ESP32 connection
 * @param {Function} onData - Callback when new data arrives
 * @param {Function} onError - Callback on error
 * @param {string} esp32IP - IP address of ESP32 AP (for local fallback)
 * @returns {Function} Function to stop polling
 */
export const createESP32Polling = (onData, onError, esp32IP = ESP32_DEFAULT_IP) => {
  let isPolling = true
  let lastDataHash = null
  let lastTimestamp = null
  
  const poll = async () => {
    if (!isPolling) return
    
    try {
      let data = null
      
      // Try Supabase first if configured
      if (USE_SUPABASE) {
        data = await fetchSupabaseData()
        
        // If Supabase fails, fall back to direct ESP32 (for local dev)
        if (!data) {
          data = await fetchESP32Data(esp32IP)
        }
      } else {
        // Direct ESP32 connection (local development)
        data = await fetchESP32Data(esp32IP)
      }
      
      if (data) {
        // Create hash to detect changes
        const dataHash = JSON.stringify(data)
        const currentTimestamp = data.t
        
        // Only call onData if data actually changed
        if (dataHash !== lastDataHash || currentTimestamp !== lastTimestamp) {
          lastDataHash = dataHash
          lastTimestamp = currentTimestamp
          const convertedData = convertESP32Data(data)
          onData(convertedData, data)
        }
      } else {
        // No data available, but not necessarily an error
        if (onError) {
          onError(new Error('ESP32 data unavailable'))
        }
      }
    } catch (error) {
      if (onError) {
        onError(error)
      }
    }
    
    // Schedule next poll
    if (isPolling) {
      setTimeout(poll, USE_SUPABASE ? 100 : POLL_INTERVAL_MS) // Supabase: 100ms, Direct: 50ms
    }
  }
  
  // Start polling
  poll()
  
  // Return stop function
  return () => {
    isPolling = false
  }
}

/**
 * Check if ESP32 is reachable
 * @param {string} esp32IP - IP address of ESP32 AP
 * @returns {Promise<boolean>} True if ESP32 is reachable
 */
export const checkESP32Connection = async (esp32IP = ESP32_DEFAULT_IP) => {
  try {
    const data = await fetchESP32Data(esp32IP)
    return data !== null
  } catch (error) {
    return false
  }
}
