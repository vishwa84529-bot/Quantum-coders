from datetime import datetime
from fastapi import APIRouter, HTTPException, Query

from app.db import get_connection
from app.models.risk_model import MultiLocationPrediction, RiskPrediction
from app.models.prediction_model import (
    calculate_confidence,
    calculate_data_consistency,
    calculate_factor_contributions,
    calculate_probability,
    estimate_time_to_impact,
    explain_factors,
    get_future_predictions,
)
from app.services.weather_service import WeatherService
from app.services.water_service import WaterService
from app.utils.risk_calculator import calculate_risk

router = APIRouter()

weather_service = WeatherService()
water_service = WaterService()

DEFAULT_MULTI_LOCATIONS = [
    ("Bangalore", 12.9716, 77.5946),
    ("Chennai", 13.0827, 80.2707),
    ("Mumbai", 19.0760, 72.8777),
    ("Kolkata", 22.5726, 88.3639),
]


def _build_prediction(lat: float, lon: float, location: str | None = None, store: bool = True) -> RiskPrediction:
    rainfall = weather_service.fetch_rainfall(lat, lon)
    rainfall_history = weather_service.fetch_rainfall_history(lat, lon)
    water_level = water_service.fetch_water_level(lat, lon)
    risk = calculate_risk(rainfall, water_level, rainfall_history)
    probability = calculate_probability(risk.risk_score)
    time_to_impact = estimate_time_to_impact(rainfall)
    factor_contributions = calculate_factor_contributions(rainfall, water_level, risk.trend_value)
    data_consistency = calculate_data_consistency(rainfall_history, risk.trend_value)
    confidence = calculate_confidence(data_consistency)
    future_predictions = get_future_predictions(rainfall, water_level)
    explanation = explain_factors(rainfall, water_level, risk.trend_label)
    timestamp = datetime.utcnow().isoformat() + "Z"
    print(
        f"[prediction] rainfall={rainfall} water_level={water_level} "
        f"risk_score={risk.risk_score} risk_level={risk.risk_level}"
    )

    if store:
        with get_connection() as connection:
            connection.execute(
                """
                INSERT INTO predictions (location, risk_level, risk_score, probability, rainfall, water_level, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (location or f"{lat:.4f},{lon:.4f}", risk.risk_level, risk.risk_score, probability, rainfall, water_level, timestamp),
            )
            if risk.risk_level == "HIGH":
                alert_location = location or f"{lat:.4f},{lon:.4f}"
                connection.execute(
                    """
                    INSERT INTO alerts (location, risk_level, level, message, latitude, longitude, timestamp, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        alert_location,
                        risk.risk_level,
                        risk.risk_level,
                        f"High flood risk predicted in your area within {time_to_impact}",
                        lat,
                        lon,
                        timestamp,
                        timestamp,
                    ),
                )

    return RiskPrediction(
        location=location,
        risk_level=risk.risk_level,
        risk_score=risk.risk_score,
        probability=probability,
        time_to_impact=time_to_impact,
        factors={
            "rainfall": rainfall,
            "water_level": water_level,
            "trend": risk.trend_label,
        },
        future_predictions=future_predictions,
        factor_contributions=factor_contributions,
        confidence=confidence,
        explanation=explanation,
        rainfall=rainfall,
        water_level=water_level,
    )


@router.get("", response_model=RiskPrediction)
def predict(
    lat: float = Query(..., description="Latitude of the location"),
    lon: float = Query(..., description="Longitude of the location"),
    location: str | None = Query(None, description="Optional location label"),
) -> RiskPrediction:
    try:
        return _build_prediction(lat, lon, location=location)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/multi", response_model=list[MultiLocationPrediction])
def predict_multi(
    locations: list[str] | None = Query(
        None,
        description="Repeated city,lat,lon values. Example: locations=Bangalore,12.9716,77.5946",
    ),
) -> list[MultiLocationPrediction]:
    try:
        parsed_locations = _parse_locations(locations)
        results = []

        for city, lat, lon in parsed_locations:
            prediction = _build_prediction(lat, lon, location=city)
            results.append(
                MultiLocationPrediction(
                    city=city,
                    risk=prediction.risk_level,
                    score=prediction.risk_score,
                    probability=prediction.probability,
                    confidence=prediction.confidence,
                )
            )

        return results
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/", response_model=RiskPrediction, include_in_schema=False)
def predict_with_slash(
    lat: float = Query(..., description="Latitude of the location"),
    lon: float = Query(..., description="Longitude of the location"),
) -> RiskPrediction:
    return predict(lat, lon)


def _parse_locations(locations: list[str] | None) -> list[tuple[str, float, float]]:
    if not locations:
        return DEFAULT_MULTI_LOCATIONS

    parsed_locations = []
    for raw_location in locations:
        parts = [part.strip() for part in raw_location.split(",")]

        if len(parts) != 3:
            raise ValueError("Each location must use city,lat,lon format.")

        city, lat, lon = parts
        parsed_locations.append((city, float(lat), float(lon)))

    return parsed_locations
