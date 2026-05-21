# ESP32-S3 Receiver Local Development Setup

## Overview

The ESP32-S3 receiver visualization has been integrated into the DELTATRIM web app. This guide explains how to set up and use it for local development.

## Architecture

```
ESP32-S3 Receiver (AP Mode)
    ↓ (WiFi: LEECH_RECEIVER)
Laptop (connected to receiver WiFi)
    ↓ (HTTP: 192.168.4.1/api)
Backend Proxy (localhost:3001)
    ↓ (HTTP: /api/esp32/data)
Frontend (localhost:3000)
    ↓ (React Component)
ReceiverVisualization Component
```

## Prerequisites

1. **ESP32-S3 Receiver** with firmware uploaded
2. **XIAO ESP32-C3 Node** with sensor (optional, for testing)
3. **Laptop** with Node.js installed
4. **WiFi connection** to receiver's AP

## Setup Steps

### 1. Receiver Firmware (ESP32-S3)

**IMPORTANT**: Add CORS headers to the receiver's `/api` endpoint.

In the receiver firmware, locate the `handleApi()` function and add these 2 lines **before** `server.send()`:

```cpp
static void handleApi() {
  // ... build JSON response ...
  
  // ADD THESE 2 LINES:
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET");
  
  server.send(200, "application/json", jsonStr);
}
```

**Everything else in the receiver firmware stays unchanged.**

### 2. Connect to Receiver WiFi

1. Power on the ESP32-S3 receiver
2. On your laptop, connect to WiFi network:
   - **SSID**: `LEECH_RECEIVER`
   - **Password**: `12345678`
3. Verify connection (receiver IP: `192.168.4.1`)

### 3. Start Backend Server

Open Terminal 1:

```bash
cd "/Users/Deaptheror/Downloads/DeltaTrim figma UI"
npm run server
```

You should see:
```
Server running on http://localhost:3001
ESP32 proxy: http://localhost:3001/api/esp32/data
```

### 4. Start Frontend Development Server

Open Terminal 2:

```bash
cd "/Users/Deaptheror/Downloads/DeltaTrim figma UI"
npm run dev
```

You should see:
```
Local: http://localhost:3000
```

### 5. Open Web App

1. Open browser to `http://localhost:3000`
2. Navigate to **Live Dashboard** (from sidebar)
3. You should see the **Receiver Data** visualization component

## What You Should See

### Receiver Visualization Component

The component displays:

1. **Header**:
   - Title: "Receiver Data"
   - Connection status: ● CONNECTED / ○ NO DATA
   - Update rate: X.X Hz

2. **Tilt Box**:
   - Grid background with crosshairs
   - Moving point showing roll/pitch position
   - Labels: "Pitch +/-" and "Roll + →"

3. **Chart**:
   - Roll line (solid, teal)
   - Pitch line (dashed, teal)
   - Y-axis: ±45 degrees
   - Rolling buffer: 48 points (~10 seconds)

4. **Node Status Table**:
   - Columns: Node, Status, Age (ms), Roll, Pitch
   - Status indicators: ● CONNECTED (green) or ○ NO DATA (red)

## Troubleshooting

### "NO DATA" Status

**Possible causes:**
1. **Not connected to LEECH_RECEIVER WiFi**
   - Check WiFi connection
   - Verify SSID is "LEECH_RECEIVER"

2. **Backend server not running**
   - Check Terminal 1 for errors
   - Verify `npm run server` is running

3. **Receiver not powered on**
   - Check ESP32-S3 power LED
   - Verify receiver is creating WiFi AP

4. **CORS headers not added**
   - Check receiver firmware has CORS headers
   - Verify `handleApi()` function includes the 2 lines

5. **Receiver IP incorrect**
   - Default: `192.168.4.1`
   - Can be changed via `ESP32_IP` environment variable

6. **Receiver on but no data from leech node / nothing in serial monitor**
   - See **`RECEIVER_NODE_TROUBLESHOOTING.md`** for BLE connection, correct XIAO firmware (BLE node vs WiFi/Supabase), serial port, and baud rate.

### Backend Proxy Errors

Check Terminal 1 for error messages:
- `Receiver proxy error: ...` - Receiver unreachable
- `Failed to parse receiver response` - Invalid JSON from receiver

**Solutions:**
- Verify receiver is at `192.168.4.1`
- Check receiver's `/api` endpoint returns valid JSON
- Test receiver directly: `http://192.168.4.1/api` in browser

### Frontend Not Updating

**Check:**
1. Browser console for errors (F12 → Console)
2. Network tab for failed requests
3. Update rate should show > 0.0 Hz when connected

## Testing Without Receiver

If you don't have the receiver connected, the component will:
- Show "NO DATA" status
- Display empty node table (all nodes disconnected)
- Show 0.0 Hz update rate
- Tilt box point at center (0, 0)
- Chart empty (no data points)

This is expected behavior and allows you to develop/test the UI without hardware.

## Data Format

The receiver sends data in this format:

```json
{
  "ms": 12345,
  "nodes": [
    {"id": 1, "connected": true, "age_ms": 50, "roll": 1.23, "pitch": 4.56},
    {"id": 2, "connected": false, "age_ms": 999999, "roll": 0, "pitch": 0},
    ...
  ]
}
```

## Files Created/Modified

### New Files:
- `src/components/ReceiverVisualization.jsx` - Main visualization component
- `src/components/ReceiverVisualization.css` - Component styles
- `src/utils/receiverDataService.js` - Data fetching and polling service

### Modified Files:
- `src/pages/Dashboard.jsx` - Added ReceiverVisualization component
- `server/index.js` - Updated `/api/esp32/data` proxy to use receiver's `/api` endpoint

## Next Steps

1. **Test with real receiver**: Connect XIAO node and verify data appears
2. **Verify visualization**: Check tilt box moves, chart updates, table shows data
3. **Check design**: Ensure colors match DELTATRIM theme (#0a0e1a, #141920, #00d4aa)
4. **Future**: When ready for Vercel deployment, add Supabase support (see plan)

## Support

If you encounter issues:
1. Check browser console (F12)
2. Check backend server logs (Terminal 1)
3. Verify receiver firmware has CORS headers
4. Test receiver directly: `http://192.168.4.1/api` in browser
