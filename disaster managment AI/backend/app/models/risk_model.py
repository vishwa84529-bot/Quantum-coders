from pydantic import BaseModel, Field


class PredictionFactors(BaseModel):
    rainfall: float
    water_level: float
    trend: str


class FuturePrediction(BaseModel):
    time: str
    risk: str


class FactorContribution(BaseModel):
    rainfall_contribution: int
    water_level_contribution: int
    trend_contribution: int


class RiskPrediction(BaseModel):
    location: str | None = None
    risk_level: str
    risk_score: int
    probability: str
    time_to_impact: str
    factors: PredictionFactors
    future_predictions: list[FuturePrediction] = Field(default_factory=list)
    factor_contributions: FactorContribution
    confidence: str
    explanation: str
    rainfall: float
    water_level: float


class MultiLocationPrediction(BaseModel):
    city: str
    risk: str
    score: int
    probability: str
    confidence: str


class SimulationInput(BaseModel):
    rainfall: float
    water_level: float


class SimulationPrediction(BaseModel):
    risk_level: str
    risk_score: int
    probability: str
    time_to_impact: str
    future_predictions: list[FuturePrediction] = Field(default_factory=list)
    factor_contributions: FactorContribution
    confidence: str
    explanation: str
