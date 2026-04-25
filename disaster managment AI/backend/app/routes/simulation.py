from fastapi import APIRouter, HTTPException

from app.models.prediction_model import (
    calculate_confidence,
    calculate_factor_contributions,
    calculate_probability,
    estimate_time_to_impact,
    explain_factors,
    get_future_predictions,
)
from app.models.risk_model import SimulationInput, SimulationPrediction
from app.utils.risk_calculator import calculate_risk

router = APIRouter()


@router.post("", response_model=SimulationPrediction)
def simulate(payload: SimulationInput) -> SimulationPrediction:
    try:
        rainfall_history = [
            max(payload.rainfall - 18, 0),
            max(payload.rainfall - 10, 0),
            max(payload.rainfall - 4, 0),
        ]
        risk = calculate_risk(payload.rainfall, payload.water_level, rainfall_history)
        probability = calculate_probability(risk.risk_score)

        return SimulationPrediction(
            risk_level=risk.risk_level,
            risk_score=risk.risk_score,
            probability=probability,
            time_to_impact=estimate_time_to_impact(payload.rainfall),
            future_predictions=get_future_predictions(payload.rainfall, payload.water_level),
            factor_contributions=calculate_factor_contributions(payload.rainfall, payload.water_level, risk.trend_value),
            confidence=calculate_confidence(0.9),
            explanation=explain_factors(payload.rainfall, payload.water_level, risk.trend_label),
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/", response_model=SimulationPrediction, include_in_schema=False)
def simulate_with_slash(payload: SimulationInput) -> SimulationPrediction:
    return simulate(payload)
