import random
import math


class SolarPanelSensor:
    """
    Simulates a rooftop solar panel power output sensor.
    Weather affects power output directly.
    Call get_reading() to get both value and weather together.
    """

    WEATHER_OPTIONS = ["Clear", "Partly Cloudy", "Overcast", "Foggy"]
    WEATHER_RANGE   = {
        "Clear":         (0.85, 1.00),
        "Partly Cloudy": (0.55, 0.75),
        "Overcast":      (0.20, 0.40),
        "Foggy":         (0.05, 0.18),
    }
    WEATHER_WEIGHTS  = [0.30, 0.30, 0.25, 0.15]
    WEATHER_DURATION = (5, 12)

    def __init__(self, peak_watts=400.0, total_steps=500, noise_std=0.018):
        self._peak_watts        = peak_watts
        self._total_steps       = total_steps
        self._noise_std         = noise_std
        self._step              = 0
        self._weather           = "Clear"
        self._weather_remaining = random.randint(*self.WEATHER_DURATION)

    def _advance_weather(self):
        self._weather_remaining -= 1
        if self._weather_remaining <= 0:
            self._weather = random.choices(
                self.WEATHER_OPTIONS,
                weights=self.WEATHER_WEIGHTS, k=1)[0]
            self._weather_remaining = random.randint(*self.WEATHER_DURATION)

    def get_reading(self):
        """Returns (power_watts, weather_string) together."""
        phase   = (self._step % self._total_steps) / self._total_steps
        day_arc = max(0.0, math.sin(math.pi * phase))

        lo, hi         = self.WEATHER_RANGE[self._weather]
        weather_factor = random.uniform(lo, hi)
        day_arc       *= weather_factor

        noise  = random.gauss(0, self._noise_std)
        result = max(0.0, min(1.0, day_arc + noise))
        power  = round(result * self._peak_watts, 2)
        weather = self._weather

        self._step += 1
        self._advance_weather()

        return power, weather


if __name__ == "__main__":
    sensor = SolarPanelSensor()
    for i in range(30):
        w, cond = sensor.get_reading()
        print(f"{i+1:2d}  {w:6.1f} W  [{cond}]")
