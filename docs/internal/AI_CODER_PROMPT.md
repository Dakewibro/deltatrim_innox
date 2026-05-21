# AI Coder Prompt: Add Boat Speed, Wind Speed & Wind Direction Data

## Context & Objective

You are working on the **DELTATRIM** web application - a React-based sail shape analysis platform. The existing codebase is located in this directory and includes:

- **Tech Stack**: React 18, Vite, Express.js backend
- **Current Pages**: Dashboard, Debrief, Trim+
- **Color Scheme**: Dark theme (#0a0e1a background, #00d4aa teal accent, #141920 cards)
- **Structure**: Components in `src/components/`, pages in `src/pages/`, backend in `server/`

**Your task**: Add boat speed, wind speed, and wind direction data to the platform with a **state-driven, layered, calm interface** that shows both meaningful interpretations and raw data states. This is for **demonstration purposes** - mock data is acceptable, full functionality is not required.

---

## UI/UX Philosophy: The 4-Layer Model

This is NOT a traditional dashboard. Instead, implement a **situational interface** following calm technology principles where information moves from background → foreground only when relevant.

### Layer 1 — Ambient State (Always Visible, Quiet)
- **Purpose**: Orientation, not action
- **UI Form**: Color, shape, posture, subtle text
- **Examples**: "Close-hauled", "Reaching", "Light air", "Building sea"
- **Style**: Soft background color shifts, minimal text, iconic shapes, NO numbers
- **Visual**: One-line state banner, soft gradient background, simple mode icon

### Layer 2 — Trend Awareness (Appears When Relevant)
- **Purpose**: Anticipation
- **UI Form**: Small annotations, arrows, motion cues
- **Examples**: "Persistent header", "Speed trending down", "Pressure falling"
- **Style**: Small arrows, directional motion, fading indicators, no popups
- **Visual**: Subtle arrow near wind icon, text under state line, gentle animation

### Layer 3 — Recommendation (Focused Attention)
- **Purpose**: Decision support
- **UI Form**: Single message card
- **Example**: "Recommend reef"
- **Style**: One card, one sentence, no clutter, high contrast, dismissible
- **Rule**: Only one recommendation at a time. Always.

### Layer 4 — Warning / Alarm (Override Mode)
- **Purpose**: Action now
- **UI Form**: Full attention capture
- **Style**: Screen dim except message, strong contrast, minimal text, audible + visual

---

## Data Requirements

### Three Data Types to Add:

1. **Boat Speed** (knots)
   - Raw: Numeric value (e.g., 6.2 knots)
   - Meaningful: "Optimal", "Below target", "Exceeding", "Stalled"

2. **Wind Speed** (knots)
   - Raw: Numeric value (e.g., 12 knots)
   - Meaningful: "Light air", "Moderate", "Building", "Strong", "Gusting"

3. **Wind Direction** (degrees/compass)
   - Raw: Numeric degrees (e.g., 245°) or compass (e.g., SW)
   - Meaningful: "Close-hauled", "Reaching", "Broad reach", "Running", "Header", "Lift"

### Data States to Support:

- **Real-time**: Live updating values (use mock data that updates every 2-3 seconds)
- **Offline Access**: Store recent data in localStorage for viewing when offline
- **Planning/Forecasts**: Show forecast data for next 6-12 hours (mock forecast data)

---

## Implementation Requirements

### 1. Create New Components

Create the following components in `src/components/`:

#### `AmbientState.jsx` (Layer 1)
- Displays current boat state and environment state
- Examples: "Close-hauled · Wind building" or "Reaching · Light air"
- Soft gradient background that shifts based on state
- Minimal text, large readable font
- No raw numbers visible at this layer

#### `TrendIndicator.jsx` (Layer 2)
- Shows directional arrows and trend text
- Examples: "↑ Speed trending up" or "↓ Wind building"
- Appears conditionally when trends are detected
- Subtle animations (fade in/out, gentle motion)
- Small, non-intrusive placement

#### `RecommendationCard.jsx` (Layer 3)
- Single card that appears when recommendations exist
- High contrast design (use accent color #00d4aa or warning color)
- One sentence recommendation
- Dismissible (X button or swipe)
- Only one card visible at a time

#### `WarningAlarm.jsx` (Layer 4)
- Full-screen overlay when warnings/alarms trigger
- Dims background, centers message
- High contrast text
- Requires acknowledgment to dismiss

#### `RawDataPanel.jsx` (Collapsible/Expandable)
- Shows raw numeric values for all three data types
- Collapsed by default, expandable on tap/swipe
- Clean table or list format
- Include timestamps
- Accessible via swipe down gesture or tap

#### `ForecastTimeline.jsx` (Planning Layer)
- Shows forecast data for next 6-12 hours
- Time slider or scrollable timeline
- Visual indicators for wind speed/direction changes
- Accessible via swipe up gesture or dedicated button

### 2. Data Management

#### Create `src/utils/boatData.js`:
- Mock data generator for boat speed, wind speed, wind direction
- Functions to generate realistic trends (building, falling, stable)
- Forecast data generator (6-12 hour predictions)
- localStorage utilities for offline access

#### Mock Data Structure:
```javascript
{
  timestamp: Date,
  boatSpeed: { value: 6.2, unit: 'knots', state: 'optimal' },
  windSpeed: { value: 12, unit: 'knots', state: 'moderate', trend: 'building' },
  windDirection: { value: 245, unit: 'degrees', compass: 'SW', state: 'close-hauled' },
  forecast: [
    { time: Date, windSpeed: 14, windDirection: 250, boatSpeed: 6.5 },
    // ... more forecast points
  ]
}
```

### 3. State Interpretation Logic

Create `src/utils/stateInterpreter.js`:
- Functions to interpret raw data into meaningful states
- Logic for determining boat state (close-hauled, reaching, etc.) based on wind direction
- Trend detection (building, falling, stable)
- Recommendation engine (when to recommend actions)
- Warning/alarm thresholds

### 4. Integration Points

#### Option A: New Page
- Create `src/pages/Conditions.jsx` or `src/pages/Situational.jsx`
- Add route in `App.jsx`
- Add navigation link in `Layout.jsx` sidebar

#### Option B: Enhance Dashboard
- Add the 4-layer UI to existing Dashboard
- Keep existing graph components
- Add new situational interface above or alongside graphs

**Recommendation**: Option A (new page) to keep separation of concerns, but integrate navigation seamlessly.

### 5. Styling Requirements

- **Match existing theme**: Use #0a0e1a background, #141920 cards, #00d4aa accent
- **Mobile-first**: Design for mobile viewport, responsive to desktop
- **Typography**: Large, readable fonts for ambient state, smaller for details
- **Animations**: Subtle, smooth transitions (CSS transitions preferred)
- **Color semantics**:
  - Green/teal: Optimal/good states
  - Yellow: Caution/warnings
  - Red: Alarms/critical
  - Blue: Neutral/info

### 6. Interaction Model

- **Default**: Read-only, glanceable (no tapping required)
- **Swipe up**: Show forecast/history
- **Swipe down**: Show raw data/context
- **Tap**: Show confidence explanation or expand details
- **Long press**: Access settings or advanced view

### 7. Offline Support

- Store last 100 data points in localStorage
- Show "Offline" indicator when no new data available
- Allow viewing historical data when offline
- Sync indicator when connection restored

---

## Visual Design Guidelines

### Good Patterns (Use These):
- State labels ("Close-hauled", "Light air")
- Directional arrows (↑ ↓ → ←)
- Progress bars for trends
- Color semantics (green/yellow/red)
- Confidence shading (opacity)
- Minimal, clean layouts

### Bad Patterns (Avoid These):
- Circular gauges
- Analog dials
- Needle instruments
- Multi-metric dashboards
- Dense charts
- Overwhelming numbers

### Visual Language Mapping:
- **Stability** → Solid shapes
- **Change** → Motion/animation
- **Risk** → Color shift
- **Confidence** → Opacity
- **Urgency** → Contrast
- **Persistence** → Thickness

---

## Technical Implementation Notes

1. **Real-time Updates**: Use `setInterval` or `useEffect` with timer to update mock data every 2-3 seconds
2. **State Management**: Use React `useState` and `useEffect` hooks (no need for Redux/Context unless complex)
3. **Responsive Design**: Use CSS media queries, ensure mobile-first approach
4. **Accessibility**: Include ARIA labels, keyboard navigation support
5. **Performance**: Optimize re-renders, use React.memo where appropriate
6. **Browser Storage**: Use localStorage API for offline data persistence

---

## File Structure to Create

```
src/
├── components/
│   ├── AmbientState.jsx          # Layer 1
│   ├── AmbientState.css
│   ├── TrendIndicator.jsx        # Layer 2
│   ├── TrendIndicator.css
│   ├── RecommendationCard.jsx    # Layer 3
│   ├── RecommendationCard.css
│   ├── WarningAlarm.jsx          # Layer 4
│   ├── WarningAlarm.css
│   ├── RawDataPanel.jsx          # Raw data view
│   ├── RawDataPanel.css
│   └── ForecastTimeline.jsx      # Forecast view
│   └── ForecastTimeline.css
├── pages/
│   ├── Conditions.jsx            # New page (or enhance Dashboard)
│   └── Conditions.css
├── utils/
│   ├── boatData.js               # Mock data generators
│   └── stateInterpreter.js       # State interpretation logic
```

---

## Success Criteria

✅ All three data types (boat speed, wind speed, wind direction) are displayed
✅ Both meaningful states and raw values are accessible
✅ 4-layer UI model is implemented (ambient, trend, recommendation, warning)
✅ Real-time updates work (mock data updating every 2-3 seconds)
✅ Offline access works (localStorage persistence)
✅ Forecast/planning view is available
✅ Design matches existing DELTATRIM theme
✅ Mobile-responsive and touch-friendly
✅ Smooth animations and transitions
✅ Code is clean, commented, and follows existing patterns

---

## Example User Flow

1. User navigates to Conditions page
2. Sees ambient state: "Close-hauled · Wind building" (Layer 1)
3. Notices subtle trend indicator: "↑ Wind speed increasing" (Layer 2)
4. Recommendation card appears: "Consider reefing in 5 minutes" (Layer 3)
5. Swipes down to see raw data: "Boat: 6.2 kts, Wind: 12 kts @ 245°"
6. Swipes up to see forecast timeline for next 6 hours
7. Data continues updating in real-time
8. Goes offline, still sees last 100 data points

---

## Additional Notes

- This is a **demonstration/prototype** - functionality doesn't need to be fully real
- Mock data is acceptable and encouraged
- Focus on UI/UX excellence over backend complexity
- Reference existing components (Graph.jsx, Layout.jsx) for styling patterns
- Keep code modular and reusable
- Add helpful comments explaining the 4-layer model

---

## Questions to Consider

If you need clarification, consider:
- Should this be a new page or integrated into Dashboard?
- What are reasonable thresholds for warnings vs. recommendations?
- How detailed should the forecast visualization be?
- Should there be multiple boat support or single boat focus?

**Default answers**: New page, moderate thresholds (configurable), simple forecast visualization, single boat focus for MVP.

---

**Start implementing!** Remember: calm technology, situational awareness, not a dashboard. 🚤⛵
