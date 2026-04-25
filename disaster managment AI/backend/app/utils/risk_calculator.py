from dataclasses import dataclass


@dataclass(frozen=True)
class RiskResult:
    risk_level: str
    risk_score: int
    trend_value: float
    trend_label: str


def calculate_rainfall_trend(rainfall: float, rainfall_history: list[float]) -> tuple[float, str]:
    if not rainfall_history:
        return 0.0, "stable"

    recent_average = sum(rainfall_history[-3:]) / min(len(rainfall_history), 3)
    trend_delta = rainfall - recent_average

    if trend_delta > 5:
        trend_label = "increasing"
    elif trend_delta < -5:
        trend_label = "decreasing"
    else:
        trend_label = "stable"

    return max(-100.0, min(trend_delta, 100.0)), trend_label


def calculate_risk(rainfall: float, water_level: float, rainfall_history: list[float]) -> RiskResult:
    trend_value, trend_label = calculate_rainfall_trend(rainfall, rainfall_history)

    raw_score = (rainfall * 0.5) + (water_level * 0.3) + (trend_value * 0.2)
    risk_score = round(max(0.0, min(raw_score, 100.0)))

    if risk_score >= 70:
        risk_level = "HIGH"
    elif risk_score >= 40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return RiskResult(
        risk_level=risk_level,
        risk_score=risk_score,
        trend_value=round(trend_value, 2),
        trend_label=trend_label,
    )
