# Receiver + Leech Node: No Data / No Serial Output

Use this guide when the ESP32-S3 receiver and XIAO leech node are both on but you get no data on the platform and nothing (or very little) in the PlatformIO serial monitor.

---

## 1. Which Firmware Is on the XIAO? (Most Common Cause)

There are **two different XIAO firmwares**:

| Firmware | Behavior | Use with receiver? |
|----------|----------|--------------------|
| **WiFi + Supabase** (e.g. `firmware/esp32c3_final` in this repo) | Connects to WiFi, sends to Supabase. **Does not use BLE.** | **No** – receiver will never see it |
| **BLE Leech Node** | Advertises as `LEECH_NODE_1` (or `LEECH_NODE_X`), sends roll/pitch over BLE | **Yes** – this is what the receiver expects |

**If the XIAO is running the WiFi+Supabase firmware (e.g. from `firmware/esp32c3_final`):**

- It will try to connect to your WiFi and Supabase.
- It will **not** advertise as `LEECH_NODE_1`.
- The receiver scans only for BLE names like `LEECH_NODE_1`, so it will never find the node and you will get no data.

**Fix:** Flash the **BLE leech node** firmware to the XIAO. That firmware must:

- Use BLE (e.g. NimBLE).
- Advertise a name like `LEECH_NODE_1` (with `NODE_ID=1` or similar).
- Expose a characteristic that sends roll/pitch (and match the UUID/format the receiver expects).

The BLE node code may live in a different folder or repo (e.g. “XIAO CODE main.cpp” from your setup). The `firmware/esp32c3_final` project in this repo is **not** the BLE node firmware.

---

## 2. Serial Monitor: Which Board and Which Project?

You said you use “PlatformIO serial monitor on a separate folder” – that should be the **receiver** project.

- **Receiver (ESP32-S3):**  
  - Open the **receiver’s** PlatformIO project (the “separate folder”).  
  - Connect the ESP32-S3 via USB.  
  - In PlatformIO: **Monitor** (or “Serial Monitor”), baud rate **115200**, select the **receiver’s** USB port.  
  - After opening the monitor, press **RESET** on the ESP32-S3 so you see boot messages.

- **Node (XIAO ESP32-C3):**  
  - If you want to confirm the node is running, open a **second** VSCode window (or another serial tool) with the **XIAO’s** project and connect to the XIAO’s USB port.  
  - Baud rate **115200**.  
  - You should see IMU/BLE advertising messages if the BLE node firmware is running.

**Why “nothing” in serial?**

- Wrong **port**: you’re watching the XIAO’s port while the receiver is on another port (or the other way around).
- Wrong **baud**: use **115200** for both (unless your code explicitly uses something else).
- Receiver code doesn’t print much in `loop()`: e.g. it only prints when it finds/connects to a node. If no node is found (e.g. wrong firmware on XIAO), you may see almost nothing.
- Monitor opened **before** RESET: open serial first, then press RESET on the board you’re monitoring.

---

## 3. BLE: Names and IDs Must Match

- **Node name:** The XIAO (BLE node firmware) must advertise as **`LEECH_NODE_1`** for node ID 1 (or `LEECH_NODE_2`, etc., depending on your receiver).
- **Receiver scan:** The receiver must be scanning for that exact name pattern (e.g. `LEECH_NODE_1` or `LEECH_NODE_X`).
- **Node ID:** If the receiver expects node index 1, the node should use `NODE_ID=1` and advertise as `LEECH_NODE_1`.

Check your receiver code for the exact string it looks for (e.g. `"LEECH_NODE_1"` or `"LEECH_NODE_"` + node id). Check your node code for the advertised name. They must match.

---

## 4. Quick Checklist

- [ ] **XIAO has BLE node firmware** (advertises as `LEECH_NODE_1`), not WiFi+Supabase firmware.
- [ ] **Receiver firmware** is the one that scans for `LEECH_NODE_X` and connects/subscribes to the angles characteristic.
- [ ] **Serial monitor** is opened on the **receiver** project, correct USB port for the **ESP32-S3**, baud **115200**, then **RESET** the receiver.
- [ ] **Distance:** Node and receiver within a few meters (BLE range).
- [ ] **Power:** Both boards powered (USB or battery). Node not in deep sleep unless your design uses it.
- [ ] **One USB port per board:** When monitoring the receiver, only the receiver should be on that port (or you’ll get wrong port in the list).

---

## 5. If You Only Have WiFi+Supabase XIAO Code (`firmware/esp32c3_final`)

This repo’s `firmware/esp32c3_final` project is **WiFi + Supabase**; it does **not** implement the BLE leech node. So:

- You **cannot** use `firmware/esp32c3_final` as the “leech node” for the receiver.
- You need the **BLE leech node** firmware (the one that advertises as `LEECH_NODE_1` and sends roll/pitch over BLE). That might be in another folder or from a previous “XIAO CODE” you received.
- Flash that BLE node firmware to the XIAO, then use the receiver as usual.

---

## 6. Verify Receiver and Web App

Once BLE is working:

1. Connect the **laptop** to the receiver’s WiFi: **LEECH_RECEIVER** (password: **12345678**).
2. Run backend: `npm run server`.
3. Run frontend: `npm run dev`.
4. Open **Live Dashboard** – the “Receiver Data” widget should show **CONNECTED** and node 1 data when the receiver is receiving from the node.

If the receiver’s serial monitor shows that it found and connected to `LEECH_NODE_1` but the web app still shows “NO DATA”, then the issue is between receiver and laptop (WiFi, backend proxy, or frontend) - see `docs/platform/RECEIVER_LOCAL_SETUP.md`.

---

## Summary

| Symptom | Likely cause | Action |
|--------|----------------|--------|
| No data from node, nothing useful in serial | XIAO running WiFi+Supabase firmware | Flash **BLE leech node** firmware to XIAO |
| Serial completely empty | Wrong port, wrong baud, or monitor opened after boot | Use receiver’s port, 115200, open monitor then RESET receiver |
| Receiver prints but “no node found” | Node not advertising or name mismatch | Ensure node advertises as `LEECH_NODE_1` (or what receiver expects) |
| Node and receiver paired but no data on web app | Laptop not on receiver WiFi or backend not running | Connect to LEECH_RECEIVER WiFi, run `npm run server` and `npm run dev` |

Start by confirming the XIAO is running the **BLE leech node** firmware that advertises as **`LEECH_NODE_1`** (or the correct `LEECH_NODE_X`). That fixes most “receiver and node on but no data” cases.
