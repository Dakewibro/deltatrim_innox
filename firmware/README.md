# Firmware Overview

This folder contains the embedded and telemetry-facing parts of the DELTATRIM prototype.

## Current Project

- [esp32c3_final/](/Users/Deaptheror/Downloads/DeltaTrim%20figma%20UI/firmware/esp32c3_final)
  Finalized ESP32-C3 prototype for collecting IMU-style motion data and forwarding it into the broader DELTATRIM workflow.

## Why It Lives Here

The web app can be deployed as a static product demo, but the firmware work is kept in the same repository to document the larger product story:

- simulated IoT sensor data collection
- device-side telemetry formatting
- integration with ingestion and monitoring flows
- end-to-end prototype evidence for the sailing analytics concept
