import math
import random
import time
import requests
from app.config.settings import settings


class WeatherService:
    BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

    def __init__(self) -> None:
        self.api_key = settings.openweather_api_key

    def fetch_rainfall(self, lat: float, lon: float) -> float:
        if not self.api_key:
            print("[weather] OPENWEATHER_API_KEY missing; using simulated rainfall.")
            return self._simulate_rainfall(lat, lon)

        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key,
            "units": "metric",
        }
        try:
            response = requests.get(self.BASE_URL, params=params, timeout=10)
            print(f"[weather] OpenWeather status={response.status_code} lat={lat} lon={lon}")
            response.raise_for_status()
            payload = response.json()
            print(f"[weather] OpenWeather rain payload={payload.get('rain', {})}")

            rain_payload = payload.get("rain", {})
            rainfall = rain_payload.get("1h")

            if rainfall is None and rain_payload.get("3h") is not None:
                rainfall = float(rain_payload.get("3h", 0.0)) / 3

            return round(float(rainfall or 0.0), 2)
        except requests.RequestException as exc:
            print(f"[weather] OpenWeather request failed: {exc}; using simulated rainfall.")
            return self._simulate_rainfall(lat, lon)

    def fetch_rainfall_history(self, lat: float, lon: float, hours: int = 6) -> list[float]:
        # OpenWeather historical rainfall can require a different paid endpoint.
        # Keep this deterministic mock so the prediction engine stays ML-ready.
        return [self._simulate_rainfall(lat, lon, hour_offset=offset) for offset in range(hours, 0, -1)]

    def _simulate_rainfall(self, lat: float, lon: float, hour_offset: int = 0) -> float:
        hour_seed = int((lat + lon) * 1000) + int((time.time() // 3600)) - hour_offset
        random.seed(hour_seed)
        base = abs(math.sin(lat / 13.0) + math.cos(lon / 13.0)) * 40
        simulated = min(max(random.random() * 120, 0), 140)
        return round(base + simulated * 0.3, 2)
