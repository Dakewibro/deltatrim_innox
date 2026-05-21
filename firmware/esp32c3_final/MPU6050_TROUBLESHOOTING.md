# MPU6050 Connection Troubleshooting

## Error: "MPU6050 not found!"

This means the ESP32 can't communicate with the MPU6050 via I2C. Let's fix it step by step.

## Step 1: Verify Wiring

### XIAO ESP32-C3 Pinout

Check your XIAO ESP32-C3 pinout. The I2C pins might be different than expected.

**Common XIAO ESP32-C3 I2C pins:**
- **SDA**: Usually **GPIO6** or **GPIO4** (check your board)
- **SCL**: Usually **GPIO7** or **GPIO5** (check your board)

### Correct Wiring

```
MPU6050          XIAO ESP32-C3
─────────────────────────────────
VCC          →   3.3V (NOT 5V!)
GND          →   GND
SDA          →   GPIO6 (or GPIO4 - check your board)
SCL          →   GPIO7 (or GPIO5 - check your board)
```

### Important Notes

1. **Use 3.3V, NOT 5V!**
   - MPU6050 can work on 3.3V
   - XIAO ESP32-C3 outputs 3.3V
   - Using 5V can damage the ESP32

2. **Check Pin Numbers**
   - XIAO boards sometimes have different I2C pins
   - Look for labels on the board: SDA, SCL
   - Or check XIAO ESP32-C3 datasheet

## Step 2: Test I2C Connection

Let's create a simple test to verify I2C is working.

### Test Code

Create a test file `test_i2c.cpp`:

```cpp
#include <Arduino.h>
#include <Wire.h>

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("Scanning I2C bus...");
  
  Wire.begin();
  Wire.setClock(100000); // Slow down to 100kHz for testing
  
  int devices = 0;
  for (byte address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    byte error = Wire.endTransmission();
    
    if (error == 0) {
      Serial.print("I2C device found at address 0x");
      if (address < 16) Serial.print("0");
      Serial.print(address, HEX);
      Serial.println(" !");
      devices++;
    }
  }
  
  if (devices == 0) {
    Serial.println("No I2C devices found!");
    Serial.println("Check wiring:");
    Serial.println("  SDA -> GPIO6");
    Serial.println("  SCL -> GPIO7");
  } else {
    Serial.print("Found ");
    Serial.print(devices);
    Serial.println(" device(s)");
  }
}

void loop() {
  delay(1000);
}
```

Upload this and check Serial Monitor. You should see:
- MPU6050 at address **0x68** (or sometimes 0x69)

## Step 3: Common Issues & Fixes

### Issue 1: Wrong I2C Pins

**Symptom:** No devices found in I2C scan

**Solution:**
- Check XIAO ESP32-C3 pinout diagram
- Try GPIO4/GPIO5 instead of GPIO6/GPIO7
- Look for physical labels on the board

### Issue 2: Loose Connections

**Symptom:** Intermittent connection

**Solution:**
- Re-seat all wires
- Use breadboard or solder connections
- Check for loose jumper wires
- Try different wires

### Issue 3: Power Issues

**Symptom:** MPU6050 not powering on

**Solution:**
- Verify 3.3V connection
- Check GND is connected
- Measure voltage with multimeter (should be ~3.3V)
- Try different power source temporarily

### Issue 4: I2C Pull-up Resistors

**Symptom:** Sometimes works, sometimes doesn't

**Solution:**
- MPU6050 usually has built-in pull-ups
- XIAO ESP32-C3 might need external pull-ups
- Add 4.7kΩ resistors:
  - SDA → 3.3V (via 4.7kΩ resistor)
  - SCL → 3.3V (via 4.7kΩ resistor)

### Issue 5: Wrong I2C Address

**Symptom:** Device found but at wrong address

**Solution:**
- MPU6050 default address is 0x68
- If AD0 pin is HIGH, address is 0x69
- Check if AD0 is connected to anything

## Step 4: Try Different I2C Pins

If GPIO6/GPIO7 don't work, try modifying the code:

### Option A: Use GPIO4/GPIO5

In `main.cpp`, change Wire.begin():

```cpp
// In initMPU6050() function, change:
Wire.begin(4, 5);  // SDA=GPIO4, SCL=GPIO5
```

### Option B: Use Default I2C Pins

Some XIAO boards use different defaults:

```cpp
Wire.begin();  // Use default pins (check board documentation)
```

## Step 5: Verify MPU6050 is Working

### Test with Multimeter

1. **Check Power:**
   - Measure voltage between VCC and GND
   - Should be ~3.3V

2. **Check I2C Lines:**
   - SDA and SCL should be at ~3.3V when idle
   - If 0V, check connections

### Test MPU6050 on Different Board

If you have another Arduino/ESP32:
- Try connecting MPU6050 to it
- Use a known-working I2C scanner
- Verify MPU6050 itself works

## Step 6: Modified Code with Better Error Handling

Here's an improved version that tries different I2C configurations:

```cpp
static void initMPU6050() {
  Serial.println("Initializing MPU6050...");
  
  // Try different I2C pin configurations
  bool found = false;
  int sdaPins[] = {6, 4, 8, 10};  // Common SDA pins
  int sclPins[] = {7, 5, 9, 11};  // Common SCL pins
  
  for (int i = 0; i < 4 && !found; i++) {
    Serial.printf("Trying SDA=%d, SCL=%d...\n", sdaPins[i], sclPins[i]);
    
    Wire.begin(sdaPins[i], sclPins[i]);
    Wire.setClock(100000);  // Start slow
    
    delay(100);
    
    if (mpu.begin()) {
      found = true;
      Serial.printf("✓ Found on SDA=%d, SCL=%d\n", sdaPins[i], sclPins[i]);
      break;
    }
  }
  
  if (!found) {
    Serial.println("ERROR: MPU6050 not found on any I2C pins!");
    Serial.println("Check wiring and try manual I2C scan");
    while (true) delay(1000);
  }
  
  // Rest of initialization...
  Wire.setClock(400000);
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  filter.begin(100.0f);
  Serial.println("✓ MPU6050 initialized successfully");
}
```

## Quick Checklist

Before giving up, check:

- [ ] VCC connected to 3.3V (not 5V!)
- [ ] GND connected to GND
- [ ] SDA connected to correct GPIO pin
- [ ] SCL connected to correct GPIO pin
- [ ] All connections are secure (not loose)
- [ ] MPU6050 is getting power (check with multimeter)
- [ ] No short circuits
- [ ] Using correct I2C pins for your XIAO board

## XIAO ESP32-C3 I2C Pin Reference

Check your specific board model. Common configurations:

**Seeed XIAO ESP32-C3:**
- SDA: GPIO6 (D4)
- SCL: GPIO7 (D5)

**Alternative (if above doesn't work):**
- SDA: GPIO4
- SCL: GPIO5

**Check physical labels on your board!**

## Still Not Working?

1. **Take a photo** of your wiring and I can help identify issues
2. **Check board model** - exact XIAO ESP32-C3 variant
3. **Try I2C scanner** code to see if ANY device is detected
4. **Test MPU6050** on different board to verify it works
5. **Check for damaged components** - try different MPU6050 if available

## Next Steps

1. Verify wiring matches your board's pinout
2. Run I2C scanner to see if device is detected
3. Try different I2C pin combinations
4. Check power supply (3.3V on VCC)
5. Verify MPU6050 module is functional

Let me know what the I2C scanner finds (if anything) and we can troubleshoot further!
