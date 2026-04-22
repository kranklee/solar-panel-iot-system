import tkinter as tk
import threading
import json
import time
import paho.mqtt.client as mqtt


class Subscriber(tk.Tk):

    BROKER          = "localhost"
    PORT            = 1883
    TOPIC1          = "solar/panels"
    TOPIC2          = "solar/status"
    TOPIC3          = "solar/alerts"
    MAX_POINTS      = 50
    MISSING_TIMEOUT = 5

    CW = 660
    CH = 210
    PL, PR, PT, PB = 55, 20, 20, 36

    DARK = {
        "bg": "#060612", "panel": "#0d0d1f", "border": "#1e2a4a",
        "accent": "#00d4ff", "fg": "#e0e8ff", "fg2": "#6a7a9a",
        "canvas_bg": "#07071a", "entry_bg": "#0a0a1e",
        "ok": "#00ff88", "warn": "#ff6b35", "err": "#ff3366",
        "btn_exit": "#37474f", "grid": "#111130", "axis": "#2a3a5a",
        "line": "#00d4ff", "fill": "#00d4ff", "dot": "#ffffff",
        "lbl_fg": "#00d4ff",
    }
    LIGHT = {
        "bg": "#f0f4ff", "panel": "#ffffff", "border": "#c5d0e8",
        "accent": "#0077cc", "fg": "#1a2340", "fg2": "#7a8ab0",
        "canvas_bg": "#ffffff", "entry_bg": "#eef2ff",
        "ok": "#00a855", "warn": "#e65c00", "err": "#cc0033",
        "btn_exit": "#607d8b", "grid": "#e8eeff", "axis": "#aabbcc",
        "line": "#0077cc", "fill": "#0077cc", "dot": "#003366",
        "lbl_fg": "#0077cc",
    }

    def __init__(self):
        super().__init__()
        self.title("Solar Panel Subscriber  //  COMP216")
        self.geometry("740x700")
        self.resizable(False, False)

        self._client        = None
        self._connected     = False
        self._readings      = []
        self._recv_count    = 0
        self._missing_count = 0
        self._bad_count     = 0
        self._last_id       = None
        self._last_recv     = None
        self._dark          = True
        self._T             = self.DARK
        self.POWER_MAX      = 420.0
        self.POWER_MIN      = -1.0

        self._build_ui()
        self._apply_theme()
        self._start_subscriber()
        self._watchdog()

    def _build_ui(self):
        # header
        self._header = tk.Frame(self)
        self._header.pack(fill=tk.X)

        self._logo_canvas = tk.Canvas(self._header, width=32, height=32,
                                      bd=0, highlightthickness=0)
        self._logo_canvas.pack(side=tk.LEFT, padx=(12, 0), pady=8)

        self._title = tk.Label(self._header,
                               text="  ◈  SOLAR PANEL SUBSCRIBER",
                               font=("Courier New", 11, "bold"))
        self._title.pack(side=tk.LEFT, padx=8, pady=(10, 2))

        self._mode_btn = tk.Button(self._header, text="◐  LIGHT",
                                   font=("Courier New", 8, "bold"),
                                   bd=0, cursor="hand2", width=9,
                                   command=self._toggle_theme)
        self._mode_btn.pack(side=tk.RIGHT, padx=14, pady=12)

        self._sub = tk.Label(self._header, text="COMP216  ·  Cembesli",
                             font=("Courier New", 8))
        self._sub.pack(side=tk.LEFT, padx=18, pady=(0, 8))

        self._div1 = tk.Frame(self, height=1)
        self._div1.pack(fill=tk.X)

        # status bar
        self._sbar = tk.Frame(self)
        self._sbar.pack(fill=tk.X, padx=14, pady=4)

        self.conn_var    = tk.StringVar(value="● OFFLINE")
        self.recv_var    = tk.StringVar(value="RX: 0")
        self.missing_var = tk.StringVar(value="MISS: 0")
        self.bad_var     = tk.StringVar(value="BAD: 0")

        self._conn_lbl = tk.Label(self._sbar, textvariable=self.conn_var,
                                  font=("Courier New", 9, "bold"))
        self._conn_lbl.pack(side=tk.LEFT, padx=6)
        for var in [self.recv_var, self.missing_var, self.bad_var]:
            tk.Label(self._sbar, textvariable=var,
                     font=("Courier New", 9)).pack(side=tk.LEFT, padx=10)

        # range
        self._rbar = tk.Frame(self)
        self._rbar.pack(fill=tk.X, padx=14, pady=2)

        self.pmax_var = tk.StringVar(value="420")
        self.pmin_var = tk.StringVar(value="0")

        self._rlabels  = []
        self._rentries = []

        tk.Label(self._rbar, text="RANGE →",
                 font=("Courier New", 8, "bold")).pack(side=tk.LEFT, padx=6)

        for lbl, var in [("MAX W:", self.pmax_var), ("MIN W:", self.pmin_var)]:
            l = tk.Label(self._rbar, text=lbl, font=("Courier New", 8))
            l.pack(side=tk.LEFT, padx=(8, 2))
            e = tk.Entry(self._rbar, textvariable=var, width=5,
                         font=("Courier New", 9), relief=tk.FLAT,
                         bd=0, highlightthickness=1)
            e.pack(side=tk.LEFT, ipady=2)
            self._rlabels.append(l)
            self._rentries.append(e)

        self._apply_btn = tk.Button(self._rbar, text="APPLY",
                                    font=("Courier New", 8, "bold"),
                                    fg="white", relief=tk.FLAT,
                                    bd=0, cursor="hand2", padx=8, pady=2,
                                    command=self._apply_range)
        self._apply_btn.pack(side=tk.LEFT, padx=10)

        self._div2 = tk.Frame(self, height=1)
        self._div2.pack(fill=tk.X, padx=14)

        # canvas
        self._ccard = tk.Frame(self, pady=8, padx=12)
        self._ccard.pack(fill=tk.X, padx=14)

        self._clbl = tk.Label(self._ccard,
                              text="◆ POWER OUTPUT  —  LIVE CHART (W)",
                              font=("Courier New", 8, "bold"))
        self._clbl.pack(anchor="w", pady=(0, 6))

        self.canvas = tk.Canvas(self._ccard,
                                width=self.CW, height=self.CH,
                                highlightthickness=1)
        self.canvas.pack()

        self._div3 = tk.Frame(self, height=1)
        self._div3.pack(fill=tk.X, padx=14, pady=(8, 0))

        # latest reading
        self._dcard = tk.Frame(self, pady=8, padx=16)
        self._dcard.pack(fill=tk.X, padx=14)

        self._dlbl = tk.Label(self._dcard, text="◆ LATEST READING",
                              font=("Courier New", 8, "bold"))
        self._dlbl.pack(anchor="w", pady=(0, 6))

        grid = tk.Frame(self._dcard)
        grid.pack(fill=tk.X)
        grid.columnconfigure(1, weight=1)
        grid.columnconfigure(3, weight=1)

        self._dv     = {}
        self._dklbls = []
        self._dvlbls = []

        fields = [
            ("ID",      "id"),       ("LOCATION", "location"),
            ("POWER",   "power"),    ("STATUS",   "status"),
            ("TEMP",    "temp"),     ("WEATHER",  "weather"),
            ("VOLTAGE", "voltage"),  ("TIME",     "timestamp"),
        ]
        for i, (lbl, key) in enumerate(fields):
            col = (i % 2) * 2
            row = i // 2
            kl = tk.Label(grid, text=lbl + " ·",
                          font=("Courier New", 8, "bold"), anchor="w")
            kl.grid(row=row, column=col, sticky="w", padx=(0, 4), pady=3)
            v = tk.StringVar(value="—")
            self._dv[key] = v
            vl = tk.Label(grid, textvariable=v,
                          font=("Courier New", 9), anchor="w")
            vl.grid(row=row, column=col+1, sticky="w", pady=3)
            self._dklbls.append(kl)
            self._dvlbls.append(vl)
        self._dgrid = grid

        self._div4 = tk.Frame(self, height=1)
        self._div4.pack(fill=tk.X, padx=14, pady=(4, 0))

        # alert + exit
        self._bot = tk.Frame(self, pady=8)
        self._bot.pack(fill=tk.X)

        self.alert_var = tk.StringVar(value="")
        self._alert_lbl = tk.Label(self._bot, textvariable=self.alert_var,
                                   font=("Courier New", 9, "bold"))
        self._alert_lbl.pack(side=tk.LEFT, padx=18)

        self._exit_btn = tk.Button(self._bot, text="✕  EXIT",
                                   font=("Courier New", 9, "bold"),
                                   fg="white", relief=tk.FLAT,
                                   bd=0, cursor="hand2",
                                   padx=12, pady=4,
                                   command=self._exit)
        self._exit_btn.pack(side=tk.RIGHT, padx=14)

        self.protocol("WM_DELETE_WINDOW", self._exit)

    def _draw_logo(self, canvas):
        canvas.delete("all")
        T = self._T
        canvas.configure(bg=T["panel"])
        canvas.create_oval(3, 3, 29, 29, outline=T["accent"], width=2, fill=T["panel"])
        canvas.create_arc(5, 5, 27, 27, start=45, extent=270,
                          outline=T["accent"], width=2, style="arc")
        canvas.create_line(18, 8, 18, 24, fill=T["accent"], width=2)
        canvas.create_arc(18, 8, 26, 16, start=270, extent=180,
                          outline=T["accent"], width=2, style="arc")
        canvas.create_arc(18, 16, 27, 24, start=270, extent=180,
                          outline=T["accent"], width=2, style="arc")

    def _apply_theme(self):
        T = self._T
        self.configure(bg=T["bg"])
        self._header.configure(bg=T["panel"])
        self._title.configure(bg=T["panel"], fg=T["accent"])
        self._sub.configure(bg=T["panel"], fg=T["fg2"])
        self._draw_logo(self._logo_canvas)
        self._mode_btn.configure(bg=T["panel"], fg=T["fg2"],
                                 activebackground=T["panel"],
                                 text="◐  LIGHT" if self._dark else "◑  DARK")
        for d in [self._div1, self._div2, self._div3, self._div4]:
            d.configure(bg=T["border"])
        self._sbar.configure(bg=T["panel"])
        self._conn_lbl.configure(bg=T["panel"], fg=T["err"])
        for w in self._sbar.winfo_children():
            if isinstance(w, tk.Label) and w != self._conn_lbl:
                w.configure(bg=T["panel"], fg=T["fg2"])
        self._rbar.configure(bg=T["bg"])
        self._rbar.winfo_children()[0].configure(bg=T["bg"], fg=T["accent"])
        for l in self._rlabels:
            l.configure(bg=T["bg"], fg=T["fg2"])
        for e in self._rentries:
            e.configure(bg=T["entry_bg"], fg=T["fg"],
                        insertbackground=T["accent"],
                        highlightbackground=T["border"],
                        highlightcolor=T["accent"])
        self._apply_btn.configure(bg=T["accent"], activebackground=T["accent"])
        self._ccard.configure(bg=T["bg"])
        self._clbl.configure(bg=T["bg"], fg=T["accent"])
        self.canvas.configure(bg=T["canvas_bg"],
                              highlightbackground=T["border"])
        self._dcard.configure(bg=T["bg"])
        self._dlbl.configure(bg=T["bg"], fg=T["accent"])
        self._dgrid.configure(bg=T["bg"])
        for l in self._dklbls:
            l.configure(bg=T["bg"], fg=T["fg2"])
        for l in self._dvlbls:
            l.configure(bg=T["bg"], fg=T["fg"])
        self._bot.configure(bg=T["bg"])
        self._alert_lbl.configure(bg=T["bg"], fg=T["err"])
        self._exit_btn.configure(bg=T["btn_exit"],
                                 activebackground=T["btn_exit"])
        self._draw_chart()

    def _toggle_theme(self):
        self._dark = not self._dark
        self._T    = self.DARK if self._dark else self.LIGHT
        self._apply_theme()

    def _apply_range(self):
        try:
            self.POWER_MAX = float(self.pmax_var.get())
            self.POWER_MIN = float(self.pmin_var.get())
        except ValueError:
            pass

    # MQTT
    def _start_subscriber(self):
        def run():
            self._client = mqtt.Client(client_id=f"cembesli_sub_{id(self)}")
            self._client.on_connect = self._on_connect
            self._client.on_message = self._on_message
            try:
                self._client.connect(self.BROKER, self.PORT)
                self._client.loop_forever()
            except Exception as e:
                self.after(0, lambda: self.conn_var.set(f"● ERR: {e}"))
        threading.Thread(target=run, daemon=True).start()

    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self._connected = True
            client.subscribe(self.TOPIC1)
            client.subscribe(self.TOPIC2)
            client.subscribe(self.TOPIC3)
            self.after(0, lambda: self.conn_var.set("● ONLINE"))
            self.after(0, lambda: self._conn_lbl.config(fg=self._T["ok"]))
        else:
            self.after(0, lambda: self.conn_var.set(f"● FAIL rc={rc}"))

    def _on_message(self, client, userdata, message):
        try:
            topic = message.topic
            # only process full data from solar/panels
            if topic != self.TOPIC1:
                return
            data = json.loads(message.payload.decode("utf-8"))
            self.after(0, lambda d=data: self._handle(d))
        except Exception as e:
            self.after(0, lambda: self.alert_var.set(f"PARSE ERR: {e}"))

    def _handle(self, data):
        self._last_recv  = time.time()
        self._recv_count += 1
        self.recv_var.set(f"RX: {self._recv_count}")

        power      = data.get("power_output", 0)
        current_id = data.get("id")

        # missing packet check
        if self._last_id is not None and current_id is not None:
            gap = current_id - self._last_id - 1
            if gap > 0:
                self._missing_count += gap
                self.missing_var.set(f"MISS: {self._missing_count}")
                self.alert_var.set(f"⚠  {gap} PACKET(S) MISSING!")
        self._last_id = current_id

        # out of range / corrupt check
        is_bad = (power < self.POWER_MIN or power > self.POWER_MAX
                  or data.get("status") == "CORRUPT")
        if is_bad:
            self._bad_count += 1
            self.bad_var.set(f"BAD: {self._bad_count}")
            self.alert_var.set(f"⚠  BAD VALUE: {power} W — DISCARDED")
            return

        if self._missing_count == 0:
            self.alert_var.set("")

        # update labels
        env = data.get("environment", {})
        self._dv["id"].set(str(current_id))
        self._dv["location"].set(data.get("location", "—"))
        self._dv["power"].set(f"{power} W")
        self._dv["status"].set(data.get("status", "—"))
        self._dv["temp"].set(f"{data.get('temperature', '—')} °C")
        self._dv["weather"].set(env.get("weather", "—"))
        self._dv["voltage"].set(f"{data.get('voltage', '—')} V")
        self._dv["timestamp"].set(data.get("timestamp", "—"))

        # chart
        self._readings.append(float(power))
        if len(self._readings) > self.MAX_POINTS:
            self._readings.pop(0)
        self._draw_chart()

    def _draw_chart(self):
        T  = self._T
        c  = self.canvas
        W, H = self.CW, self.CH
        PL, PR, PT, PB = self.PL, self.PR, self.PT, self.PB
        cw = W - PL - PR
        ch = H - PT - PB

        c.delete("all")
        c.configure(bg=T["canvas_bg"])

        # grid
        for val in [0, 105, 210, 315, 420]:
            y = PT + ch - int(val / max(self.POWER_MAX, 1) * ch)
            c.create_line(PL, y, W-PR, y, fill=T["grid"], dash=(3, 4))
            c.create_text(PL-4, y, text=str(int(val)), anchor="e",
                          fill=T["axis"], font=("Courier New", 8))

        c.create_line(PL, PT, PL, H-PB, fill=T["axis"], width=1)
        c.create_line(PL, H-PB, W-PR, H-PB, fill=T["axis"], width=1)
        c.create_text(W//2, H-8, text="LAST 50 READINGS",
                      fill=T["axis"], font=("Courier New", 7))

        n = len(self._readings)
        if n < 2:
            c.create_text(W//2, H//2, text="AWAITING DATA STREAM...",
                          fill=T["axis"], font=("Courier New", 10))
            return

        pts = []
        for i, v in enumerate(self._readings):
            x = PL + int(i * cw / (n - 1))
            y = PT + ch - int(v / max(self.POWER_MAX, 1) * ch)
            y = max(PT+2, min(H-PB-2, y))
            pts.append((x, y))

        # fill
        poly = [PL, H-PB]
        for x, y in pts:
            poly += [x, y]
        poly += [pts[-1][0], H-PB]
        c.create_polygon(poly, fill=T["fill"], outline="", stipple="gray12")

        # line
        for i in range(len(pts)-1):
            c.create_line(pts[i][0], pts[i][1],
                          pts[i+1][0], pts[i+1][1],
                          fill=T["line"], width=2)

        # dots
        for x, y in pts:
            c.create_oval(x-3, y-3, x+3, y+3, fill=T["dot"], outline="")

        # latest value
        lx, ly = pts[-1]
        anchor = "e" if lx > W - 90 else "w"
        ox = -8 if anchor == "e" else 8
        c.create_text(lx+ox, ly-12,
                      text=f"{self._readings[-1]:.1f} W",
                      fill=T["lbl_fg"],
                      font=("Courier New", 9, "bold"),
                      anchor=anchor)

    def _watchdog(self):
        if self._connected and self._last_recv is not None:
            if time.time() - self._last_recv > self.MISSING_TIMEOUT:
                self.alert_var.set("⚠  NO TRANSMISSION FOR 5+ SECONDS")
        self.after(2000, self._watchdog)

    def _exit(self):
        if self._client:
            try:
                self._client.disconnect()
            except Exception:
                pass
        self.destroy()


if __name__ == "__main__":
    app = Subscriber()
    app.mainloop()