import tkinter as tk
import threading
import json
import time
import paho.mqtt.client as mqtt


class AlertSubscriber(tk.Tk):
    """
    Second subscriber — listens to solar/alerts topic only.
    Displays LOW, CRITICAL, CORRUPT alerts in a dedicated panel.
    """

    BROKER          = "localhost"
    PORT            = 1883
    TOPIC           = "solar/alerts"
    MISSING_TIMEOUT = 5

    DARK = {
        "bg": "#0a0a0a", "panel": "#120012", "border": "#3a0050",
        "accent": "#ff00ff", "fg": "#ffe0ff", "fg2": "#884488",
        "entry_bg": "#0d000d", "log_bg": "#080008", "log_fg": "#ff66ff",
        "ok": "#00ff88", "warn": "#ff6b35", "err": "#ff0055",
        "btn_exit": "#37474f",
    }
    LIGHT = {
        "bg": "#fff0ff", "panel": "#ffffff", "border": "#cc88cc",
        "accent": "#990099", "fg": "#220022", "fg2": "#884488",
        "entry_bg": "#ffe0ff", "log_bg": "#fff8ff", "log_fg": "#660066",
        "ok": "#00a855", "warn": "#e65c00", "err": "#cc0033",
        "btn_exit": "#607d8b",
    }

    def __init__(self):
        super().__init__()
        self.title("Solar Alert Monitor  //  COMP216")
        self.geometry("520x620")
        self.resizable(False, False)

        self._client        = None
        self._connected     = False
        self._recv_count    = 0
        self._alert_count   = 0
        self._last_recv     = None
        self._dark          = True
        self._T             = self.DARK

        # alert counts per type
        self._low_count      = 0
        self._critical_count = 0
        self._corrupt_count  = 0

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
                               text="  ⚠  ALERT MONITOR",
                               font=("Courier New", 11, "bold"))
        self._title.pack(side=tk.LEFT, padx=8, pady=(10, 2))

        self._mode_btn = tk.Button(self._header, text="◐  LIGHT",
                                   font=("Courier New", 8, "bold"),
                                   bd=0, cursor="hand2", width=9,
                                   command=self._toggle_theme)
        self._mode_btn.pack(side=tk.RIGHT, padx=14, pady=12)

        self._sub = tk.Label(self._header,
                             text="COMP216  ·  Cembesli",
                             font=("Courier New", 8))
        self._sub.pack(side=tk.LEFT, padx=18, pady=(0, 8))

        self._div1 = tk.Frame(self, height=1)
        self._div1.pack(fill=tk.X)

        # status bar
        self._sbar = tk.Frame(self)
        self._sbar.pack(fill=tk.X, padx=14, pady=4)

        self.conn_var = tk.StringVar(value="● OFFLINE")
        self.recv_var = tk.StringVar(value="RX: 0")

        self._conn_lbl = tk.Label(self._sbar, textvariable=self.conn_var,
                                  font=("Courier New", 9, "bold"))
        self._conn_lbl.pack(side=tk.LEFT, padx=6)

        tk.Label(self._sbar, textvariable=self.recv_var,
                 font=("Courier New", 9)).pack(side=tk.LEFT, padx=10)

        self._div2 = tk.Frame(self, height=1)
        self._div2.pack(fill=tk.X, padx=14)

        # counters
        self._ccard = tk.Frame(self, pady=10, padx=16)
        self._ccard.pack(fill=tk.X, padx=14)

        self._clbl = tk.Label(self._ccard, text="◆ ALERT SUMMARY",
                              font=("Courier New", 8, "bold"))
        self._clbl.pack(anchor="w", pady=(0, 8))

        self._low_var      = tk.StringVar(value="LOW      :  0")
        self._critical_var = tk.StringVar(value="CRITICAL :  0")
        self._corrupt_var  = tk.StringVar(value="CORRUPT  :  0")

        self._low_lbl = tk.Label(self._ccard, textvariable=self._low_var,
                                 font=("Courier New", 12, "bold"), anchor="w")
        self._low_lbl.pack(fill=tk.X, pady=2)

        self._crit_lbl = tk.Label(self._ccard, textvariable=self._critical_var,
                                  font=("Courier New", 12, "bold"), anchor="w")
        self._crit_lbl.pack(fill=tk.X, pady=2)

        self._corr_lbl = tk.Label(self._ccard, textvariable=self._corrupt_var,
                                  font=("Courier New", 12, "bold"), anchor="w")
        self._corr_lbl.pack(fill=tk.X, pady=2)

        self._div3 = tk.Frame(self, height=1)
        self._div3.pack(fill=tk.X, padx=14, pady=(8, 0))

        # latest alert
        self._lcard = tk.Frame(self, pady=8, padx=16)
        self._lcard.pack(fill=tk.X, padx=14)

        self._llbl = tk.Label(self._lcard, text="◆ LATEST ALERT",
                              font=("Courier New", 8, "bold"))
        self._llbl.pack(anchor="w", pady=(0, 6))

        grid = tk.Frame(self._lcard)
        grid.pack(fill=tk.X)
        grid.columnconfigure(1, weight=1)
        grid.columnconfigure(3, weight=1)

        self._dv     = {}
        self._dklbls = []
        self._dvlbls = []

        fields = [
            ("ID",       "id"),       ("LOCATION", "location"),
            ("POWER",    "power"),    ("STATUS",   "status"),
            ("TIME",     "timestamp"),
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

        # alert log
        self._logcard = tk.Frame(self, pady=8, padx=16)
        self._logcard.pack(fill=tk.BOTH, expand=True, padx=14)

        self._loglbl = tk.Label(self._logcard, text="◆ ALERT LOG",
                                font=("Courier New", 8, "bold"))
        self._loglbl.pack(anchor="w", pady=(0, 4))

        self.log_box = tk.Text(self._logcard, font=("Courier New", 9),
                               state=tk.DISABLED, relief=tk.FLAT,
                               bd=0, highlightthickness=1, height=10)
        self.log_box.pack(fill=tk.BOTH, expand=True, ipady=6, ipadx=6)

        self._div5 = tk.Frame(self, height=1)
        self._div5.pack(fill=tk.X, padx=14, pady=(4, 0))

        # bottom
        self._bot = tk.Frame(self, pady=10)
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

        for d in [self._div1, self._div2, self._div3, self._div4, self._div5]:
            d.configure(bg=T["border"])

        self._sbar.configure(bg=T["panel"])
        self._conn_lbl.configure(bg=T["panel"], fg=T["err"])
        for w in self._sbar.winfo_children():
            if isinstance(w, tk.Label) and w != self._conn_lbl:
                w.configure(bg=T["panel"], fg=T["fg2"])

        self._ccard.configure(bg=T["bg"])
        self._clbl.configure(bg=T["bg"], fg=T["accent"])
        self._low_lbl.configure(bg=T["bg"], fg=T["warn"])
        self._crit_lbl.configure(bg=T["bg"], fg=T["err"])
        self._corr_lbl.configure(bg=T["bg"], fg=T["fg2"])

        self._lcard.configure(bg=T["bg"])
        self._llbl.configure(bg=T["bg"], fg=T["accent"])
        self._dgrid.configure(bg=T["bg"])
        for l in self._dklbls:
            l.configure(bg=T["bg"], fg=T["fg2"])
        for l in self._dvlbls:
            l.configure(bg=T["bg"], fg=T["fg"])

        self._logcard.configure(bg=T["bg"])
        self._loglbl.configure(bg=T["bg"], fg=T["accent"])
        self.log_box.configure(bg=T["log_bg"], fg=T["log_fg"],
                               highlightbackground=T["border"],
                               highlightcolor=T["accent"])

        self._bot.configure(bg=T["bg"])
        self._alert_lbl.configure(bg=T["bg"], fg=T["err"])
        self._exit_btn.configure(bg=T["btn_exit"],
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

    # MQTT
    def _start_subscriber(self):
        def run():
            self._client = mqtt.Client(client_id=f"cembesli_sub2_{id(self)}")
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
            client.subscribe(self.TOPIC)
            self.after(0, lambda: self.conn_var.set("● ONLINE"))
            self.after(0, lambda: self._conn_lbl.config(fg=self._T["ok"]))
        else:
            self.after(0, lambda: self.conn_var.set(f"● FAIL rc={rc}"))

    def _on_message(self, client, userdata, message):
        try:
            data = json.loads(message.payload.decode("utf-8"))
            self.after(0, lambda d=data: self._handle(d))
        except Exception as e:
            self.after(0, lambda: self.alert_var.set(f"PARSE ERR: {e}"))

    def _handle(self, data):
        self._last_recv  = time.time()
        self._recv_count += 1
        self.recv_var.set(f"RX: {self._recv_count}")

        status = data.get("status", "")
        power  = data.get("power_output", data.get("power", 0))

        if status == "LOW":
            self._low_count += 1
            self._low_var.set(f"LOW      :  {self._low_count}")
        elif status == "CRITICAL":
            self._critical_count += 1
            self._critical_var.set(f"CRITICAL :  {self._critical_count}")
        elif status == "CORRUPT":
            self._corrupt_count += 1
            self._corrupt_var.set(f"CORRUPT  :  {self._corrupt_count}")

        self._dv["id"].set(str(data.get("id", "—")))
        self._dv["location"].set(data.get("location", "—"))
        self._dv["power"].set(f"{power} W")
        self._dv["status"].set(status)
        self._dv["timestamp"].set(data.get("timestamp", "—"))

        self._log(
            f"  ⚠  ID:{data.get('id'):>4}  "
            f"{str(power):>8} W  "
            f"[{status}]  "
            f"{data.get('location', '')}"
        )

        self.alert_var.set(f"⚠  LAST ALERT: {status}  —  {power} W")

    def _watchdog(self):
        if self._connected and self._last_recv is not None:
            if time.time() - self._last_recv > self.MISSING_TIMEOUT:
                self.alert_var.set("● ALL SYSTEMS NOMINAL — NO ALERTS")
        self.after(3000, self._watchdog)

    def _exit(self):
        if self._client:
            try:
                self._client.disconnect()
            except Exception:
                pass
        self.destroy()


if __name__ == "__main__":
    app = AlertSubscriber()
    app.mainloop()