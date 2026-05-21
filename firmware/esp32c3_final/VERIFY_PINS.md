# Verify XIAO ESP32-C3 Pins

## Your Configuration
- **SDA → GPIO4**
- **SCL → GPIO5**

## XIAO ESP32-C3 Pin Reference

The XIAO ESP32-C3 has pins labeled on the board. Check your physical board:

### Common Pin Layouts

**Seeed Studio XIAO ESP32-C3:**
```
Pin Labels (on board):
D0  = GPIO0
D1  = GPIO1
D2  = GPIO4  ← Your SDA
D3  = GPIO5  ← Your SCL
D4  = GPIO6
D5  = GPIO7
D6  = GPIO8
D7  = GPIO9
D8  = GPIO10
```

**Important:** Some boards use different numbering!
- GPIO4 might be labeled as **D2**
- GPIO5 might be labeled as **D3**

## How to Verify Your Pins

### Method 1: Check Physical Labels
1. Look at your XIAO ESP32-C3 board
2. Find the pin labels (D0, D1, D2, D3, etc.)
3. Verify which physical pin your SDA wire is connected to
4. Verify which physical pin your SCL wire is connected to

### Method 2: Check Pinout Diagram
Search for: **"XIAO ESP32-C3 pinout"** or **"Seeed XIAO ESP32-C3 datasheet"**

### Method 3: Test with Multimeter
1. Set multimeter to continuity mode
2. Touch one probe to your SDA wire
3. Touch other probe to each GPIO pin until you find which one beeps
4. Repeat for SCL wire

## Common Issues

### Issue 1: Wrong Pin Numbers
**Symptom:** No I2C devices found

**Solution:**
- GPIO4 might actually be a different physical pin
- Check if your board uses D2/D3 labels instead
- Try GPIO6/GPIO7 if GPIO4/GPIO5 don't work

### Issue 2: Pin Confusion
**Symptom:** Code says GPIO4/GPIO5 but you're not sure which physical pins

**Solution:**
- Count pins from one end of the board
- XIAO boards usually have pins on both sides
- Check the official pinout diagram for your exact model

### Issue 3: Different Board Variant
**Symptom:** Nothing works on any pins

**Solution:**
- Your board might be a different variant
- Check the exact model number on the board
- Look up the specific pinout for that variant

## Quick Test

1. **Disconnect MPU6050**
2. **Upload code** - should show "No I2C devices found" (expected)
3. **Reconnect MPU6050** - should show device at 0x68
4. **If still nothing** - check power and wiring

## What to Check Right Now

1. **Physical Connection:**
   - Which physical pin is your SDA wire touching?
   - Which physical pin is your SCL wire touching?
   - Write down the pin labels (D2, D3, etc.)

2. **Power:**
   - Is VCC connected to 3.3V?
   - Is GND connected to GND?
   - Use multimeter to verify ~3.3V between VCC and GND

3. **Wiring:**
   - Are all 4 wires secure?
   - Try wiggling wires - does connection break?
   - Try different jumper wires

4. **Board Model:**
   - What exact model is your XIAO ESP32-C3?
   - Check for model number or label on the board
   - Look up its specific pinout

## Next Steps

1. **Verify physical pin connections** - which pins are wires actually on?
2. **Check power** - measure VCC-GND voltage
3. **Upload updated code** - it now tries GPIO4/GPIO5 first
4. **Share results** - what does Serial Monitor show?
