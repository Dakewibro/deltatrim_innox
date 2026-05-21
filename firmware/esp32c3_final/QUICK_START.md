# Quick Start Guide - Single IMU Sensor

## 5-Minute Setup

### Step 1: Wire the Sensor (2 minutes)

```
MPU6050 → XIAO ESP32-C3
VCC     → 3.3V
GND     → GND
SDA     → GPIO6
SCL     → GPIO7
```

Connect XIAO to laptop via USB-C.

### Step 2: Configure WiFi (1 minute)

Open `src/main.cpp` and change:
```cpp
const char* WIFI_SSID = "YourWiFiName";
const char* WIFI_PASSWORD = "YourPassword";
```

### Step 3: Upload Code (1 minute)

```bash
cd firmware/esp32c3_final
pio run -t upload
pio device monitor
```

### Step 4: Verify (1 minute)

**In Serial Monitor, you should see:**
```
✓ MPU6050 initialized successfully
✓ WiFi connected! IP: 192.168.1.xxx
✓ Calibration complete!
[timestamp] Sent: roll=X.XX° pitch=X.XX°
```

**In Supabase:**
- Go to Table Editor → `leech_data`
- Should see new rows with `n1` data

**On Your Website:**
- Open Debrief page
- Should see real-time leech curve (not "Simulated Data")

## That's It! 🎉

Your sensor is now sending data to your website in real-time.

## Troubleshooting

**No data?** Check:
1. Serial Monitor for errors
2. WiFi credentials correct
3. Supabase table has data
4. Vercel environment variables set

See `README.md` for detailed troubleshooting.
