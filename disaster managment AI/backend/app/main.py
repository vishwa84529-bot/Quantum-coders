from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.db import init_db
from app.routes import prediction, alerts, insights, simulation

app = FastAPI(
    title="Flood Risk Prediction API",
    description="Predict flood risk from weather and water level telemetry.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction.router, prefix="/predict", tags=["prediction"])
app.include_router(simulation.router, prefix="/simulate", tags=["simulation"])
app.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
app.include_router(insights.router, prefix="/insights", tags=["insights"])


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/")
def root() -> dict:
    return {"message": "Flood Risk Prediction Service is running."}
