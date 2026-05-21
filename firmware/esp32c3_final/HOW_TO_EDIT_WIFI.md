# How to Edit WiFi Credentials

## Step-by-Step Instructions

### Method 1: Using VS Code (Recommended)

1. **Open the file:**
   - In VS Code, go to: `firmware/esp32c3_final/src/main.cpp`
   - Or use File → Open File and navigate to it

2. **Find the WiFi section** (around line 28-29):
   ```cpp
   const char* WIFI_SSID = "YOUR_WIFI_SSID";           // Change this!
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";   // Change this!
   ```

3. **Replace with your WiFi details:**
   ```cpp
   const char* WIFI_SSID = "MyHomeWiFi";           // Your actual WiFi name
   const char* WIFI_PASSWORD = "mypassword123";     // Your actual WiFi password
   ```

4. **Save the file** (Ctrl+S or Cmd+S)

### Method 2: Using Any Text Editor

1. **Navigate to the folder:**
   ```
   /Users/Deaptheror/Downloads/DeltaTrim figma UI/firmware/esp32c3_final/src/
   ```

2. **Open `main.cpp`** in any text editor (TextEdit, Notepad, etc.)

3. **Find these lines** (search for "WIFI_SSID"):
   ```cpp
   const char* WIFI_SSID = "YOUR_WIFI_SSID";
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
   ```

4. **Replace with your actual WiFi credentials:**
   ```cpp
   const char* WIFI_SSID = "YourActualWiFiName";
   const char* WIFI_PASSWORD = "YourActualPassword";
   ```

5. **Save the file**

## Example

**Before:**
```cpp
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
```

**After (example):**
```cpp
const char* WIFI_SSID = "HomeNetwork";
const char* WIFI_PASSWORD = "SecurePass123";
```

## Important Notes

1. **Keep the quotes** - WiFi name and password must be in quotes `"like this"`

2. **Case sensitive** - WiFi names and passwords are case-sensitive

3. **2.4GHz only** - ESP32-C3 only supports 2.4GHz WiFi (not 5GHz)

4. **No spaces in variable names** - Only change the values inside quotes

5. **Save before uploading** - Make sure to save the file before running `pio run -t upload`

## Quick Visual Guide

```
File: firmware/esp32c3_final/src/main.cpp

Line 28: const char* WIFI_SSID = "YOUR_WIFI_SSID";
         └─ Replace "YOUR_WIFI_SSID" with your WiFi name

Line 29: const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
         └─ Replace "YOUR_WIFI_PASSWORD" with your WiFi password
```

## Troubleshooting

**Can't find the file?**
- Make sure you're in the `firmware/esp32c3_final` folder
- The file is in `firmware/esp32c3_final/src/main.cpp`

**File won't save?**
- Check file permissions
- Make sure you have write access
- Try saving to a different location first, then copy it back

**WiFi still not connecting?**
- Double-check spelling (case-sensitive!)
- Verify it's a 2.4GHz network
- Check your router allows new devices
