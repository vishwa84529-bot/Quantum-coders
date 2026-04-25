from fastapi import APIRouter, HTTPException

from app.db import get_connection

router = APIRouter()


@router.get("")
def get_insights() -> dict:
    try:
        with get_connection() as connection:
            summary_row = connection.execute(
                """
                SELECT AVG(risk_score) AS avg_risk_score
                FROM predictions
                """
            ).fetchone()
            highest_row = connection.execute(
                """
                SELECT location, risk_score
                FROM predictions
                ORDER BY risk_score DESC, timestamp DESC
                LIMIT 1
                """
            ).fetchone()
            recent_rows = connection.execute(
                """
                SELECT timestamp, risk_score, rainfall, water_level
                FROM predictions
                ORDER BY timestamp DESC
                LIMIT 12
                """
            ).fetchall()

        recent_predictions = [_format_recent_prediction(row) for row in reversed(recent_rows)]
        factor_analysis = _calculate_factor_analysis(recent_rows)

        return {
            "avg_risk_score": round(float(summary_row["avg_risk_score"] or 0)),
            "highest_risk_location": highest_row["location"] if highest_row else "No data",
            "trend": _calculate_trend(recent_predictions),
            "recent_predictions": recent_predictions,
            "factor_analysis": factor_analysis,
            "explanation": _build_explanation(factor_analysis, recent_predictions),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/", include_in_schema=False)
def get_insights_with_slash() -> dict:
    return get_insights()


def _format_recent_prediction(row) -> dict:
    timestamp = row["timestamp"] or ""
    time_value = timestamp[11:16] if len(timestamp) >= 16 else timestamp

    return {
        "time": time_value,
        "risk": int(row["risk_score"] or 0),
    }


def _calculate_trend(recent_predictions: list[dict]) -> str:
    if len(recent_predictions) < 2:
        return "stable"

    delta = recent_predictions[-1]["risk"] - recent_predictions[0]["risk"]

    if delta >= 8:
        return "increasing"
    if delta <= -8:
        return "decreasing"
    return "stable"


def _calculate_factor_analysis(rows) -> dict:
    if not rows:
        return {"rainfall": 0, "water_level": 0, "trend": 0}

    avg_rainfall = sum(float(row["rainfall"] or 0) for row in rows) / len(rows)
    avg_water_level = sum(float(row["water_level"] or 0) for row in rows) / len(rows)
    rainfall_weight = avg_rainfall * 0.5
    water_level_weight = avg_water_level * 0.3
    trend_weight = 10
    total = rainfall_weight + water_level_weight + trend_weight

    if total == 0:
        return {"rainfall": 0, "water_level": 0, "trend": 0}

    rainfall = round((rainfall_weight / total) * 100)
    water_level = round((water_level_weight / total) * 100)

    return {
        "rainfall": rainfall,
        "water_level": water_level,
        "trend": max(0, 100 - rainfall - water_level),
    }


def _build_explanation(factor_analysis: dict, recent_predictions: list[dict]) -> str:
    trend = _calculate_trend(recent_predictions)
    dominant_factor = max(factor_analysis, key=factor_analysis.get)
    label = dominant_factor.replace("_", " ")

    if trend == "increasing":
        return f"Risk is increasing due to rising {label} impact across recent predictions."
    if trend == "decreasing":
        return f"Risk is decreasing as {label} impact has eased in recent predictions."
    return f"Risk is stable, with {label} currently contributing the most to prediction scores."
