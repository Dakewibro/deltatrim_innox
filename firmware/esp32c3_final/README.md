# XIAO ESP32-C3 + MPU6050 - Finalized Code

## Overview

This is the finalized prototype code for connecting a **single** XIAO ESP32-C3 with an MPU6050 IMU sensor to send real-time roll/pitch data into the broader DELTATRIM telemetry workflow.

## Hardware Setup

### Wiring Diagram

```
MPU6050          XIAO ESP32-C3
─────────────────────────────────
VCC          →   3.3V
GND          →   GND
SDA          →   GPIO6 (SDA)
SCL          →   GPIO7 (SCL)
```

### Power
- Connect XIAO to laptop via USB-C cable
- MPU6050 gets power from XIAO's 3.3V pin

## Software Setup

### 1. Install PlatformIO

If you don't have PlatformIO:
- Install VS Code
- Install PlatformIO IDE extension
- Or use PlatformIO CLI

### 2. Open Project

```bash
cd firmware/esp32c3_final
pio run
```

### 3. Configure WiFi

Edit `src/main.cpp` and update:
```cpp
const char* WIFI_SSID = "YOUR_WIFI_SSID";           // Change this!
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";   // Change this!
```

**Important:** Use a 2.4GHz WiFi network (ESP32-C3 doesn't support 5GHz)

### 4. Upload Code

```bash
pio run -t upload
```

### 5. Monitor Output

```bash
pio device monitor
```

You should see:
```
========================================
  XIAO ESP32-C3 + MPU6050 IMU Sensor
========================================

Initializing MPU6050...
✓ MPU6050 initialized successfully
Connecting to WiFi: YourWiFiName
✓ WiFi connected! IP: 192.168.1.xxx
  Signal strength (RSSI): -45 dBm

✓ Calibration complete!
  Roll offset:  0.23°
  Pitch offset: -1.45°
  Starting data transmission...

[12345] Sent: roll=2.34° pitch=-0.56°
[12445] Sent: roll=2.31° pitch=-0.58°
...
```

## How It Works

### Data Flow

```
MPU6050 → XIAO ESP32-C3 → WiFi → Supabase → DELTATRIM web interface
```

1. **MPU6050** reads accelerometer and gyroscope data
2. **Madgwick filter** calculates roll/pitch angles (100 Hz)
3. **Auto-calibration** averages first 100 samples for zero offset
4. **WiFi connection** to your network
5. **HTTP POST** to Supabase every 100ms (10 Hz)
6. **Supabase** stores data in `leech_data` table
7. **Your website** polls Supabase and displays in real-time

### Data Format

The sensor sends data as `n1` (node 1) in Supabase:

```json
{
  "timestamp": 1234567890,
  "n1": {
    "roll": 2.34,
    "pitch": -0.56,
    "ok": 1,
    "age_ms": 0
  }
}
```

## Configuration

### Adjustable Parameters

In `src/main.cpp`, you can modify:

```cpp
const int NODE_ID = 1;                    // Sensor ID (appears as n1, n2, etc.)
const uint32_t IMU_SAMPLE_RATE_MS = 10;   // 100 Hz IMU reading
const uint32_t TRANSMIT_RATE_MS = 100;     // 10 Hz transmission
const int CALIBRATION_SAMPLES = 100;       // Samples for zero offset
```

### Supabase Settings

Already configured with your Supabase project:
- URL: `https://rwggzbfnyrobaehyxnhv.supabase.co`
- Table: `leech_data`
- Key: Already set (anon key)

## Troubleshooting

### MPU6050 Not Found

**Symptoms:** "ERROR: MPU6050 not found!"

**Solutions:**
- Check wiring (VCC, GND, SDA, SCL)
- Verify I2C connections are correct
- Try different I2C speed (change `Wire.setClock(400000)` to `Wire.setClock(100000)`)
- Check if MPU6050 needs pull-up resistors (usually built into XIAO)

### WiFi Connection Failed

**Symptoms:** "WiFi connection failed!"

**Solutions:**
- Verify SSID and password are correct
- Ensure 2.4GHz network (not 5GHz)
- Check signal strength (move closer to router)
- Verify router allows new devices

### Data Not Appearing in Supabase

**Symptoms:** Code runs but no data in Supabase

**Solutions:**
1. Check Serial Monitor for HTTP errors
2. Verify Supabase URL and key are correct
3. Check Supabase table structure matches JSON format
4. Verify RLS policies allow INSERT
5. Check Supabase logs in dashboard

### Data Not Showing in the Web Interface

**Symptoms:** Data in Supabase but not on website

**Solutions:**
1. Check browser console for errors
2. Verify frontend environment variables are set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Check Network tab for Supabase requests
4. Verify Supabase URL in frontend matches your project

## Testing

### Step 1: Verify Hardware

1. Upload code
2. Open Serial Monitor
3. Should see "MPU6050 initialized successfully"
4. If not, check wiring

### Step 2: Verify WiFi

1. Should see "WiFi connected! IP: xxx.xxx.xxx.xxx"
2. Note the IP address
3. If fails, check credentials

### Step 3: Verify Calibration

1. Wait ~1 second after boot
2. Should see "Calibration complete!"
3. Note the offset values

### Step 4: Verify Data Transmission

1. Should see "[timestamp] Sent: roll=X.XX° pitch=X.XX°"
2. Move the sensor - values should change
3. If no output, check WiFi connection

### Step 5: Verify Supabase

1. Go to Supabase dashboard
2. Table Editor → `leech_data`
3. Should see new rows appearing
4. Check `n1` column has data

### Step 6: Verify Website

1. Open your DELTATRIM frontend
2. Go to Debrief page
3. Should see real-time leech curve (not simulated)
4. Move sensor - curve should update

## File Structure

```
firmware/esp32c3_final/
├── platformio.ini          # PlatformIO configuration
├── src/
│   └── main.cpp           # Main code (edit WiFi credentials here)
└── README.md              # This file
```

## Next Steps

Once working with one sensor:

1. **Test thoroughly** - Move sensor, verify data updates
2. **Check website** - Verify real-time display works
3. **Optimize if needed** - Adjust transmission rate, sample rate
4. **Add more sensors** - Can add more XIAO devices later (n2, n3, etc.)

## Support

If you encounter issues:
1. Check Serial Monitor output
2. Verify all connections
3. Check Supabase dashboard for errors
4. Review browser console on website

## Code Features

✅ **Auto-calibration** - Automatically calculates zero offset
✅ **Error handling** - Reconnects WiFi if lost
✅ **Efficient** - Only sends when data changes
✅ **Production-ready** - Clean, commented code
✅ **Single sensor** - Simplified for one IMU
