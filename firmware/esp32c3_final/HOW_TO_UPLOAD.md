# How to Upload Code to ESP32-C3

## What Code to Upload

You need to upload the **entire `main.cpp` file** from:
```
firmware/esp32c3_final/src/main.cpp
```

This is the complete program that:
- Reads MPU6050 sensor data
- Connects to WiFi (your phone hotspot)
- Sends data to Supabase
- Handles all the logic

## Uploading Through VS Code (PlatformIO)

### Step 1: Install PlatformIO

1. **Open VS Code**
2. **Install PlatformIO extension:**
   - Click Extensions icon (or Cmd+Shift+X)
   - Search for "PlatformIO IDE"
   - Click Install

### Step 2: Open the Project

1. **File → Open Folder**
2. Navigate to: `firmware/esp32c3_final` folder
3. Click "Open"

VS Code should recognize it as a PlatformIO project (you'll see PlatformIO icon in left sidebar).

### Step 3: Connect ESP32

1. **Connect XIAO ESP32-C3 to laptop** via USB-C cable
2. **Check it's detected:**
   - In VS Code, click PlatformIO icon (left sidebar)
   - Go to "Devices" - should see your ESP32 listed

### Step 4: Upload Code

**Method 1: Using PlatformIO Toolbar**
1. Look at the bottom toolbar in VS Code
2. Click the **→ (Upload)** button
3. Or use the checkmark (✓) to build first, then upload

**Method 2: Using Command Palette**
1. Press **Cmd+Shift+P** (Mac) or **Ctrl+Shift+P** (Windows)
2. Type: "PlatformIO: Upload"
3. Press Enter

**Method 3: Using Terminal**
1. Open terminal in VS Code (View → Terminal)
2. Type: `pio run -t upload`
3. Press Enter

### Step 5: Monitor Output

After uploading, open Serial Monitor:

**Method 1: PlatformIO Toolbar**
- Click the plug icon (🔌) in bottom toolbar

**Method 2: Command Palette**
- Cmd+Shift+P → "PlatformIO: Serial Monitor"

**Method 3: Terminal**
- Type: `pio device monitor`

You should see:
```
========================================
  XIAO ESP32-C3 + MPU6050 IMU Sensor
========================================

Initializing MPU6050...
✓ MPU6050 initialized successfully
Connecting to WiFi: iPhoneDanial
✓ WiFi connected! IP: 172.20.10.x
...
```

## How Uploading Works

### ⚠️ Important: Uploading REPLACES Everything

**Uploading code completely erases and rewrites the ESP32's memory.**

- ❌ **Does NOT append** - It's a full replacement
- ❌ **Does NOT keep old code** - Previous program is deleted
- ✅ **Completely flashes** - New program takes over entirely

**Think of it like:**
- Old way: Writing in a notebook (append)
- ESP32 way: Replacing the entire notebook (full rewrite)

### What Gets Uploaded

When you upload, PlatformIO:
1. **Compiles** your `main.cpp` (and libraries)
2. **Creates a binary file** (.bin)
3. **Erases** the ESP32's flash memory
4. **Writes** the new binary to ESP32
5. **Resets** ESP32 to run new code

### What Happens to Old Code

- **Completely erased** - Gone forever
- **New code runs** - Your new program starts immediately
- **No mixing** - Old and new code don't coexist

## Complete Upload Process

### 1. Prepare Code
- ✅ WiFi credentials set (you already did this!)
- ✅ Code saved (Cmd+S)

### 2. Connect Hardware
- ✅ XIAO ESP32-C3 connected via USB-C
- ✅ MPU6050 wired correctly

### 3. Upload
```bash
# In VS Code terminal, or use PlatformIO buttons:
pio run -t upload
```

### 4. Monitor
```bash
pio device monitor
```

### 5. Verify
- Check Serial Monitor for "WiFi connected!"
- Check Supabase for data
- Check website for real-time updates

## Troubleshooting Upload

### "No device found"

**Solutions:**
- Check USB cable (use data cable, not charge-only)
- Try different USB port
- Install USB drivers if needed
- Check Device Manager (Windows) or System Information (Mac)

### "Upload failed"

**Solutions:**
- Hold BOOT button on ESP32 while uploading
- Try different USB port
- Check cable connection
- Restart VS Code

### "Port not found"

**Solutions:**
- Disconnect and reconnect ESP32
- Check PlatformIO → Devices shows your ESP32
- Try: `pio device list` in terminal

## Upload vs. Edit

### Editing Code (Local)
- ✅ Edit `main.cpp` in VS Code
- ✅ Changes saved to your computer
- ❌ **ESP32 doesn't change** until you upload

### Uploading Code (To ESP32)
- ✅ Sends compiled code to ESP32
- ✅ ESP32 runs new code immediately
- ❌ **Old code is erased**

## Quick Reference

| Action | Command | What It Does |
|--------|---------|--------------|
| Build | `pio run` | Compile code (check for errors) |
| Upload | `pio run -t upload` | Compile + upload to ESP32 |
| Monitor | `pio device monitor` | See Serial output |
| Clean | `pio run -t clean` | Delete build files |

## Summary

**What to upload:**
- The entire `firmware/esp32c3_final/src/main.cpp` file

**How to upload:**
- Use PlatformIO in VS Code
- Click Upload button or run `pio run -t upload`

**What happens:**
- ✅ Completely replaces old code
- ✅ New code runs immediately
- ❌ Old code is erased (not appended)

**Your code is ready!** You've already set the WiFi credentials. Just:
1. Connect ESP32 via USB
2. Click Upload in PlatformIO
3. Monitor output
4. Verify data appears in Supabase
