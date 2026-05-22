# DELTATRIM

DELTATRIM is a sailing performance analysis platform that turns sail-shape and motion data into a coach-friendly review experience.

The project combines a polished web interface, a lightweight local API layer, and ESP32-based telemetry experiments to show how onboard sensor data can move from hardware to dashboards, debrief tools, and analysis workflows.
##Fun Fact

This team behind this project was awarded **HKD 100,000** in support from **HKSTP** following the **InnoX HK Entrepreneurship Program, Winter 2026 batch**.

## What This Product Does

DELTATRIM is designed to help coaches and teams review how a boat is moving and how sail shape changes over time.

In the current prototype, the product includes:

- A `Dashboard` for live-style receiver and comparison views
- A `Debrief` view for leech profile analysis and video review
- A `Trim+` workspace for graph comparison, media review, and AI-assisted prompting

The repository also keeps the backend and hardware code that supported the broader telemetry and ingestion prototype.

## Live Demo

You can access the interface here: https://deltatrim.netlify.app/

## Repo contents

This repository is intentionally broader than the demo site.

It includes:

- Interface for sailing coaches and performance reviewers
- API design for telemetry ingestion and monitoring endpoints
- ESP32-based hardware experiments for simulated IoT sensor data
- Cloud and data-pipeline exploration for moving telemetry into usable interfaces
- Low-latency data analysis workflows for performance-pattern exploration

See [docs/product/RECOGNITION.md](/Users/Deaptheror/Downloads/DeltaTrim%20figma%20UI/docs/product/RECOGNITION.md) for the repo note.

## Repository Layout

```text
.
├── src/                     # Frontend app (React + Vite)
├── public/                  # Static assets for the web app
├── server/                  # Local Express API used during prototype development
├── firmware/                # Embedded / ESP32 telemetry work
│   └── esp32c3_final/
├── docs/
│   ├── product/             # Product previews and recognition notes
│   ├── platform/            # Environment, receiver, and deployment-related notes
│   ├── data/                # SQL and Supabase-related reference material
│   ├── firmware/            # Reserved for firmware-facing documentation
│   └── internal/            # Internal prompt / build artifacts worth preserving
├── netlify.toml             # Static deployment routing config
└── package.json             # Frontend and local API scripts
```

See [docs/README.md](/Users/Deaptheror/Downloads/DeltaTrim%20figma%20UI/docs/README.md) for a documentation map.

## Product Experience

### Dashboard

The dashboard is the live-facing surface of the product. It brings together receiver visualization and comparison graphs so a coach can quickly understand current motion signals and boat differences.

### Debrief

The debrief flow is for review after a session. It combines sail-shape visualization with video context to help explain what happened, not just show raw values.

### Trim+

Trim+ is positioned as a more exploratory workspace. It blends chart comparison, media handling, and prompt-driven analysis ideas into one place for deeper review.

## Technical Overview

### Frontend

The frontend lives in `src/` and is built with React, Vite, and `react-router-dom`.
It provides the product UI, route structure, and custom visualizations.

### Local API

The local API in `server/index.js` was used during prototype development for:

- boat comparison data
- image upload endpoints
- mock AI prompt responses
- ESP32 receiver proxying

This is kept in the repo as part of the technical story, even though the static Netlify deployment does not run the Express server.

### Hardware and Telemetry

The hardware work lives in [firmware/esp32c3_final](/Users/Deaptheror/Downloads/DeltaTrim%20figma%20UI/firmware/esp32c3_final).
It demonstrates how an ESP32-based sensor node can generate, format, and transmit motion data for downstream consumption.

This part of the repo supports claims around:

- telemetry collection from simulated IoT-style sensors
- ingestion-oriented data formatting
- monitoring and review tooling
- experimentation around performance-pattern analysis

## Running Locally

### Static frontend only

```bash
npm install
npm run dev
```

### Frontend plus local API

```bash
npm install
npm run server
npm run dev
```

You can also use:

```bash
./start.sh
```

## Deployment

This repository currently targets a static Netlify deployment for the frontend demo.

`netlify.toml` already includes:

- the build command
- the publish directory
- single-page-app route rewrites

API-backed features in `server/` are preserved in the repo for completeness, but they are not part of the static hosting path.

## Suggested Reading

- [docs/README.md](/Users/Deaptheror/Downloads/DeltaTrim%20figma%20UI/docs/README.md)
- [docs/product/INTEGRATION_PREVIEW.md](/Users/Deaptheror/Downloads/DeltaTrim%20figma%20UI/docs/product/INTEGRATION_PREVIEW.md)
- [docs/platform/RECEIVER_LOCAL_SETUP.md](/Users/Deaptheror/Downloads/DeltaTrim%20figma%20UI/docs/platform/RECEIVER_LOCAL_SETUP.md)
- [firmware/esp32c3_final/README.md](/Users/Deaptheror/Downloads/DeltaTrim%20figma%20UI/firmware/esp32c3_final/README.md)
