import tkinter as tk
from tkinter import messagebox
import threading
import json
import time
import random
import paho.mqtt.client as mqtt

from cembesli_data_generator import SolarPanelSensor


class Publisher(tk.Tk):

    BROKER = "localhost"
    PORT   = 1883

    DARK = {
        "bg": "#060612", "panel": "#0d0d1f", "border": "#1e2a4a",
        "accent": "#00d4ff", "fg": "#e0e8ff", "fg2": "#6a7a9a",
        "entry_bg": "#0a0a1e", "log_bg": "#07071a", "log_fg": "#4a9eff",
        "ok": "#00ff88", "warn": "#ff6b35",
        "btn_start": "#00c853", "btn_stop": "#ff1744", "btn_exit": "#37474f",
    }
    LIGHT = {
        "bg": "#f0f4ff", "panel": "#ffffff", "border": "#c5d0e8",
        "accent": "#0077cc", "fg": "#1a2340", "fg2": "#7a8ab0",
        "entry_bg": "#eef2ff", "log_bg": "#f8f9ff", "log_fg": "#0055aa",
        "ok": "#00a855", "warn": "#e65c00",
        "btn_start": "#00a855", "btn_stop": "#cc1133", "btn_exit": "#607d8b",
    }

    def __init__(self):
        super().__init__()
        self.title("Solar Panel Publisher  //  COMP216")
        self.geometry("520x660")
        self.resizable(False, False)

        self._running       = False
        self._send_count    = 0
        self._skip_count    = 0
        self._corrupt_count = 0
        self._packet_id     = 111
        self._sensor        = None
        self._thread        = None
        self._dark          = True
        self._T             = self.DARK
        self._LOCATIONS     = ["Rooftop A", "Rooftop B", "Carport", "Ground Mount"]

        self._build_ui()
        self._apply_theme()

    def _build_ui(self):
        # ── HEADER ─────────────────────────────────────────────
        self._header = tk.Frame(self)
        self._header.pack(fill=tk.X)

        self._title = tk.Label(self._header,
                               text="  ◈  SOLAR PANEL PUBLISHER",
                               font=("Courier New", 11, "bold"))
        self._logo_canvas = tk.Canvas(self._header, width=32, height=32,
                                          bd=0, highlightthickness=0)
        self._logo_canvas.pack(side=tk.LEFT, padx=(12,0), pady=8)

        self._title.pack(side=tk.LEFT, padx=8, pady=(10,2))

        self._mode_btn = tk.Button(self._header, text="◐  LIGHT",
                                   font=("Courier New", 8, "bold"),
                                   bd=0, cursor="hand2", width=9,
                                   command=self._toggle_theme)
        self._mode_btn.pack(side=tk.RIGHT, padx=14, pady=10)

        self._sub = tk.Label(self._header,
                             text="COMP216  ·  Cembesli",
                             font=("Courier New", 8))
        self._sub.pack(side=tk.LEFT, padx=18, pady=(0,8))

        self._div1 = tk.Frame(self, height=1)
        self._div1.pack(fill=tk.X)

        # ── PARAMETERS ─────────────────────────────────────────
        self._pcard = tk.Frame(self, pady=8, padx=16)
        self._pcard.pack(fill=tk.X, padx=14, pady=(8, 0))

        self._plbl = tk.Label(self._pcard, text="◆ PARAMETERS",
                              font=("Courier New", 8, "bold"))
        self._plbl.pack(anchor="w", pady=(0, 6))

        self.peak_var     = tk.StringVar(value="400")
        self.interval_var = tk.StringVar(value="1")
        self.topic_var    = tk.StringVar(value="solar/panels")
        self.corrupt_var  = tk.StringVar(value="0.02")

        self._pentries = []
        self._plabels  = []
        params = [
            ("PEAK WATTS",     self.peak_var),
            ("INTERVAL (SEC)", self.interval_var),
            ("TOPIC",          self.topic_var),
            ("CORRUPT RATE",   self.corrupt_var),
        ]
        for lbl, var in params:
            row = tk.Frame(self._pcard)
            row.pack(fill=tk.X, pady=2)
            l = tk.Label(row, text=lbl, font=("Courier New", 8),
                         width=18, anchor="w")
            l.pack(side=tk.LEFT)
            e = tk.Entry(row, textvariable=var, width=24,
                         font=("Courier New", 10), relief=tk.FLAT,
                         bd=0, highlightthickness=1)
            e.pack(side=tk.LEFT, ipady=4, padx=(4, 0))
            self._plabels.append(l)
            self._pentries.append(e)

        self._div2 = tk.Frame(self, height=1)
        self._div2.pack(fill=tk.X, padx=14, pady=(8, 0))

        # ── STATUS ─────────────────────────────────────────────
        self._scard = tk.Frame(self, pady=6, padx=16)
        self._scard.pack(fill=tk.X, padx=14)

        self._slbl = tk.Label(self._scard, text="◆ STATUS",
                              font=("Courier New", 8, "bold"))
        self._slbl.pack(anchor="w", pady=(0, 2))

        self.status_var = tk.StringVar(value="STANDBY")
        self._sval = tk.Label(self._scard, textvariable=self.status_var,
                              font=("Courier New", 11, "bold"), anchor="w")
        self._sval.pack(fill=tk.X)

        self._div3 = tk.Frame(self, height=1)
        self._div3.pack(fill=tk.X, padx=14, pady=(6, 0))

        # ── LOG ────────────────────────────────────────────────
        self._lcard = tk.Frame(self, pady=6, padx=16)
        self._lcard.pack(fill=tk.BOTH, expand=True, padx=14)

        self._llbl = tk.Label(self._lcard, text="◆ TRANSMISSION LOG",
                              font=("Courier New", 8, "bold"))
        self._llbl.pack(anchor="w", pady=(0, 4))

        self.log_box = tk.Text(self._lcard, font=("Courier New", 9),
                               state=tk.DISABLED, relief=tk.FLAT,
                               bd=0, highlightthickness=1, height=10)
        self.log_box.pack(fill=tk.BOTH, expand=True, ipady=6, ipadx=6)

        self._div4 = tk.Frame(self, height=1)
        self._div4.pack(fill=tk.X, padx=14, pady=(6, 0))

        # ── BUTTONS ────────────────────────────────────────────
        self._bframe = tk.Frame(self, pady=12)
        self._bframe.pack()

        self.start_btn = tk.Button(self._bframe, text="▶  START",
                                   font=("Courier New", 10, "bold"),
                                   fg="white", relief=tk.FLAT, bd=0,
                                   cursor="hand2", width=11, pady=6,
                                   command=self._start)
        self.start_btn.grid(row=0, column=0, padx=6)

        self.stop_btn = tk.Button(self._bframe, text="■  STOP",
                                  font=("Courier New", 10, "bold"),
                                  fg="white", relief=tk.FLAT, bd=0,
                                  cursor="hand2", width=11, pady=6,
                                  state=tk.DISABLED,
                                  command=self._stop)
        self.stop_btn.grid(row=0, column=1, padx=6)

        self.exit_btn = tk.Button(self._bframe, text="✕  EXIT",
                                  font=("Courier New", 10, "bold"),
                                  fg="white", relief=tk.FLAT, bd=0,
                                  cursor="hand2", width=9, pady=6,
                                  command=self._exit)
        self.exit_btn.grid(row=0, column=2, padx=6)

        self.protocol("WM_DELETE_WINDOW", self._exit)


    def _draw_logo(self, canvas):
        """Draw CB initials logo on a small canvas."""
        canvas.delete("all")
        T = self._T
        bg = T["panel"]
        ac = T["accent"]
        canvas.configure(bg=bg)
        # Outer circle
        canvas.create_oval(3, 3, 29, 29, outline=ac, width=2, fill=bg)
        # C arc (left half)
        canvas.create_arc(5, 5, 27, 27, start=45, extent=270,
                          outline=ac, width=2, style="arc")
        # B vertical bar
        canvas.create_line(18, 8, 18, 24, fill=ac, width=2)
        # B top bump
        canvas.create_arc(18, 8, 26, 16, start=270, extent=180,
                          outline=ac, width=2, style="arc")
        # B bottom bump
        canvas.create_arc(18, 16, 27, 24, start=270, extent=180,
                          outline=ac, width=2, style="arc")

    def _apply_theme(self):
        T = self._T
        self.configure(bg=T["bg"])
        self._header.configure(bg=T["panel"])
        self._draw_logo(self._logo_canvas)
        self._title.configure(bg=T["panel"], fg=T["accent"])
        self._sub.configure(bg=T["panel"], fg=T["fg2"])
        self._mode_btn.configure(bg=T["panel"], fg=T["fg2"],
                                 activebackground=T["panel"],
                                 text="◐  LIGHT" if self._dark else "◑  DARK")

        for d in [self._div1, self._div2, self._div3, self._div4]:
            d.configure(bg=T["border"])

        for c in [self._pcard, self._scard, self._lcard]:
            c.configure(bg=T["bg"])

        for l in [self._plbl, self._slbl, self._llbl]:
            l.configure(bg=T["bg"], fg=T["accent"])

        for row in self._pcard.winfo_children()[1:]:
            row.configure(bg=T["bg"])

        for l in self._plabels:
            l.configure(bg=T["bg"], fg=T["fg2"])

        for e in self._pentries:
            e.configure(bg=T["entry_bg"], fg=T["fg"],
                        insertbackground=T["accent"],
                        highlightbackground=T["border"],
                        highlightcolor=T["accent"])

        self._sval.configure(bg=T["bg"], fg=T["ok"])
        self.log_box.configure(bg=T["log_bg"], fg=T["log_fg"],
                               highlightbackground=T["border"],
                               highlightcolor=T["accent"])

        self._bframe.configure(bg=T["bg"])
        self.start_btn.configure(bg=T["btn_start"],
                                 activebackground=T["btn_start"])
        self.stop_btn.configure(bg=T["btn_stop"],
                                activebackground=T["btn_stop"])
        self.exit_btn.configure(bg=T["btn_exit"],
                                activebackground=T["btn_exit"])

    def _toggle_theme(self):
        self._dark = not self._dark
        self._T    = self.DARK if self._dark else self.LIGHT
        self._apply_theme()

    def _log(self, msg):
        self.log_box.config(state=tk.NORMAL)
        self.log_box.insert(tk.END, msg + "\n")
        self.log_box.see(tk.END)
        self.log_box.config(state=tk.DISABLED)

    def _start(self):
        try:
            peak         = float(self.peak_var.get())
            interval     = float(self.interval_var.get())
            corrupt_rate = float(self.corrupt_var.get())
        except ValueError:
            messagebox.showerror("Error", "All parameters must be numbers.")
            return

        self._running       = True
        self._send_count    = 0
        self._skip_count    = 0
        self._corrupt_count = 0
        self._sensor        = SolarPanelSensor(peak_watts=peak)

        self.start_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.NORMAL)
        self.status_var.set("TRANSMITTING...")
        self._sval.configure(fg=self._T["ok"])

        self._thread = threading.Thread(
            target=self._publish_loop,
            args=(interval, corrupt_rate), daemon=True)
        self._thread.start()

    def _stop(self):
        self._running = False
        self.start_btn.config(state=tk.NORMAL)
        self.stop_btn.config(state=tk.DISABLED)
        self.status_var.set(
            f"STOPPED  ·  TX:{self._send_count}  "
            f"SKIP:{self._skip_count}  ERR:{self._corrupt_count}")
        self._sval.configure(fg=self._T["warn"])
        self._log("────────────── STOPPED ──────────────")

    def _exit(self):
        self._running = False
        self.destroy()

    def _publish_loop(self, interval, corrupt_rate):
        topic = self.topic_var.get()
        while self._running:
            power, weather = self._sensor.get_reading()

            if random.random() < corrupt_rate:
                power  = random.choice([-999.9, 9999.9, -500.0, 1500.0])
                status = "CORRUPT"
                self._corrupt_count += 1
            else:
                peak  = self._sensor._peak_watts
                ratio = power / peak if peak > 0 else 0
                if ratio >= 0.40:
                    status = "OK"
                elif ratio >= 0.10:
                    status = "LOW"
                else:
                    status = "CRITICAL"

            if random.random() < 0.01:
                self._skip_count += 1
                self.after(0, lambda sc=self._skip_count:
                           self._log(f"  [SKIP] ··· total: {sc}"))
                time.sleep(interval)
                continue

            data = {
                "id":           self._packet_id,
                "location":     random.choice(self._LOCATIONS),
                "timestamp":    time.asctime(),
                "power_output": power,
                "efficiency":   round(random.gauss(19.5, 0.4), 2),
                "temperature":  round(random.gauss(45.0, 2.5), 1),
                "voltage":      round(random.gauss(36.0, 0.5), 2),
                "current":      round(abs(power) / 36.0, 3),
                "environment": {
                    "ambient_temp": round(random.gauss(22.0, 3.0), 1),
                    "irradiance":   round(random.gauss(800, 50), 1),
                    "wind_speed":   round(abs(random.gauss(10, 4)), 1),
                    "weather":      weather,
                },
                "status": status,
            }

            try:
                client = mqtt.Client(client_id=f"cembesli_pub_{id(self)}")
                client.connect(self.BROKER, self.PORT)
                client.loop_start()
                client.publish(topic, json.dumps(data))
                # also publish status to second topic
                status_data = {
                    "id":        data["id"],
                    "timestamp": data["timestamp"],
                    "status":    data["status"],
                    "power":     data["power_output"],
                    "weather":   data["environment"]["weather"],
                }
                client.publish("solar/status", json.dumps(status_data))
                # third topic — only LOW, CRITICAL, CORRUPT alerts
                if data["status"] in ("LOW", "CRITICAL", "CORRUPT"):
                    alert_data = {
                        "id":        data["id"],
                        "timestamp": data["timestamp"],
                        "status":    data["status"],
                        "power":     data["power_output"],
                        "location":  data["location"],
                    }
                    client.publish("solar/alerts", json.dumps(alert_data))
                time.sleep(0.1)
                client.loop_stop()
                client.disconnect()
            except Exception as e:
                self.after(0, lambda err=e:
                           self._log(f"  [ERROR] {err}"))
                time.sleep(interval)
                continue

            self._send_count += 1
            self._packet_id  += 1

            self.after(0, lambda d=data, sc=self._send_count:
                       self._log(
                           f"  TX #{sc:04d}  "
                           f"ID:{d['id']}  "
                           f"{d['power_output']:>7.2f} W  "
                           f"{d['environment']['weather']:<15}  "
                           f"[{d['status']}]"))
            self.after(0, lambda sc=self._send_count:
                       self.status_var.set(
                           f"TRANSMITTING  ·  TX:{sc}  "
                           f"SKIP:{self._skip_count}  "
                           f"ERR:{self._corrupt_count}"))

            time.sleep(interval)


if __name__ == "__main__":
    app = Publisher()
    app.mainloop()