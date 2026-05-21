# How to Open Serial Monitor in PlatformIO

## The Problem
You uploaded the code successfully, but you're not seeing any output. This is because **Serial Monitor needs to be opened separately** - it doesn't open automatically.

## Solution: Open Serial Monitor

### Method 1: Using PlatformIO Toolbar (Easiest)

1. **Look at the bottom of VS Code** - you should see the PlatformIO toolbar
2. **Click the "Serial Monitor" icon** (looks like a plug/terminal icon)
   - It's usually in the bottom status bar
   - Or look for a button that says "Serial Monitor"

### Method 2: Using PlatformIO Menu

1. **Click the PlatformIO icon** in the left sidebar (ant icon)
2. **Expand your project** (should show "xiao_esp32c3" environment)
3. **Click "Monitor"** (or look for "Serial Monitor" option)

### Method 3: Using Command Palette

1. **Press `Cmd+Shift+P`** (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. **Type**: `PlatformIO: Serial Monitor`
3. **Press Enter**

### Method 4: Using Terminal Command

1. **Open Terminal** in VS Code (`Ctrl+` ` or `Cmd+` `)
2. **Run**:
   ```bash
   pio device monitor
   ```

## Important Settings

### Baud Rate
Make sure Serial Monitor is set to **115200 baud**:
- When Serial Monitor opens, look for baud rate setting
- Change it to **115200** if it's different
- The code uses `Serial.begin(115200)`, so they must match!

### Port Selection
Make sure the correct port is selected:
- PlatformIO usually auto-detects the port
- If you see multiple ports, select the one that says "USB" or "Serial"
- On Mac, it might be `/dev/cu.usbserial-*` or `/dev/cu.usbmodem*`
- On Windows, it might be `COM3`, `COM4`, etc.

## After Opening Serial Monitor

1. **Press the RESET button** on your ESP32-C3
   - This restarts the code
   - You should immediately see output

2. **What you should see:**
   ```
   Scanning I2C bus...
   Trying SDA=GPIO6, SCL=GPIO7...
     Found I2C device at 0x68
     → This might be MPU6050!
   ✓ MPU6050 found on SDA=GPIO6, SCL=GPIO7
   ```

## Troubleshooting

### Still No Output?

1. **Check baud rate** - Must be 115200
2. **Press RESET button** on ESP32
3. **Check USB cable** - Make sure it's a data cable (not charge-only)
4. **Try different USB port** on your computer
5. **Close and reopen Serial Monitor**

### Serial Monitor Shows Garbage Characters?

- **Baud rate mismatch!** Change to 115200
- Close Serial Monitor
- Reopen it with correct baud rate

### Port Not Found?

1. **Unplug and replug** USB cable
2. **Check Device Manager** (Windows) or **System Information** (Mac) to see if device is detected
3. **Try different USB cable**
4. **Install USB drivers** if needed (CH340, CP2102, etc.)

## Quick Checklist

- [ ] Serial Monitor is open
- [ ] Baud rate is set to **115200**
- [ ] Correct port is selected
- [ ] Pressed RESET button on ESP32
- [ ] USB cable is connected
- [ ] Code was uploaded successfully

## Visual Guide

```
VS Code Bottom Bar:
┌─────────────────────────────────────────┐
│ PlatformIO  ✓  Serial Monitor  [Open]  │  ← Click here!
└─────────────────────────────────────────┘

Or in PlatformIO Sidebar:
📁 PlatformIO
  └─ 📁 xiao_esp32c3
      ├─ 📁 src
      ├─ 📁 include
      ├─ 🔧 Build
      ├─ 📤 Upload
      └─ 📺 Monitor  ← Click this!
```

## Next Steps

Once Serial Monitor is open and showing output:
1. Look for I2C device detection messages
2. See if MPU6050 is found at address 0x68 or 0x69
3. Share the output with me so we can troubleshoot further!
