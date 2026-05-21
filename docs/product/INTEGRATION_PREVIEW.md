# Integration Preview: Receiver Visualization into DELTATRIM

## 🎨 Visual Preview of What Will Be Built

> **Note:** This document provides a comprehensive visual preview of the integration. For the actual implementation plan, see the plan file.

## 📸 Visual Mockup: Dashboard Integration

### Complete Dashboard View

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                          DELTATRIM - Live Dashboard                          ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────┐    ║
║  │  Receiver Data                    ● CONNECTED   Update Rate: 4.0 Hz │    ║
║  ├─────────────────────────────────────────────────────────────────────┤    ║
║  │                                                                     │    ║
║  │  ┌─────────────────────────────────────────────────────────────┐   │    ║
║  │  │  Tilt Box (Roll/Pitch Visualization)                       │   │    ║
║  │  │  ┌─────────────────────────────────────────────────────┐   │   │    ║
║  │  │  │                                                     │   │   │    ║
║  │  │  │              ┌───┐                                  │   │   │    ║
║  │  │  │              │ ● │  ← Moving point (roll/pitch)      │   │   │    ║
║  │  │  │              └───┘                                  │   │   │    ║
║  │  │  │                 │                                   │   │   │    ║
║  │  │  │            ─────┼─────  (crosshairs)                │   │   │    ║
║  │  │  │                 │                                   │   │   │    ║
║  │  │  │                                                 │   │   │    ║
║  │  │  └─────────────────────────────────────────────────────┘   │   │    ║
║  │  │  Pitch +/-                          Roll + →              │   │    ║
║  │  └─────────────────────────────────────────────────────────────┘   │    ║
║  │                                                                     │    ║
║  │  ┌─────────────────────────────────────────────────────────────┐   │    ║
║  │  │  Roll (solid) / Pitch (dashed)                              │   │    ║
║  │  │  ┌─────────────────────────────────────────────────────┐   │   │    ║
║  │  │  │  45°│     ╱╲                                         │   │   │    ║
║  │  │  │     │    ╱  ╲      ╱╲                                │   │   │    ║
║  │  │  │  30°│   ╱    ╲    ╱  ╲                               │   │   │    ║
║  │  │  │     │  ╱      ╲  ╱    ╲                              │   │   │    ║
║  │  │  │  15°│ ╱        ╲╱      ╲                             │   │   │    ║
║  │  │  │     │───────────────────────────── (solid = roll)     │   │   │    ║
║  │  │  │   0°│                                             │   │   │    ║
║  │  │  │     │ - - - - - - - - - - - - - - (dashed = pitch)│   │   │    ║
║  │  │  │ -15°│                                             │   │   │    ║
║  │  │  │     │                                             │   │   │    ║
║  │  │  │ -30°│                                             │   │   │    ║
║  │  │  │     │                                             │   │   │    ║
║  │  │  │ -45°│                                             │   │   │    ║
║  │  │  └─────────────────────────────────────────────────────┘   │   │    ║
║  │  │  Scale: ± 45 deg                                            │   │    ║
║  │  └─────────────────────────────────────────────────────────────┘   │    ║
║  │                                                                     │    ║
║  │  ┌─────────────────────────────────────────────────────────────┐   │    ║
║  │  │  Node Status                                                │   │    ║
║  │  ├──────┬──────────────┬──────────┬──────────┬───────────────┤   │    ║
║  │  │ Node │ Status       │ Age (ms) │ Roll     │ Pitch         │   │    ║
║  │  ├──────┼──────────────┼──────────┼──────────┼───────────────┤   │    ║
║  │  │  1   │ ● CONNECTED  │   50     │  1.23°   │  4.56°        │   │    ║
║  │  │  2   │ ○ NO DATA    │  999999  │  0.00°   │  0.00°        │   │    ║
║  │  │  3   │ ○ NO DATA    │  999999  │  0.00°   │  0.00°        │   │    ║
║  │  │  4   │ ○ NO DATA    │  999999  │  0.00°   │  0.00°        │   │    ║
║  │  │  5   │ ○ NO DATA    │  999999  │  0.00°   │  0.00°        │   │    ║
║  │  └──────┴──────────────┴──────────┴──────────┴───────────────┘   │    ║
║  └─────────────────────────────────────────────────────────────────────┘    ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────┐    ║
║  │  Boat Comparison 1                                                   │    ║
║  │  [Existing LeechCurveGraph component]                                 │    ║
║  │                                                                       │    ║
║  │                                                                       │    ║
║  └─────────────────────────────────────────────────────────────────────┘    ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

**Color Legend:**
- Background: `#0a0e1a` (dark blue-black)
- Cards: `#141920` (slightly lighter)
- Borders: `#1a1f2e` (subtle)
- Connected (●): `#00d4aa` (teal/green)
- No Data (○): `#fb7185` (pink/red)
- Text: `#ffffff` (white)
- Secondary: `#8892b0` (muted blue-gray)

### Detailed Component View: ReceiverVisualization

```
╔═══════════════════════════════════════════════════════════════════════╗
║  Receiver Data                    ● CONNECTED   Update Rate: 4.0 Hz  ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  ┌───────────────────────────────────────────────────────────────┐   ║
║  │  Tilt Box                                                     │   ║
║  │  ┌─────────────────────────────────────────────────────────┐ │   ║
║  │  │                                                         │ │   ║
║  │  │    ┌─────┐                                             │ │   ║
║  │  │    │     │                                             │ │   ║
║  │  │    │  ●  │  ← Point moves based on roll/pitch         │ │   ║
║  │  │    │     │     (smooth 120ms transitions)             │ │   ║
║  │  │    └─────┘                                             │ │   ║
║  │  │       │                                                 │ │   ║
║  │  │  ─────┼─────  (crosshairs for reference)              │ │   ║
║  │  │       │                                                 │ │   ║
║  │  │                                                         │ │   ║
║  │  │  Grid pattern (subtle lines)                           │ │   ║
║  │  └─────────────────────────────────────────────────────────┘ │   ║
║  │  Pitch +/-                          Roll + →                │   ║
║  └───────────────────────────────────────────────────────────────┘   ║
║                                                                       ║
║  ┌───────────────────────────────────────────────────────────────┐   ║
║  │  Roll (solid) / Pitch (dashed)                                │   ║
║  │  ┌─────────────────────────────────────────────────────────┐ │   ║
║  │  │ 45°│     ╱╲                                               │ │   ║
║  │  │    │    ╱  ╲      ╱╲                                      │ │   ║
║  │  │ 30°│   ╱    ╲    ╱  ╲                                     │ │   ║
║  │  │    │  ╱      ╲  ╱    ╲                                    │ │   ║
║  │  │ 15°│ ╱        ╲╱      ╲                                   │ │   ║
║  │  │    │───────────────────────────── (solid line = roll)     │ │   ║
║  │  │  0°│                                                       │ │   ║
║  │  │    │ - - - - - - - - - - - - - - (dashed line = pitch)   │ │   ║
║  │  │-15°│                                                       │ │   ║
║  │  │    │                                                       │ │   ║
║  │  │-30°│                                                       │ │   ║
║  │  │    │                                                       │ │   ║
║  │  │-45°│                                                       │ │   ║
║  │  └─────────────────────────────────────────────────────────┘ │   ║
║  │  Scale: ± 45 deg                                              │   ║
║  │  (Rolling buffer: 48 points, ~10 seconds at 250ms updates)   │   ║
║  └───────────────────────────────────────────────────────────────┘   ║
║                                                                       ║
║  ┌───────────────────────────────────────────────────────────────┐   ║
║  │  Node Status                                                  │   ║
║  ├──────┬──────────────┬──────────┬──────────┬───────────────┤   ║
║  │ Node │ Status       │ Age (ms) │ Roll     │ Pitch         │   ║
║  ├──────┼──────────────┼──────────┼──────────┼───────────────┤   ║
║  │  1   │ ● CONNECTED  │   50     │  1.23°   │  4.56°        │   ║
║  │      │ (teal/green) │          │          │               │   ║
║  ├──────┼──────────────┼──────────┼──────────┼───────────────┤   ║
║  │  2   │ ○ NO DATA    │  999999  │  0.00°   │  0.00°        │   ║
║  │      │ (pink/red)   │          │          │               │   ║
║  ├──────┼──────────────┼──────────┼──────────┼───────────────┤   ║
║  │  3   │ ○ NO DATA    │  999999  │  0.00°   │  0.00°        │   ║
║  ├──────┼──────────────┼──────────┼──────────┼───────────────┤   ║
║  │  4   │ ○ NO DATA    │  999999  │  0.00°   │  0.00°        │   ║
║  ├──────┼──────────────┼──────────┼──────────┼───────────────┤   ║
║  │  5   │ ○ NO DATA    │  999999  │  0.00°   │  0.00°        │   ║
║  └──────┴──────────────┴──────────┴──────────┴───────────────┘   ║
╚═══════════════════════════════════════════════════════════════════════╝

Component Styling:
- Card background: #141920
- Border: 1px solid #1a1f2e
- Border radius: 12px
- Padding: 14px
- Typography: System fonts, 14px base
- Spacing: 12px, 16px, 24px gaps
```

### Responsive Layout (Mobile View)

```
╔═══════════════════════════════════════════════════════════╗
║  Live Dashboard                                          ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌───────────────────────────────────────────────────┐  ║
║  │  Receiver Data                                     │  ║
║  │  [Tilt Box, Chart, Table - stacked vertically]     │  ║
║  └───────────────────────────────────────────────────┘  ║
║                                                           ║
║  ┌───────────────────────────────────────────────────┐  ║
║  │  Boat Comparison 1                                │  ║
║  │  [Graph]                                          │  ║
║  └───────────────────────────────────────────────────┘  ║
║                                                           ║
║  ┌───────────────────────────────────────────────────┐  ║
║  │  Boat Comparison 2                                │  ║
║  │  [Graph]                                          │  ║
║  └───────────────────────────────────────────────────┘  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
(Grid switches to 1 column on screens < 1200px)
```

### 1. **Receiver Firmware Change (ESP32-S3)**

**Visual Code Comparison:**

```
┌─────────────────────────────────────────────────────────────────┐
│  BEFORE (Current Code)                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  static void handleApi() {                                     │
│    // Build JSON response from nodes array                      │
│    String jsonStr = "{\"ms\":" + String(millis()) + ...;       │
│    // ... build nodes array ...                                 │
│                                                                 │
│    server.send(200, "application/json", jsonStr);              │
│  }                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  AFTER (Only 2 Lines Added)                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  static void handleApi() {                                     │
│    // Build JSON response from nodes array                      │
│    String jsonStr = "{\"ms\":" + String(millis()) + ...;       │
│    // ... build nodes array ...                                 │
│                                                                 │
│    // ════════════════════════════════════════════════════     │
│    // ADD THESE 2 LINES (CORS headers):                        │
│    // ════════════════════════════════════════════════════     │
│    server.sendHeader("Access-Control-Allow-Origin", "*");      │
│    server.sendHeader("Access-Control-Allow-Methods", "GET");  │
│    // ════════════════════════════════════════════════════     │
│                                                                 │
│    server.send(200, "application/json", jsonStr);              │
│  }                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**What Stays Unchanged (Visual):**

```
┌─────────────────────────────────────────────────────────────────┐
│  ✅ HTML Page Handler (handleRoot)                             │
│  └─ Serves full HTML page with embedded visualization         │
│     Location: server.on("/", HTTP_GET, handleRoot)            │
│     Status: UNCHANGED                                          │
├─────────────────────────────────────────────────────────────────┤
│  ✅ BLE Client Code                                            │
│  └─ Scans for "LEECH_NODE_X", connects, subscribes            │
│     Location: BLE scanning/connection logic                   │
│     Status: UNCHANGED                                          │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Filter/Processing Code                                      │
│  └─ Any data processing, filtering, calibration                │
│     Location: Data processing functions                        │
│     Status: UNCHANGED                                          │
├─────────────────────────────────────────────────────────────────┤
│  ✅ WiFi AP Setup                                              │
│  └─ Creates "LEECH_RECEIVER" AP with password                 │
│     Location: WiFi.softAP("LEECH_RECEIVER", "12345678")      │
│     Status: UNCHANGED                                          │
├─────────────────────────────────────────────────────────────────┤
│  ✅ All Other Endpoints                                        │
│  └─ Any other HTTP handlers                                    │
│     Status: UNCHANGED                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ⚠️  ONLY CHANGE: handleApi() function                         │
│  └─ Add 2 CORS header lines before server.send()              │
│     Impact: Allows web app to fetch JSON data                  │
│     Risk: Minimal (only adds headers, no logic change)         │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2. **New React Component: ReceiverVisualization**

**Location:** `src/components/ReceiverVisualization.jsx`

**What it contains:**

#### A. **Tilt Box** (Top Section)
```
┌─────────────────────────────────────┐
│  Tilt Box (200x200px)               │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │      ┌───┐                  │   │
│  │      │ + │  ← Moving point  │   │
│  │      └───┘                  │   │
│  │         │                     │   │
│  │    ─────┼─────  (crosshairs)│   │
│  │         │                     │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│  Pitch +/-    Roll + →              │
└─────────────────────────────────────┘
```
- Grid background with crosshairs
- Moving point represents roll/pitch position
- Axes labels: "Pitch +/-" and "Roll + →"
- Smooth transitions (120ms)

#### B. **Canvas Chart** (Middle Section)
```
┌─────────────────────────────────────┐
│  Roll (solid) / Pitch (dashed)      │
│  ┌─────────────────────────────┐   │
│  │     ╱╲                       │   │
│  │    ╱  ╲      ╱╲              │   │
│  │   ╱    ╲    ╱  ╲             │   │
│  │  ╱      ╲  ╱    ╲            │   │
│  │ ╱        ╲╱      ╲           │   │
│  │─────────────────────────────│   │
│  │     ╱╲                       │   │
│  │    ╱  ╲      ╱╲              │   │
│  └─────────────────────────────┘   │
│  Scale: ± 45 deg                    │
└─────────────────────────────────────┘
```
- Roll line: solid, 2px width
- Pitch line: dashed, 2px width
- Grid lines (subtle)
- Y-axis: ±45 degrees
- Rolling buffer: 48 points (~10 seconds)

#### C. **Node Status Table** (Bottom Section)
```
┌─────────────────────────────────────┐
│  Node │ Status      │ Age │ Roll │ Pitch│
│  ─────┼─────────────┼─────┼──────┼──────│
│   1   │ ● CONNECTED │ 50ms│ 1.23°│ 4.56°│
│   2   │ ○ NO DATA   │ 999 │ 0.00°│ 0.00°│
│   3   │ ○ NO DATA   │ 999 │ 0.00°│ 0.00°│
│   4   │ ○ NO DATA   │ 999 │ 0.00°│ 0.00°│
│   5   │ ○ NO DATA   │ 999 │ 0.00°│ 0.00°│
└─────────────────────────────────────┘
```
- Status indicators: ● (green) = CONNECTED, ○ (red) = NO DATA
- Real-time updates for all nodes

#### D. **Connection Status** (Header)
```
┌─────────────────────────────────────┐
│  ● CONNECTED   Update Rate: 4.0 Hz  │
└─────────────────────────────────────┘
```

**Color Scheme (DELTATRIM Theme):**
- Background: `#0a0e1a` (dark blue-black)
- Card: `#141920` (slightly lighter)
- Border: `#1a1f2e` (subtle border)
- Accent (connected): `#00d4aa` (teal/green)
- Error (disconnected): `#fb7185` (pink/red)
- Text: `#ffffff` (white)
- Secondary text: `#8892b0` (muted blue-gray)

---

### 3. **Live Dashboard Integration**

**BEFORE:**
```
┌─────────────────────────────────────────────┐
│  Live Dashboard                             │
├─────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐│
│  │ Boat Comparison 1│  │ Boat Comparison 2││
│  │ [Graph]           │  │ [Graph]           ││
│  │                   │  │                   ││
│  │                   │  │                   ││
│  └──────────────────┘  └──────────────────┘│
└─────────────────────────────────────────────┘
```

**AFTER:**
```
┌─────────────────────────────────────────────┐
│  Live Dashboard                             │
├─────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐│
│  │ Receiver Data     │  │ Boat Comparison 1││
│  │                   │  │ [Graph]           ││
│  │ [Tilt Box]        │  │                   ││
│  │ [Chart]           │  │                   ││
│  │ [Node Table]      │  │                   ││
│  └──────────────────┘  └──────────────────┘│
│  ┌──────────────────┐                      │
│  │ Boat Comparison 2│                      │
│  │ [Graph]           │                      │
│  │                   │                      │
│  └──────────────────┘                      │
└─────────────────────────────────────────────┘
```

**Layout:**
- Grid: 2 columns (responsive: 1 column on mobile)
- Receiver visualization appears in first grid slot
- Styled to match DELTATRIM design system
- Real-time updates every 250ms

---

### 4. **Data Flow**

```
┌──────────────┐
│ XIAO ESP32-C3│  (Leech Node Sensor)
│  MPU6050 IMU │
└──────┬───────┘
       │ BLE
       │ (roll/pitch data)
       ▼
┌──────────────┐
│ ESP32-S3     │  (Receiver)
│ Receiver     │
│              │
│ 1. Receives  │
│    BLE data  │
│ 2. Processes │
│    data      │
│ 3. Serves:   │
│    - HTML /  │  ← Still works!
│    - JSON /api│ ← Now with CORS headers
└──────┬───────┘
       │ HTTP GET /api
       │ (via backend proxy)
       ▼
┌──────────────┐
│ Backend      │
│ server/index.js│
│ /api/esp32/data│
└──────┬───────┘
       │ Proxy request
       │ (handles CORS)
       ▼
┌──────────────┐
│ React App    │
│ Dashboard    │
│              │
│ Receiver-    │
│ Visualization│
│ Component    │
│              │
│ - Polls every│
│   250ms      │
│ - Updates    │
│   tilt box   │
│ - Updates    │
│   chart      │
│ - Updates    │
│   table      │
└──────────────┘
```

---

### 5. **Files Created/Modified**

#### **New Files:**
1. `src/components/ReceiverVisualization.jsx` - Main component
2. `src/components/ReceiverVisualization.css` - Styling
3. `src/utils/receiverDataService.js` - Data service

#### **Modified Files:**
1. `src/pages/Dashboard.jsx` - Add component to grid
2. `server/index.js` - Update proxy endpoint
3. **Receiver firmware** - Add 2 CORS header lines

---

### 6. **Key Features**

✅ **Real-time Updates:** 250ms polling interval
✅ **Tilt Box:** Visual representation of roll/pitch angles
✅ **Chart:** Historical view of roll/pitch over time
✅ **Node Table:** Status of all 5 nodes (currently showing node 1)
✅ **DELTATRIM Styling:** Matches existing design system
✅ **Responsive:** Works on mobile and desktop
✅ **Error Handling:** Graceful fallback if receiver unavailable

---

### 7. **Visual Comparison**

**Receiver's Original HTML Page:**
- Standalone page at `http://192.168.4.1/`
- Original color scheme
- Works independently

**DELTATRIM Integration:**
- Embedded in Dashboard
- DELTATRIM color scheme
- Integrated with existing UI
- Same visualization features
- Native React component (not iframe)

---

## Summary

**Receiver Firmware:** Only 2 lines added (CORS headers)
**Web App:** New React component that replicates receiver's visualization
**Integration:** Seamlessly added to Live Dashboard
**Design:** Matches DELTATRIM theme perfectly
**Functionality:** All original features preserved
