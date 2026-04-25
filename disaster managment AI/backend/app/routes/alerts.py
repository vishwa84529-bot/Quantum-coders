from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db import get_connection

router = APIRouter()


class AlertPayload(BaseModel):
    level: str
    message: str
    latitude: float
    longitude: float
    location: str | None = None


class Alert(BaseModel):
    id: int
    location: str
    risk_level: str
    message: str
    timestamp: str


@router.post("/")
def create_alert(alert: AlertPayload) -> dict:
    created_at = datetime.utcnow().isoformat() + "Z"
    location = alert.location or f"{alert.latitude:.4f},{alert.longitude:.4f}"

    try:
        with get_connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO alerts (location, risk_level, level, message, latitude, longitude, timestamp, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (location, alert.level, alert.level, alert.message, alert.latitude, alert.longitude, created_at, created_at),
            )
            entry = {
                "id": cursor.lastrowid,
                "location": location,
                "risk_level": alert.level,
                "message": alert.message,
                "timestamp": created_at,
            }

        return {"status": "ok", "stored": True, "alert": entry}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("", response_model=list[Alert])
def list_alerts() -> list[dict]:
    try:
        with get_connection() as connection:
            if connection.dialect == "mysql":
                query = """
                    SELECT
                        id,
                        COALESCE(location, CONCAT(latitude, ',', longitude)) AS location,
                        COALESCE(risk_level, level) AS risk_level,
                        message,
                        COALESCE(timestamp, created_at) AS timestamp
                    FROM alerts
                    ORDER BY COALESCE(timestamp, created_at) DESC
                    LIMIT 100
                    """
            else:
                query = """
                    SELECT
                        id,
                        COALESCE(location, printf('%.4f,%.4f', latitude, longitude)) AS location,
                        COALESCE(risk_level, level) AS risk_level,
                        message,
                        COALESCE(timestamp, created_at) AS timestamp
                    FROM alerts
                    ORDER BY COALESCE(timestamp, created_at) DESC
                    LIMIT 100
                    """

            rows = connection.execute(
                query
            ).fetchall()

        return [dict(row) for row in rows]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/", response_model=list[Alert], include_in_schema=False)
def list_alerts_with_slash() -> list[dict]:
    return list_alerts()
