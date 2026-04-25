def calculate_probability(risk_score: int) -> str:
    # TODO: Replace with ML model probability output.
    bounded_score = max(0, min(int(risk_score), 100))
    return f"{bounded_score}%"


def estimate_time_to_impact(rainfall: float) -> str:
    # TODO: Replace with ML model time-to-impact regression.
    if rainfall >= 100:
        return "2-3 hours"
    if rainfall >= 60:
        return "4-6 hours"
    if rainfall >= 30:
        return "6-12 hours"
    return "12+ hours"


def explain_factors(rainfall: float, water_level: float, trend: str) -> str:
    # TODO: Replace with ML model explainability, such as SHAP feature attribution.
    drivers = []

    if rainfall >= 100:
        drivers.append("heavy rainfall")
    elif rainfall >= 60:
        drivers.append("elevated rainfall")
    else:
        drivers.append("limited rainfall")

    if water_level >= 7:
        drivers.append("high water level")
    elif water_level >= 4:
        drivers.append("rising water level")
    else:
        drivers.append("manageable water level")

    if trend == "increasing":
        drivers.append("an increasing rainfall trend")
    elif trend == "decreasing":
        drivers.append("a decreasing rainfall trend")

    return f"Risk is driven by {', '.join(drivers)}."


def get_future_predictions(rainfall: float, water_level: float) -> list[dict[str, str]]:
    # TODO: Replace with ML model later for time-series forecasting.
    horizon_adjustments = [
        ("Now", 0.0, 0.0),
        ("+1 hr", 8.0, 0.4),
        ("+3 hr", 18.0, 1.0),
        ("+6 hr", 10.0, 0.6),
    ]

    predictions = []
    for label, rainfall_delta, water_delta in horizon_adjustments:
        score = (rainfall + rainfall_delta) * 0.5 + (water_level + water_delta) * 0.3
        predictions.append({"time": label, "risk": _risk_from_score(score)})

    return predictions


def calculate_factor_contributions(rainfall: float, water_level: float, trend_value: float) -> dict[str, int]:
    # TODO: Replace with ML model later, such as SHAP or feature attribution.
    rainfall_weight = max(rainfall * 0.5, 0)
    water_weight = max(water_level * 0.3, 0)
    trend_weight = max(trend_value * 0.2, 0)
    total = rainfall_weight + water_weight + trend_weight

    if total == 0:
        return {
            "rainfall_contribution": 0,
            "water_level_contribution": 0,
            "trend_contribution": 0,
        }

    rainfall_contribution = round((rainfall_weight / total) * 100)
    water_level_contribution = round((water_weight / total) * 100)
    trend_contribution = max(0, 100 - rainfall_contribution - water_level_contribution)

    return {
        "rainfall_contribution": rainfall_contribution,
        "water_level_contribution": water_level_contribution,
        "trend_contribution": trend_contribution,
    }


def calculate_confidence(data_consistency: float) -> str:
    # TODO: Replace with ML model later for calibrated prediction confidence.
    if data_consistency >= 0.75:
        return "HIGH"
    if data_consistency >= 0.45:
        return "MEDIUM"
    return "LOW"


def calculate_data_consistency(rainfall_history: list[float], trend_value: float) -> float:
    if len(rainfall_history) < 2:
        return 0.5

    average = sum(rainfall_history) / len(rainfall_history)
    variance = sum((value - average) ** 2 for value in rainfall_history) / len(rainfall_history)
    volatility_penalty = min(variance / 2500, 0.45)
    trend_penalty = min(abs(trend_value) / 120, 0.25)

    return max(0.0, min(1.0, 1 - volatility_penalty - trend_penalty))


def _risk_from_score(score: float) -> str:
    bounded_score = max(0.0, min(score, 100.0))

    if bounded_score >= 70:
        return "HIGH"
    if bounded_score >= 40:
        return "MEDIUM"
    return "LOW"
