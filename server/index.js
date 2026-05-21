import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import http from 'http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'))
    }
  }
})

// In-memory storage for boat data (in production, use a database)
let boatData = {
  boat1: [
    { x: 0, y: 0 },
    { x: 2, y: -1 },
    { x: 5, y: -2 },
    { x: 4, y: -3 },
    { x: 1, y: -4 }
  ],
  boat2: [
    { x: 0, y: 0 },
    { x: 6.75, y: -1 },
    { x: 7, y: -2 },
    { x: 4.5, y: -3 },
    { x: 2, y: -4 }
  ],
  boat3: [
    { x: 0, y: 0 },
    { x: 1, y: -1 },
    { x: 3, y: -2 },
    { x: 5, y: -3 },
    { x: 2, y: -4 }
  ],
  boat4: [
    { x: 0, y: 0 },
    { x: 3, y: -1 },
    { x: 5.5, y: -2 },
    { x: 5.5, y: -3 },
    { x: 6, y: -4 }
  ]
}

// In-memory storage for images
let images = []

// API Routes

// Get all boat data
app.get('/api/boats', (req, res) => {
  res.json(boatData)
})

// Update boat data
app.post('/api/boats/:boatId', (req, res) => {
  const { boatId } = req.params
  const { data } = req.body

  if (boatData[boatId]) {
    boatData[boatId] = data
    res.json({ success: true, message: `Boat ${boatId} data updated` })
  } else {
    res.status(404).json({ success: false, message: 'Boat not found' })
  }
})

// Get all images
app.get('/api/images', (req, res) => {
  const imageList = images.map(img => ({
    id: img.id,
    name: img.name,
    url: `/uploads/${img.filename}`
  }))
  res.json({ images: imageList })
})

// Upload image
app.post('/api/images/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' })
  }

  const newImage = {
    id: images.length + 1,
    name: req.file.originalname,
    filename: req.file.filename,
    uploadedAt: new Date().toISOString()
  }

  images.push(newImage)

  res.json({
    success: true,
    image: {
      id: newImage.id,
      name: newImage.name,
      url: `/uploads/${newImage.filename}`
    }
  })
})

// Delete image
app.delete('/api/images/:id', (req, res) => {
  const { id } = req.params
  const imageIndex = images.findIndex(img => img.id === parseInt(id))

  if (imageIndex === -1) {
    return res.status(404).json({ success: false, message: 'Image not found' })
  }

  const image = images[imageIndex]
  const filePath = path.join(uploadsDir, image.filename)

  // Delete file from filesystem
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }

  // Remove from array
  images.splice(imageIndex, 1)

  res.json({ success: true, message: 'Image deleted' })
})

// AI Prompt endpoint
app.post('/api/ai/prompt', (req, res) => {
  const { prompt } = req.body

  if (!prompt) {
    return res.status(400).json({ success: false, message: 'Prompt is required' })
  }

  // In a real application, this would call an AI service
  // For now, just return a mock response
  setTimeout(() => {
    res.json({
      success: true,
      response: `Processing your request: "${prompt}". This is a mock response. In production, this would connect to an AI service.`
    })
  }, 1000)
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ESP32 Receiver Data Proxy
// Proxies requests to ESP32-S3 receiver to handle CORS issues
// Receiver format: {"ms": millis(), "nodes": [{"id": 1, "connected": true, "age_ms": 50, "roll": 1.23, "pitch": 4.56}, ...]}
app.get('/api/esp32/data', (req, res) => {
  const ESP32_IP = process.env.ESP32_IP || '192.168.4.1'
  const ESP32_PORT = 80
  
  const options = {
    hostname: ESP32_IP,
    port: ESP32_PORT,
    path: '/api', // Receiver's JSON API endpoint
    method: 'GET',
    timeout: 2000
  }
  
  const proxyReq = http.request(options, (proxyRes) => {
    let data = ''
    
    proxyRes.on('data', (chunk) => {
      data += chunk
    })
    
    proxyRes.on('end', () => {
      try {
        const jsonData = JSON.parse(data)
        res.json(jsonData)
      } catch (error) {
        console.warn('Failed to parse receiver response:', error.message)
        res.status(500).json({ error: 'Invalid JSON from receiver' })
      }
    })
  })
  
  proxyReq.on('error', (error) => {
    console.warn('Receiver proxy error:', error.message)
    // Return empty data structure if receiver is unreachable
    res.json({
      ms: Date.now(),
      nodes: [
        { id: 1, connected: false, age_ms: 999999, roll: 0, pitch: 0 },
        { id: 2, connected: false, age_ms: 999999, roll: 0, pitch: 0 },
        { id: 3, connected: false, age_ms: 999999, roll: 0, pitch: 0 },
        { id: 4, connected: false, age_ms: 999999, roll: 0, pitch: 0 },
        { id: 5, connected: false, age_ms: 999999, roll: 0, pitch: 0 }
      ]
    })
  })
  
  proxyReq.on('timeout', () => {
    proxyReq.destroy()
    console.warn('Receiver proxy timeout')
    res.json({
      ms: Date.now(),
      nodes: [
        { id: 1, connected: false, age_ms: 999999, roll: 0, pitch: 0 },
        { id: 2, connected: false, age_ms: 999999, roll: 0, pitch: 0 },
        { id: 3, connected: false, age_ms: 999999, roll: 0, pitch: 0 },
        { id: 4, connected: false, age_ms: 999999, roll: 0, pitch: 0 },
        { id: 5, connected: false, age_ms: 999999, roll: 0, pitch: 0 }
      ]
    })
  })
  
  proxyReq.setTimeout(2000)
  proxyReq.end()
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`API endpoints available at http://localhost:${PORT}/api`)
  console.log(`ESP32 proxy: http://localhost:${PORT}/api/esp32/data`)
})