# How to Flash/Upload Code to ESP32-C3

## Quick Method: Using PlatformIO in VS Code

### Step 1: Open the Project
1. **Open VS Code**
2. **File → Open Folder**
3. Navigate to: `firmware/esp32c3_final`
4. Click "Open"

### Step 2: Connect ESP32
1. **Connect XIAO ESP32-C3** to laptop via USB-C cable
2. Wait a few seconds for computer to recognize it

### Step 3: Flash/Upload

**Method A: Using PlatformIO Toolbar (Easiest)**
1. Look at the **bottom toolbar** in VS Code
2. Find the **→ (arrow/upload)** button
3. Click it
4. Wait for "Uploading..." to complete

**Method B: Using Command Palette**
1. Press **Cmd+Shift+P** (Mac) or **Ctrl+Shift+P** (Windows)
2. Type: `PlatformIO: Upload`
3. Press Enter

**Method C: Using Terminal**
1. Open terminal in VS Code (View → Terminal)
2. Type: `pio run -t upload`
3. Press Enter

### Step 4: Verify Upload

After uploading, you should see:
```
Uploading .pio/build/xiao_esp32c3/firmware.bin
...
Hash of data verified.
Leaving...
Hard resetting via RTS pin...
```

## If Upload Fails

### Try Manual Boot Mode

Sometimes you need to put ESP32 in bootloader mode:

1. **Hold the BOOT button** on XIAO ESP32-C3
2. **Press and release RESET button** (while holding BOOT)
3. **Release BOOT button**
4. **Try upload again** immediately

### Alternative: Use Upload Command with Boot

In terminal:
```bash
pio run -t upload --upload-port /dev/tty.usbmodem* 
```

(On Windows, port might be `COM3` or similar - check PlatformIO → Devices)

## Monitor Output After Upload

To see what the ESP32 is doing:

**Method 1: PlatformIO Toolbar**
- Click the **plug icon (🔌)** in bottom toolbar

**Method 2: Terminal**
```bash
pio device monitor
```

**Method 3: Command Palette**
- Cmd+Shift+P → "PlatformIO: Serial Monitor"

You should see:
```
========================================
  XIAO ESP32-C3 + MPU6050 IMU Sensor
========================================

Initializing MPU6050...
✓ MPU6050 initialized successfully
Connecting to WiFi: iPhoneDanial
✓ WiFi connected! IP: 172.20.10.x
```

## Complete Flash Process

### 1. Make Sure Code is Saved
- Press **Cmd+S** (Mac) or **Ctrl+S** (Windows)
- Check file is saved (no dot next to filename)

### 2. Connect Hardware
- ✅ ESP32 connected via USB-C
- ✅ MPU6050 wired correctly
- ✅ Phone hotspot enabled (if using)

### 3. Flash Code
- Click Upload button or run `pio run -t upload`

### 4. Wait for Completion
- Should see "Uploading..." progress
- Wait for "Leaving..." message
- ESP32 will reset automatically

### 5. Monitor Output
- Open Serial Monitor
- Verify code is running

## Troubleshooting

### "No device found"

**Solutions:**
- Check USB cable (must be data cable, not charge-only)
- Try different USB port
- Disconnect and reconnect ESP32
- Check PlatformIO → Devices shows your ESP32

### "Upload failed" or "Timed out"

**Solutions:**
1. **Try manual boot mode:**
   - Hold BOOT button
   - Press RESET
   - Release BOOT
   - Try upload again

2. **Check port:**
   - PlatformIO → Devices
   - Note the port (e.g., `/dev/tty.usbmodem14103`)
   - Try: `pio run -t upload --upload-port YOUR_PORT`

3. **Try different USB cable/port**

### "Port busy" or "Permission denied"

**Solutions:**
- Close Serial Monitor if open
- Disconnect other programs using the port
- Try unplugging and replugging ESP32

### Upload succeeds but code doesn't run

**Solutions:**
- Check Serial Monitor for errors
- Verify MPU6050 is wired correctly
- Check WiFi credentials are correct
- Look for error messages in Serial output

## Quick Reference

| Action | How to Do It |
|--------|--------------|
| **Flash/Upload** | Click → button OR `pio run -t upload` |
| **Monitor** | Click 🔌 button OR `pio device monitor` |
| **Build Only** | Click ✓ button OR `pio run` |
| **Clean Build** | `pio run -t clean` |

## Step-by-Step Visual Guide

```
1. VS Code → File → Open Folder → `firmware/esp32c3_final`
   ↓
2. Connect ESP32 via USB-C
   ↓
3. Click → (Upload) button in bottom toolbar
   ↓
4. Wait for "Uploading..." → "Leaving..."
   ↓
5. Click 🔌 (Monitor) to see output
   ↓
6. Verify: "WiFi connected!" message
```

## Summary

**To flash again:**
1. Open `firmware/esp32c3_final` folder in VS Code
2. Connect ESP32 via USB
3. Click Upload button (→) or run `pio run -t upload`
4. Wait for completion
5. Open Serial Monitor to verify

**Each upload completely replaces the previous code** - it's a fresh flash every time.

Your code is ready with WiFi credentials set. Just connect, click Upload, and you're done!
