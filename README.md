# ☀ Solar Panel IoT Monitoring System

A real-time IoT data pipeline that simulates, transmits, and visualizes solar panel power output using Python and MQTT protocol.

---

## 🖥 Screenshots

> Publisher (left) · Subscriber Dashboard (center) · Alert Monitor (right)

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.13 |
| GUI | Tkinter (Canvas, Threading) |
| Messaging Protocol | MQTT (paho-mqtt) |
| Broker | Eclipse Mosquitto |
| Data Simulation | Custom sensor class with math.sin day cycle |
| Serialization | JSON |

---

## 📐 Architecture

```
[Publisher GUI]
      │
      │  JSON payload over MQTT
      ▼
[Mosquitto Broker] ──── solar/panels ────► [Subscriber Dashboard]
      │              ── solar/status ────►        (Live Chart)
      └──────────── solar/alerts ─────►  [Alert Monitor]
```

---

## 📁 File Structure

```
solar-panel-iot-system/
│
├── cembesli_data_generator.py   # SolarPanelSensor class — simulates real solar panel
├── cembesli_publisher.py        # Publisher GUI — sends data to MQTT broker
├── cembesli_subscriber.py       # Subscriber GUI — live chart + latest readings
├── cembesli_subscriber2.py      # Alert Monitor — tracks LOW / CRITICAL / CORRUPT
└── README.md
```

---

## ⚙ Features

### Data Generator
- Models a full solar day cycle using `math.sin` — output rises at sunrise, peaks at noon, drops at sunset
- Cyclical and unlimited — never runs out of readings
- Weather simulation: **Clear, Partly Cloudy, Overcast, Foggy** — each affects power output with realistic multipliers
- Gaussian noise for realistic sensor variance

### Publisher
- Tkinter GUI with configurable parameters (peak watts, interval, topic, corrupt rate)
- Publishes to **3 MQTT topics** simultaneously:
  - `solar/panels` — full sensor payload
  - `solar/status` — status summary
  - `solar/alerts` — only LOW / CRITICAL / CORRUPT events
- Non-deterministic packet skip (~1 in 100) to simulate real network loss
- Corrupt data injection to test subscriber resilience
- Dark / Light mode toggle

### Subscriber Dashboard
- Live power output chart drawn with **Tkinter Canvas** (no matplotlib)
- Missing packet detection via ID gap analysis
- Out-of-range and corrupt value rejection
- Watchdog timer — alerts if no data received for 5+ seconds
- Dark / Light mode toggle

### Alert Monitor
- Dedicated panel for LOW / CRITICAL / CORRUPT alerts
- Real-time alert counter per severity
- Alert log with timestamp and location

---

## 🚀 How to Run

### Prerequisites
```bash
pip install paho-mqtt
```
Install [Eclipse Mosquitto](https://mosquitto.org/download/) broker.

### Start

```bash
# Terminal 1 — Start broker
mosquitto -v

# Terminal 2 — Start main subscriber
python cembesli_subscriber.py

# Terminal 3 — Start alert monitor
python cembesli_subscriber2.py

# Terminal 4 — Start publisher
python cembesli_publisher.py
```

---

## 📊 Data Payload Structure

```json
{
  "id": 142,
  "location": "Rooftop A",
  "timestamp": "Mon Apr 21 14:32:01 2026",
  "power_output": 312.45,
  "efficiency": 19.67,
  "temperature": 44.2,
  "voltage": 36.12,
  "current": 8.648,
  "environment": {
    "ambient_temp": 22.4,
    "irradiance": 812.3,
    "wind_speed": 9.2,
    "weather": "Clear"
  },
  "status": "OK"
}
```

---

## 👤 Author

**Cem Besli**
Software Engineering Technology — Centennial College
[cembesli.com](https://cembesli.com) · [cem@cembesli.com](mailto:cem@cembesli.com)
