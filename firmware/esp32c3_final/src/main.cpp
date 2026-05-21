/**
 * XIAO ESP32-C3 + MPU6050 IMU Sensor
 * Sends roll/pitch data directly to Supabase
 * 
 * Hardware Connections:
 *   MPU6050    XIAO ESP32-C3
 *   ─────────────────────────
 *   VCC    →   3.3V
 *   GND    →   GND
 *   SDA    →   GPIO6 (SDA)
 *   SCL    →   GPIO7 (SCL)
 */

#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <MadgwickAHRS.h>

// ============================================================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================================================

// WiFi Credentials
const char* WIFI_SSID = "iPhoneDanial";           // Change this!
const char* WIFI_PASSWORD = "78564223";   // Change this!

// Supabase Configuration
const char* SUPABASE_URL = "https://rwggzbfnyrobaehyxnhv.supabase.co";
const char* SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Z2d6YmZueXJvYmFlaHl4bmh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzU0NTMsImV4cCI6MjA4NTAxMTQ1M30.i745IiHxVSMi9VXA-kk393rk1AeN0_gA-EiqbaMGZ_k";
const char* SUPABASE_TABLE = "leech_data";

// Sensor Configuration
const int NODE_ID = 1;  // This sensor will appear as n1 in Supabase
const uint32_t IMU_SAMPLE_RATE_MS = 10;   // 100 Hz IMU reading
const uint32_t TRANSMIT_RATE_MS = 100;     // 10 Hz transmission to Supabase
const int CALIBRATION_SAMPLES = 100;       // Samples to average for zero offset

// ============================================================================
// GLOBAL OBJECTS
// ============================================================================

static Adafruit_MPU6050 mpu;
static Madgwick filter;

// Calibration state
static bool offsetsReady = false;
static float rollOffset = 0.0f;
static float pitchOffset = 0.0f;
static uint32_t offsetSamples = 0;
static float rollAccum = 0.0f;
static float pitchAccum = 0.0f;

// Timing
static uint32_t lastImuMs = 0;
static uint32_t lastTxMs = 0;
static uint32_t lastWifiCheckMs = 0;

// ============================================================================
// INITIALIZATION FUNCTIONS
// ============================================================================

/**
 * Initialize MPU6050 IMU sensor
 * Tries different I2C pin configurations
 */
static void initMPU6050() {
  Serial.println("Initializing MPU6050...");
  Serial.println("Scanning I2C bus...");
  
  // Try different I2C pin configurations for XIAO ESP32-C3
  // Common configurations: (SDA, SCL)
  // NOTE: User reports using GPIO4 (SDA) and GPIO5 (SCL)
  int pinConfigs[][2] = {
    {4, 5},   // User's configuration - try first!
    {6, 7},   // Default for most XIAO ESP32-C3
    {8, 9},   // Another alternative
  };
  
  bool found = false;
  bool libraryInitialized = false;  // Track if library begin() succeeded
  int workingSDA = 6, workingSCL = 7;
  uint8_t workingAddress = 0x68;  // Store the working I2C address
  
  // First, scan I2C bus to see what's connected
  for (int config = 0; config < 3; config++) {
    int sda = pinConfigs[config][0];
    int scl = pinConfigs[config][1];
    
    Serial.printf("\nTrying SDA=GPIO%d, SCL=GPIO%d...\n", sda, scl);
    
    // Reset and initialize I2C bus
    Wire.end();  // End any previous I2C communication
    delay(50);
    Wire.begin(sda, scl);
    Wire.setClock(100000); // Start slow for detection (100kHz)
    delay(300); // Give I2C time to stabilize
    
    Serial.print("  Scanning I2C bus... ");
    
    // Scan I2C addresses - only report found devices, not NACKs
    int devices = 0;
    bool foundMPU = false;
    uint8_t mpuAddr = 0;
    
    for (byte addr = 1; addr < 127; addr++) {
      // Skip reserved addresses
      if (addr >= 0x78 && addr <= 0x7F) continue;
      
      Wire.beginTransmission(addr);
      byte error = Wire.endTransmission();
      
      if (error == 0) {
        // Device found!
        if (devices == 0) {
          Serial.println("found:");
        }
        Serial.printf("    ✓ Device at 0x%02X", addr);
        devices++;
        
        // Check if it's MPU6050
        if (addr == 0x68 || addr == 0x69) {
          Serial.println(" ← MPU6050!");
          foundMPU = true;
          mpuAddr = addr;
        } else {
          Serial.println();
        }
        delay(10); // Small delay between devices
      }
      // Don't report NACKs - they're normal for empty addresses
    }
    
    if (devices == 0) {
      Serial.println("no devices found");
    } else {
      Serial.printf("  Total: %d device(s)\n", devices);
    }
    
    // Only try to initialize if we found the MPU6050 in the scan
    // If scan didn't find it, skip initialization (saves time)
    if (foundMPU && mpuAddr > 0) {
      // First, manually verify we can read from the device
      // This confirms I2C communication works
      Serial.printf("  Verifying communication at 0x%02X... ", mpuAddr);
      Wire.setClock(400000);
      delay(50);
      
      // Read WHO_AM_I register (0x75) - should return 0x68 for MPU6050
      Wire.beginTransmission(mpuAddr);
      Wire.write(0x75);
      byte error = Wire.endTransmission();
      
      bool canCommunicate = false;
      if (error == 0) {
        Wire.requestFrom(mpuAddr, (uint8_t)1, (uint8_t)true); // Stop after read
        if (Wire.available()) {
          byte whoami = Wire.read();
          if (whoami == 0x68 || whoami == 0x71) {
            Serial.printf("OK (WHO_AM_I=0x%02X)\n", whoami);
            canCommunicate = true;
          } else {
            Serial.printf("unexpected value 0x%02X\n", whoami);
          }
        }
      } else {
        Serial.println("I2C error");
      }
      
      if (canCommunicate) {
        // Device is present and responding - try library initialization
        delay(50);
        Serial.printf("  Initializing library at 0x%02X... ", mpuAddr);
        
        // Wake up MPU6050 if it's in sleep mode (write 0 to PWR_MGMT_1 register)
        Wire.beginTransmission(mpuAddr);
        Wire.write(0x6B); // PWR_MGMT_1 register
        Wire.write(0x00); // Wake up (clear sleep bit)
        Wire.endTransmission();
        delay(10);
        
        // Try with explicit Wire instance
        if (mpu.begin(mpuAddr, &Wire)) {
          Serial.println("OK!");
          found = true;
          libraryInitialized = true;
          workingSDA = sda;
          workingSCL = scl;
          workingAddress = mpuAddr;
          Serial.printf("✓ MPU6050 initialized! Address: 0x%02X, SDA=GPIO%d, SCL=GPIO%d\n", 
                        mpuAddr, sda, scl);
          break;  // Exit the loop immediately - we found it!
        } else {
          Serial.println("FAILED");
          // Library failed but device is there - try without explicit Wire
          Serial.print("  Trying without explicit Wire... ");
          if (mpu.begin(mpuAddr)) {
            Serial.println("OK!");
            found = true;
            libraryInitialized = true;
            workingSDA = sda;
            workingSCL = scl;
            workingAddress = mpuAddr;
            Serial.printf("✓ MPU6050 initialized! Address: 0x%02X, SDA=GPIO%d, SCL=GPIO%d\n", 
                          mpuAddr, sda, scl);
            break;
          } else {
            Serial.println("FAILED");
            Serial.println("  ⚠ Device found but library init failed.");
            Serial.println("  Will try to re-initialize after Wire setup...");
            // Device is there, so mark as found
            found = true;
            workingSDA = sda;
            workingSCL = scl;
            workingAddress = mpuAddr;
            break;
          }
        }
      }
    }
    // If scan didn't find MPU6050, don't waste time trying to initialize
    
    delay(200);
  }
  
  if (!found) {
    Serial.println("\n❌ ERROR: MPU6050 not found!");
    Serial.println("\n═══════════════════════════════════════════════════");
    Serial.println("TROUBLESHOOTING CHECKLIST:");
    Serial.println("═══════════════════════════════════════════════════");
    Serial.println("\n1. VERIFY WIRING (You're using GPIO4/GPIO5):");
    Serial.println("   MPU6050    →    XIAO ESP32-C3");
    Serial.println("   ────────────────────────────────");
    Serial.println("   VCC        →    3.3V (NOT 5V!)");
    Serial.println("   GND        →    GND");
    Serial.println("   SDA        →    GPIO4 (D2)");
    Serial.println("   SCL        →    GPIO5 (D3)");
    Serial.println("\n2. CHECK POWER:");
    Serial.println("   • Measure voltage between VCC and GND");
    Serial.println("   • Should read ~3.3V");
    Serial.println("   • If 0V: Check VCC connection");
    Serial.println("   • If wrong voltage: Check power source");
    Serial.println("\n3. CHECK CONNECTIONS:");
    Serial.println("   • Re-seat all 4 wires (VCC, GND, SDA, SCL)");
    Serial.println("   • Wiggle wires to check for loose connections");
    Serial.println("   • Try different jumper wires if available");
    Serial.println("   • Use breadboard for more stable connections");
    Serial.println("\n4. VERIFY PINS:");
    Serial.println("   • Double-check GPIO4 = SDA on your board");
    Serial.println("   • Double-check GPIO5 = SCL on your board");
    Serial.println("   • Check XIAO ESP32-C3 pinout diagram");
    Serial.println("   • Some boards label pins as D2, D3, etc.");
    Serial.println("\n5. TEST MPU6050 MODULE:");
    Serial.println("   • Try MPU6050 on different board if available");
    Serial.println("   • Check if MPU6050 LED lights up (if it has one)");
    Serial.println("   • Verify module isn't damaged");
    Serial.println("\n═══════════════════════════════════════════════════");
    Serial.println("Halting... Fix wiring and press RESET to try again.");
    Serial.println("═══════════════════════════════════════════════════");
    
    while (true) {
      delay(1000);
      Serial.print(".");
    }
  }
  
  // Re-initialize Wire with working pins and set optimal I2C speed
  Wire.begin(workingSDA, workingSCL);
  Wire.setClock(400000); // 400kHz I2C speed
  delay(100);
  
  // If library initialization failed earlier, try again now that Wire is properly set up
  if (!libraryInitialized) {
    Serial.println("Retrying MPU6050 library initialization...");
    // Wake up MPU6050
    Wire.beginTransmission(workingAddress);
    Wire.write(0x6B); // PWR_MGMT_1 register
    Wire.write(0x00); // Wake up
    Wire.endTransmission();
    delay(50);
    
    if (mpu.begin(workingAddress, &Wire)) {
      libraryInitialized = true;
      Serial.println("✓ Library initialization succeeded on retry!");
    } else {
      Serial.println("✗ Library initialization still failing.");
      Serial.println("  Device is present but library cannot initialize it.");
      Serial.println("  This may be a library compatibility issue.");
      Serial.println("  Halting...");
      while(true) delay(1000);
    }
  }

  // Configure MPU6050 (only if library initialized successfully)
  if (libraryInitialized) {
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  }

  // Initialize Madgwick filter at 100 Hz
  filter.begin(100.0f);

  if (libraryInitialized) {
    Serial.println("✓ MPU6050 configured and ready!");
  }
}

/**
 * Connect to WiFi network
 */
static void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  const int maxAttempts = 30;
  
  while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("✓ WiFi connected! IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("  Signal strength (RSSI): ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("✗ WiFi connection failed!");
    Serial.println("  Check SSID and password");
    Serial.println("  Ensure 2.4GHz network (ESP32-C3 doesn't support 5GHz)");
    Serial.println("\nHalting...");
    
    while (true) {
      delay(1000);
      Serial.print(".");
    }
  }
}

// ============================================================================
// DATA TRANSMISSION
// ============================================================================

/**
 * Send sensor data to Supabase
 */
static void sendToSupabase(uint32_t timestampMs, float rollDeg, float pitchDeg) {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected!");
    return;
  }

  HTTPClient http;
  String url = String(SUPABASE_URL) + "/rest/v1/" + String(SUPABASE_TABLE);
  
  http.begin(url);
  http.setTimeout(5000); // 5 second timeout
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_KEY));
  http.addHeader("Prefer", "return=minimal");

  // Create JSON payload matching Supabase table structure
  StaticJsonDocument<512> doc;
  doc["timestamp"] = (int64_t)timestampMs;
  
  // Create node data object (n1 for this sensor)
  JsonObject nodeData = doc.createNestedObject("n" + String(NODE_ID));
  nodeData["roll"] = round(rollDeg * 100.0) / 100.0;  // Round to 2 decimal places
  nodeData["pitch"] = round(pitchDeg * 100.0) / 100.0;
  nodeData["ok"] = 1;  // Sensor is connected
  nodeData["age_ms"] = 0;  // Data is fresh

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // Send POST request
  int httpResponseCode = http.POST(jsonPayload);
  
  if (httpResponseCode > 0) {
    if (httpResponseCode == 201 || httpResponseCode == 200) {
      // Success - data sent
      Serial.printf("[%lu] Sent: roll=%.2f° pitch=%.2f°\n", 
                    timestampMs, rollDeg, pitchDeg);
    } else {
      Serial.printf("HTTP %d: ", httpResponseCode);
      String response = http.getString();
      Serial.println(response);
    }
  } else {
    Serial.printf("Error: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}

// ============================================================================
// MAIN LOOP
// ============================================================================

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n");
  Serial.println("========================================");
  Serial.println("  XIAO ESP32-C3 + MPU6050 IMU Sensor");
  Serial.println("========================================");
  Serial.println();

  // Initialize hardware
  initMPU6050();
  connectWiFi();

  Serial.println();
  Serial.println("Setup complete. Starting main loop...");
  Serial.println("Calibrating sensor (this takes ~1 second)...");
  Serial.println();
}

void loop() {
  uint32_t now = millis();

  // ========================================================================
  // Read IMU at high frequency (100 Hz)
  // ========================================================================
  if (now - lastImuMs >= IMU_SAMPLE_RATE_MS) {
    lastImuMs = now;

    sensors_event_t accel, gyro, temp;
    mpu.getEvent(&accel, &gyro, &temp);

    // Convert accelerometer to g units
    const float g0 = 9.80665f;
    float ax = accel.acceleration.x / g0;
    float ay = accel.acceleration.y / g0;
    float az = accel.acceleration.z / g0;

    // Convert gyro to degrees/second
    const float rad2deg = 57.2957795f;
    float gx = gyro.gyro.x * rad2deg;
    float gy = gyro.gyro.y * rad2deg;
    float gz = gyro.gyro.z * rad2deg;

    // Update Madgwick filter
    filter.updateIMU(gx, gy, gz, ax, ay, az);

    float rollNow = filter.getRoll();
    float pitchNow = filter.getPitch();

    // Calibrate offsets during first N samples
    if (!offsetsReady) {
      rollAccum += rollNow;
      pitchAccum += pitchNow;
      offsetSamples++;

      if (offsetSamples >= CALIBRATION_SAMPLES) {
        rollOffset = rollAccum / (float)offsetSamples;
        pitchOffset = pitchAccum / (float)offsetSamples;
        offsetsReady = true;

        Serial.println("✓ Calibration complete!");
        Serial.printf("  Roll offset:  %.2f°\n", rollOffset);
        Serial.printf("  Pitch offset: %.2f°\n", pitchOffset);
        Serial.println("  Starting data transmission...\n");
      }
    }
  }

  // ========================================================================
  // Send to Supabase at lower frequency (10 Hz)
  // ========================================================================
  if (now - lastTxMs >= TRANSMIT_RATE_MS && offsetsReady) {
    lastTxMs = now;

    // Get current angles and apply offset
    float rollOut = filter.getRoll() - rollOffset;
    float pitchOut = filter.getPitch() - pitchOffset;

    // Send to Supabase
    sendToSupabase(now, rollOut, pitchOut);
  }

  // ========================================================================
  // Monitor WiFi connection
  // ========================================================================
  if (now - lastWifiCheckMs >= 5000) {  // Check every 5 seconds
    lastWifiCheckMs = now;
    
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("\nWiFi connection lost! Reconnecting...");
      connectWiFi();
    }
  }

  // Small delay to prevent watchdog issues
  delay(1);
}
