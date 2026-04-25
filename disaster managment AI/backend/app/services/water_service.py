import math
import time
import random


class WaterService:
    def fetch_water_level(self, lat: float, lon: float) -> float:
        hour_seed = int(time.time() / 3600)
        deterministic_seed = int((lat * 1000) + (lon * 1000) + hour_seed)
        random.seed(deterministic_seed)

        basin_level = 2.0 + abs(math.sin(lat / 12.0) + math.cos(lon / 12.0)) * 2.4
        tidal_or_release_variation = math.sin(time.time() / 5400) * 0.7
        sensor_noise = random.uniform(-0.25, 0.45)
        storm_surge_component = random.random() * 2.8
        water_level = basin_level + tidal_or_release_variation + sensor_noise + storm_surge_component

        return round(max(water_level, 0.0), 2)
