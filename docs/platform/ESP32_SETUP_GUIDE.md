# XIAO ESP32 Setup Guide for Real-Time Data to Vercel

## Overview

This guide covers connecting XIAO ESP32 with sensor nodes and streaming real-time data to your Vercel-deployed platform. Since Vercel is serverless, we need a cloud intermediary service.

## Architecture

```
Sensor Nodes (BLE) → XIAO ESP32 → WiFi → Cloud Service → Vercel Frontend
```

**Recommended Cloud Services:**
1. **Supabase** (Recommended) - Free tier, real-time subscriptions
2. **Firebase Realtime Database** - Free tier, WebSocket support
3. **Custom WebSocket Server** - More control, requires hosting

---

## Step 1: Hardware Setup

### 1.1 Connect Sensor Nodes to XIAO ESP32

**Sensor Node Requirements:**
- Each node should have BLE capability
- Nodes should broadcast as "LEECH_1", "LEECH_2", etc.
- Each node sends `AnglesPacket` with: `node_id`, `t_ms`, `roll_deg`, `pitch_deg`

**XIAO ESP32 Setup:**
1. Power XIAO ESP32 via USB or battery
2. Ensure antenna is properly connected
3. Verify BLE scanning works (test with existing receiver code)

### 1.2 Test BLE Connection

Upload a test sketch to verify nodes are discoverable:
```cpp
#include <NimBLEDevice.h>

void setup() {
  Serial.begin(115200);
  NimBLEDevice::init("");
  NimBLEScan* scan = NimBLEDevice::getScan();
  scan->setActiveScan(true);
  scan->start(5, false);
  
  int count = scan->getCount();
  Serial.printf("Found %d devices\n", count);
  
  for(int i = 0; i < count; i++) {
    NimBLEAdvertisedDevice device = scan->getDevice(i);
    Serial.printf("Device: %s\n", device.getName().c_str());
  }
}
```

---

## Step 2: ESP32 Code Modifications

### 2.1 Option A: Using Supabase (Recommended)

**Install Required Libraries:**
```cpp
// In Arduino IDE: Tools → Manage Libraries
// Install: ArduinoJson, WiFi, HTTPClient
```

**Modified ESP32 Code:**
```cpp
#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <NimBLEDevice.h>

// WiFi Credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Supabase Configuration
const char* SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const char* SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";
const char* SUPABASE_TABLE = "leech_data"; // Create this table

// BLE Configuration (same as before)
static const char* SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
static const char* ANGLES_UUID  = "12345678-1234-1234-1234-1234567890ac";

// Data storage (same as before)
static float roll_[6] = {0};
static float pitch_[6] = {0};
static uint32_t lastUpdateMs_[6] = {0};
static bool connected_[6] = {false};

// Send data to Supabase
void sendToSupabase() {
  HTTPClient http;
  http.begin(String(SUPABASE_URL) + "/rest/v1/" + SUPABASE_TABLE);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_KEY));
  http.addHeader("Prefer", "return=minimal");
  
  // Create JSON payload
  StaticJsonDocument<1024> doc;
  doc["timestamp"] = millis();
  
  for (int i = 1; i <= 5; i++) {
    String nodeKey = "n" + String(i);
    JsonObject node = doc.createNestedObject(nodeKey);
    node["roll"] = roll_[i];
    node["pitch"] = pitch_[i];
    node["ok"] = connected_[i] ? 1 : 0;
    node["age_ms"] = (lastUpdateMs_[i] == 0) ? 999999 : (millis() - lastUpdateMs_[i]);
  }
  
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  int httpResponseCode = http.POST(jsonPayload);
  
  if (httpResponseCode > 0) {
    Serial.printf("Sent to Supabase: %d\n", httpResponseCode);
  } else {
    Serial.printf("Error: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  
  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Connect to WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected! IP: ");
  Serial.println(WiFi.localIP());
  
  // Initialize BLE (same as before)
  NimBLEDevice::init("LEECH_RECEIVER");
  NimBLEDevice::setPower(ESP_PWR_LVL_P9);
  
  // Scan and connect to nodes (use your existing scanAndConnectMissing function)
  scanAndConnectMissing(3);
}

void loop() {
  // Handle BLE updates (same as before)
  // ... your existing BLE code ...
  
  // Send to Supabase every 100ms (adjust as needed)
  static uint32_t lastSend = 0;
  if (millis() - lastSend >= 100) {
    sendToSupabase();
    lastSend = millis();
  }
  
  // Rescan for missing nodes every 5 seconds
  static uint32_t lastRescan = 0;
  if (millis() - lastRescan >= 5000) {
    // Check for disconnected nodes and rescan
    scanAndConnectMissing(2);
    lastRescan = millis();
  }
  
  delay(10);
}
```

### 2.2 Option B: Using Firebase Realtime Database

**Install FirebaseESP32 Library:**
```cpp
// Install: Firebase ESP32 Client by Mobizt
```

**Firebase Code Snippet:**
```cpp
#include <FirebaseESP32.h>

#define FIREBASE_HOST "YOUR_PROJECT.firebaseio.com"
#define FIREBASE_AUTH "YOUR_FIREBASE_SECRET"

FirebaseData firebaseData;

void sendToFirebase() {
  FirebaseJson json;
  json.set("t", millis());
  
  for (int i = 1; i <= 5; i++) {
    String path = "/n" + String(i);
    json.set(path + "/roll", roll_[i]);
    json.set(path + "/pitch", pitch_[i]);
    json.set(path + "/ok", connected_[i] ? 1 : 0);
    json.set(path + "/age_ms", (lastUpdateMs_[i] == 0) ? 999999 : (millis() - lastUpdateMs_[i]));
  }
  
  Firebase.setJSON(firebaseData, "/leech_data/latest", json);
}
```

### 2.3 Option C: Custom WebSocket Server

If you prefer more control, set up a WebSocket server (Node.js, Python, etc.) that:
1. Receives data from ESP32
2. Broadcasts to connected clients
3. Stores latest data for new connections

---

## Step 3: Supabase Setup (Recommended)

### 3.1 Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Note your project URL and anon key

### 3.2 Create Database Table

Run this SQL in Supabase SQL Editor:

```sql
CREATE TABLE leech_data (
  id BIGSERIAL PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  n1 JSONB,
  n2 JSONB,
  n3 JSONB,
  n4 JSONB,
  n5 JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast latest query
CREATE INDEX idx_leech_data_timestamp ON leech_data(timestamp DESC);

-- Enable Row Level Security (optional, for public access)
ALTER TABLE leech_data ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access" ON leech_data
  FOR SELECT USING (true);

-- Create policy for insert (ESP32 will use anon key)
CREATE POLICY "Public insert access" ON leech_data
  FOR INSERT WITH CHECK (true);
```

### 3.3 Enable Realtime (Optional)

For real-time subscriptions:
```sql
-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE leech_data;
```

---

## Step 4: Update Frontend for Vercel

### 4.1 Update esp32DataService.js

Replace the service to fetch from Supabase instead of ESP32 directly:

```javascript
// src/utils/esp32DataService.js

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const SUPABASE_TABLE = 'leech_data'

/**
 * Fetch latest data from Supabase
 */
export const fetchSupabaseData = async () => {
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
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
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
 * Subscribe to real-time updates (if realtime enabled)
 */
export const subscribeSupabaseRealtime = (onData) => {
  // Use Supabase realtime client
  // See: https://supabase.com/docs/reference/javascript/subscribe
}

/**
 * Create polling service for Supabase
 */
export const createSupabasePolling = (onData, onError) => {
  let isPolling = true
  let lastTimestamp = null
  
  const poll = async () => {
    if (!isPolling) return
    
    try {
      const data = await fetchSupabaseData()
      
      if (data && data.t !== lastTimestamp) {
        lastTimestamp = data.t
        const convertedData = convertESP32Data(data)
        onData(convertedData, data)
      }
    } catch (error) {
      if (onError) onError(error)
    }
    
    if (isPolling) {
      setTimeout(poll, 100) // Poll every 100ms
    }
  }
  
  poll()
  return () => { isPolling = false }
}
```

### 4.2 Update LeechProfile3D Component

Modify to use Supabase polling:

```javascript
// In LeechProfile3D.jsx, replace createESP32Polling with:
import { createSupabasePolling } from '../utils/esp32DataService'

// In useEffect:
const stopPolling = createSupabasePolling(
  (nodes, rawData) => {
    setEsp32Nodes(nodes)
    const connected = nodes.filter(n => n.connected).length
    setConnectionStatus({ connected, total: 5 })
    setError(null)
  },
  (err) => {
    setError(err.message)
    if (esp32Nodes.length === 0) {
      setUseSimulated(true)
    }
  }
)
```

### 4.3 Environment Variables for Vercel

Create `.env.local` (for local dev):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## Step 5: Testing & Troubleshooting

### 5.1 Test ESP32 → Cloud Connection

1. Upload modified ESP32 code
2. Open Serial Monitor (115200 baud)
3. Verify WiFi connection
4. Check Supabase table for incoming data

### 5.2 Test Frontend → Cloud Connection

1. Check browser console for errors
2. Verify environment variables are set
3. Test Supabase connection in Network tab

### 5.3 Common Issues

**ESP32 won't connect to WiFi:**
- Check SSID/password
- Ensure 2.4GHz network (ESP32 doesn't support 5GHz)
- Check signal strength

**Data not appearing in Supabase:**
- Verify API key is correct
- Check RLS policies allow insert
- Monitor Supabase logs

**Frontend shows "Simulated Data":**
- Check environment variables in Vercel
- Verify Supabase URL/key are correct
- Check browser console for CORS/API errors

**Latency issues:**
- Reduce polling interval (but not too aggressive)
- Use Supabase Realtime subscriptions instead of polling
- Consider WebSocket for lower latency

---

## Step 6: Optimization for Production

### 6.1 Reduce Data Frequency

Only send when data changes significantly:
```cpp
void sendToSupabase() {
  static float lastRoll[6] = {0};
  static float lastPitch[6] = {0};
  
  bool hasChange = false;
  for (int i = 1; i <= 5; i++) {
    if (abs(roll_[i] - lastRoll[i]) > 0.5 || 
        abs(pitch_[i] - lastPitch[i]) > 0.5) {
      hasChange = true;
      lastRoll[i] = roll_[i];
      lastPitch[i] = pitch_[i];
    }
  }
  
  if (hasChange) {
    // Send data
  }
}
```

### 6.2 Error Recovery

Add retry logic and connection monitoring:
```cpp
int sendRetries = 0;
const int MAX_RETRIES = 3;

void sendToSupabase() {
  // ... send code ...
  if (httpResponseCode <= 0 && sendRetries < MAX_RETRIES) {
    sendRetries++;
    delay(1000);
    sendToSupabase(); // Retry
  } else {
    sendRetries = 0;
  }
}
```

### 6.3 Battery Optimization

If battery-powered:
- Increase send interval to 500ms-1000ms
- Use deep sleep between sends
- Reduce BLE scan frequency

---

## Summary Checklist

- [ ] Hardware: XIAO ESP32 powered and antenna connected
- [ ] Hardware: Sensor nodes broadcasting BLE correctly
- [ ] ESP32: Modified code uploaded with WiFi credentials
- [ ] ESP32: BLE scanning and connection working
- [ ] Cloud: Supabase project created and configured
- [ ] Cloud: Database table created with proper schema
- [ ] Cloud: RLS policies configured for public access
- [ ] Frontend: esp32DataService.js updated for Supabase
- [ ] Frontend: LeechProfile3D component updated
- [ ] Vercel: Environment variables configured
- [ ] Testing: ESP32 sending data to Supabase verified
- [ ] Testing: Frontend receiving real-time data verified
- [ ] Production: Error handling and retry logic added

---

## Next Steps

1. Start with Supabase setup (easiest)
2. Test ESP32 → Supabase connection locally
3. Deploy frontend to Vercel with environment variables
4. Monitor and optimize based on real-world usage

For questions or issues, check:
- Supabase logs in dashboard
- ESP32 Serial Monitor output
- Browser console and Network tab
- Vercel function logs
