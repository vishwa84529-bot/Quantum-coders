# Flood Risk Prediction and Alert System

A production-style flood risk dashboard built with FastAPI, React, Tailwind CSS, Google Maps, and SQL persistence. SQLite is the local default, and MySQL is supported through `DATABASE_URL`.

## Project Structure

- `backend/` - FastAPI service for weather and water risk prediction
- `frontend/` - React dashboard with map visualization and alert panels
- `.env.example` - environment variable template

## Setup Instructions

### 1. Backend

1. Create a `.env` file in the project root with:
   ```env
   OPENWEATHER_API_KEY=your_openweather_api_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   DATABASE_URL=sqlite:///backend/alerts.db
   ```
   For MySQL, use:
   ```env
   DATABASE_URL=mysql://user:password@localhost:3306/flood_risk
   ```
2. Install backend dependencies:
   ```bash
   cd backend
   python -m pip install -r requirements.txt
   ```
3. Run the backend service:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### 2. Frontend

1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Create a `.env` file in `frontend/` or use Vite environment variables with:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

### 3. Open the Dashboard

Visit the Vite server URL, usually `http://localhost:5173`.

## Prediction APIs

Single-location prediction:

```http
GET http://localhost:8000/predict?lat=34.0522&lon=-118.2437
```

Response:

```json
{
  "risk_level": "HIGH",
  "risk_score": 87,
  "probability": "87%",
  "time_to_impact": "2-3 hours",
  "factors": {
    "rainfall": 120,
    "water_level": 8.5,
    "trend": "increasing"
  },
  "future_predictions": [
    { "time": "Now", "risk": "MEDIUM" },
    { "time": "+1 hr", "risk": "MEDIUM" },
    { "time": "+3 hr", "risk": "HIGH" }
  ],
  "factor_contributions": {
    "rainfall_contribution": 60,
    "water_level_contribution": 30,
    "trend_contribution": 10
  },
  "confidence": "HIGH",
  "explanation": "Risk is driven by heavy rainfall, high water level, an increasing rainfall trend.",
  "rainfall": 120,
  "water_level": 8.5
}
```

Multi-location prediction:

```http
GET http://localhost:8000/predict/multi
```

Simulation mode:

```http
POST http://localhost:8000/simulate
Content-Type: application/json

{
  "rainfall": 120,
  "water_level": 8.5
}
```

## Notes

- The backend uses OpenWeather data to derive rainfall.
- The water level simulation produces a deterministic hourly water level estimate.
- The frontend shows dynamic low, medium, and high heatmap overlays on Google Maps and logs high-risk prediction alerts to the FastAPI backend.
- Predictions and alerts are stored in the SQL database configured by `DATABASE_URL`; SQLite is used by default.
- `backend/app/models/prediction_model.py` is intentionally rule-based and marked for future ML replacement.
