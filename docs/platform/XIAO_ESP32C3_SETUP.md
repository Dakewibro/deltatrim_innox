# XIAO ESP32-C3 + MPU6050 Setup Guide

## What Your Code Does

### Current Architecture

**XIAO ESP32-C3 (Node):**
- Reads MPU6050 IMU data (roll/pitch angles)
- Broadcasts data via BLE as "LEECH_1", "LEECH_2", etc.
- Uses Madgwick filter for orientation estimation
- Auto-calibrates offsets on startup

**ESP32-S3 Receiver:**
- Scans for BLE devices named "LEECH_1" through "LEECH_5"
- Connects to nodes and receives angle data
- Creates WiFi AP "LEECH_RECEIVER"
- Serves data via HTTP at `/data` endpoint

## Two Options for Your Setup

### Option 1: Direct to Supabase (Recommended - Simpler)

**Skip the receiver entirely!** Modify XIAO to send directly to Supabase via WiFi.

**Pros:**
- Simpler setup (one device instead of two)
- Works with your Vercel deployment
- No receiver needed

**Cons:**
- XIAO needs WiFi connection
- Each node needs WiFi credentials

### Option 2: Use Receiver + Send to Supabase

Keep the receiver but modify it to forward data to Supabase.

**Pros:**
- Nodes don't need WiFi (just BLE)
- Centralized data collection
- Works with existing receiver code

**Cons:**
- Requires two devices (XIAO + Receiver)
- More complex setup

---

## Option 1: Direct XIAO → Supabase (Recommended)

### Hardware Connections

**XIAO ESP32-C3 to MPU6050:**
```
XIAO ESP32-C3    MPU6050
─────────────────────────
3.3V          →  VCC
GND           →  GND
SDA (GPIO6)   →  SDA
SCL (GPIO7)   →  SCL
```

**Power:**
- Connect XIAO to laptop via USB-C cable
- MPU6050 gets power from XIAO's 3.3V

### Modified XIAO Code (Direct to Supabase)

Create `platformio.ini`:
```ini
[platformio]
default_envs = node1

[env]
platform = espressif32
board = seeed_xiao_esp32c3
framework = arduino
monitor_speed = 115200
lib_deps =
  adafruit/Adafruit MPU6050
  adafruit/Adafruit Unified Sensor
  arduino-libraries/Madgwick
  bblanchon/ArduinoJson

[env:node1]
build_flags = -DNODE_ID=1

[env:node2]
build_flags = -DNODE_ID=2

[env:node3]
build_flags = -DNODE_ID=3

[env:node4]
build_flags = -DNODE_ID=4

[env:node5]
build_flags = -DNODE_ID=5
```

Create `src/main.cpp`:
```cpp
#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <MadgwickAHRS.h>

#ifndef NODE_ID
#define NODE_ID 1
#endif

// WiFi Credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Supabase Configuration
const char* SUPABASE_URL = "https://rwggzbfnyrobaehyxnhv.supabase.co";
const char* SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Z2d6YmZueXJvYmFlaHl4bmh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzU0NTMsImV4cCI6MjA4NTAxMTQ1M30.i745IiHxVSMi9VXA-kk393rk1AeN0_gA-EiqbaMGZ_k";
const char* SUPABASE_TABLE = "leech_data";

static Adafruit_MPU6050 mpu;
static Madgwick filter;

static bool offsetsReady = false;
static float rollOffset = 0.0f;
static float pitchOffset = 0.0f;
static uint32_t offsetSamples = 0;
static float rollAccum = 0.0f;
static float pitchAccum = 0.0f;

static void imuInit() {
  Wire.begin();
  Wire.setClock(400000);

  if (!mpu.begin()) {
    Serial.println("MPU6050 not found. Check connections:");
    Serial.println("  VCC -> 3.3V");
    Serial.println("  GND -> GND");
    Serial.println("  SDA -> GPIO6");
    Serial.println("  SCL -> GPIO7");
    while (true) {
      delay(1000);
      Serial.print(".");
    }
  }

  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  filter.begin(100.0f); // 100 Hz sample rate

  Serial.println("MPU6050 initialized");
}

static void wifiInit() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Connected! IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi connection failed!");
    Serial.println("Check SSID and password");
    while (true) delay(1000);
  }
}

static void sendToSupabase(uint32_t tMs, float rollDeg, float pitchDeg) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected, reconnecting...");
    wifiInit();
    return;
  }

  HTTPClient http;
  String url = String(SUPABASE_URL) + "/rest/v1/" + String(SUPABASE_TABLE);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_KEY));
  http.addHeader("Prefer", "return=minimal");

  // Create JSON payload matching your table structure
  StaticJsonDocument<512> doc;
  doc["timestamp"] = (int64_t)tMs;
  
  // Create node data object
  JsonObject nodeData = doc.createNestedObject("n" + String(NODE_ID));
  nodeData["roll"] = rollDeg;
  nodeData["pitch"] = pitchDeg;
  nodeData["ok"] = 1;
  nodeData["age_ms"] = 0;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    if (httpResponseCode == 201 || httpResponseCode == 200) {
      Serial.printf("[Node %d] Sent: roll=%.2f pitch=%.2f\n", 
                    NODE_ID, rollDeg, pitchDeg);
    } else {
      Serial.printf("[Node %d] HTTP %d\n", NODE_ID, httpResponseCode);
    }
  } else {
    Serial.printf("[Node %d] Error: %s\n", NODE_ID, http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=== XIAO ESP32-C3 Node ===");
  Serial.printf("Node ID: %d\n", NODE_ID);

  imuInit();
  wifiInit();

  Serial.println("Setup complete. Starting loop...");
}

void loop() {
  static uint32_t lastImuMs = 0;
  static uint32_t lastTxMs = 0;

  const uint32_t imuPeriodMs = 10;  // 100 Hz IMU reading
  const uint32_t txPeriodMs = 100;  // 10 Hz transmission (adjust as needed)

  uint32_t now = millis();

  // Read IMU at 100 Hz
  if (now - lastImuMs >= imuPeriodMs) {
    lastImuMs = now;

    sensors_event_t a, g, t;
    mpu.getEvent(&a, &g, &t);

    // Convert to g units and degrees
    const float g0 = 9.80665f;
    float ax = a.acceleration.x / g0;
    float ay = a.acceleration.y / g0;
    float az = a.acceleration.z / g0;

    const float rad2deg = 57.2957795f;
    float gx = g.gyro.x * rad2deg;
    float gy = g.gyro.y * rad2deg;
    float gz = g.gyro.z * rad2deg;

    // Update filter
    filter.updateIMU(gx, gy, gz, ax, ay, az);

    float rollNow = filter.getRoll();
    float pitchNow = filter.getPitch();

    // Calibrate offsets (first 100 samples)
    if (!offsetsReady) {
      rollAccum += rollNow;
      pitchAccum += pitchNow;
      offsetSamples++;

      if (offsetSamples >= 100) {
        rollOffset = rollAccum / (float)offsetSamples;
        pitchOffset = pitchAccum / (float)offsetSamples;
        offsetsReady = true;

        Serial.printf("Calibration complete. rollOffset=%.2f pitchOffset=%.2f\n",
                      rollOffset, pitchOffset);
      }
    }
  }

  // Send to Supabase at lower rate
  if (now - lastTxMs >= txPeriodMs && offsetsReady) {
    lastTxMs = now;

    float rollOut = filter.getRoll() - rollOffset;
    float pitchOut = filter.getPitch() - pitchOffset;

    sendToSupabase(now, rollOut, pitchOut);
  }

  // Check WiFi connection periodically
  static uint32_t lastWifiCheck = 0;
  if (now - lastWifiCheck >= 5000) {
    lastWifiCheck = now;
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi lost, reconnecting...");
      wifiInit();
    }
  }

  delay(1);
}
```

### Setup Steps

1. **Wire MPU6050 to XIAO:**
   - VCC → 3.3V
   - GND → GND
   - SDA → GPIO6 (SDA)
   - SCL → GPIO7 (SCL)

2. **Update WiFi credentials** in code:
   ```cpp
   const char* WIFI_SSID = "YourWiFiName";
   const char* WIFI_PASSWORD = "YourWiFiPassword";
   ```

3. **Upload code:**
   ```bash
   pio run -e node1 -t upload
   ```

4. **Monitor output:**
   ```bash
   pio device monitor
   ```

5. **Verify in Supabase:**
   - Check `leech_data` table
   - Should see rows with `n1`, `n2`, etc. populated

---

## Option 2: Receiver → Supabase

If you want to keep the receiver setup, modify the receiver code to send to Supabase instead of just serving HTTP.

### Modified Receiver Code

Add to receiver's `platformio.ini`:
```ini
lib_deps =
  h2zero/NimBLE-Arduino
  bblanchon/ArduinoJson
```

Modify receiver's `main.cpp` - add after `setupWifiAndServer()`:

```cpp
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* SUPABASE_URL = "https://rwggzbfnyrobaehyxnhv.supabase.co";
const char* SUPABASE_KEY = "your-anon-key";
const char* SUPABASE_TABLE = "leech_data";

static void sendToSupabase() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(SUPABASE_URL) + "/rest/v1/" + String(SUPABASE_TABLE);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_KEY));
  http.addHeader("Prefer", "return=minimal");

  StaticJsonDocument<1024> doc;
  doc["timestamp"] = millis();
  
  for (int i = 1; i <= 5; i++) {
    JsonObject node = doc.createNestedObject("n" + String(i));
    node["roll"] = roll_[i];
    node["pitch"] = pitch_[i];
    node["ok"] = connected_[i] ? 1 : 0;
    node["age_ms"] = (lastUpdateMs_[i] == 0) ? 999999 : (millis() - lastUpdateMs_[i]);
  }

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  http.POST(jsonPayload);
  http.end();
}
```

Then in `loop()`, add:
```cpp
static uint32_t lastSupabaseSend = 0;
if (now - lastSupabaseSend >= 100) { // Send every 100ms
  sendToSupabase();
  lastSupabaseSend = now;
}
```

---

## Testing

### Test XIAO → Supabase Connection

1. **Upload code to XIAO**
2. **Open Serial Monitor** (115200 baud)
3. **Check for:**
   - "MPU6050 initialized"
   - "Connected! IP: xxx.xxx.xxx.xxx"
   - "[Node 1] Sent: roll=X.XX pitch=X.XX"

4. **Check Supabase:**
   - Go to Table Editor → `leech_data`
   - Should see new rows appearing
   - Check `n1` (or `n2`, etc. based on NODE_ID) has data

5. **Check Your Webpage:**
   - Open your Vercel site
   - Go to Debrief page
   - Should see real-time data (not simulated)

### Troubleshooting

**MPU6050 not found:**
- Check wiring (VCC, GND, SDA, SCL)
- Verify I2C address (should be 0x68)
- Check if pull-up resistors needed (usually built into XIAO)

**WiFi connection failed:**
- Verify SSID and password
- Ensure 2.4GHz network (ESP32-C3 doesn't support 5GHz)
- Check signal strength

**Supabase not receiving data:**
- Check Serial Monitor for HTTP errors
- Verify Supabase URL and key
- Check Supabase table structure matches JSON format
- Verify RLS policies allow INSERT

**Data not appearing on webpage:**
- Check browser console for errors
- Verify Vercel environment variables are set
- Check Network tab for Supabase requests

---

## Recommended Setup

**For single node testing:** Use Option 1 (Direct to Supabase)
- Simpler
- Works immediately
- No receiver needed

**For multiple nodes (5 nodes):** 
- Option 1: Each node sends to Supabase (requires WiFi for each)
- Option 2: Use receiver to collect all nodes, then send to Supabase

---

## Next Steps

1. Choose your option (I recommend Option 1 for simplicity)
2. Wire MPU6050 to XIAO
3. Update WiFi credentials
4. Upload code
5. Verify data in Supabase
6. Check your webpage shows real-time data

Need help with any specific step?
