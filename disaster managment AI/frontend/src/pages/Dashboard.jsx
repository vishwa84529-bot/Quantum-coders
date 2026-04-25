import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import RiskCard from "../components/RiskCard";
import AlertPanel from "../components/AlertPanel";
import PredictionInsights from "../components/PredictionInsights";
import TrendChart from "../components/TrendChart";
import MultiLocationPanel from "../components/MultiLocationPanel";
import PredictionTimeline from "../components/PredictionTimeline";
import FactorBreakdown from "../components/FactorBreakdown";
import SimulationPanel from "../components/SimulationPanel";
import MapView from "../components/MapView";
import AISummary from "../components/AISummary";
import { getAlerts, getMultiPredictions, getPrediction, runSimulation, saveAlert } from "../services/api";

const DEFAULT_LOCATION = { lat: 34.0522, lon: -118.2437 };
const REFRESH_INTERVAL_MS = 12000;

const alertMessages = {
  LOW: "Conditions are stable. Monitor local forecasts and infrastructure updates.",
  MEDIUM: "Rainfall is elevated. Stay alert and avoid low-lying routes.",
  HIGH: "Flood risk is high. Follow evacuation guidance and move to safe ground.",
};

function formatAlertTime(timestamp) {
  if (!timestamp) {
    return "Just now";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Dashboard() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [riskData, setRiskData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [multiLocations, setMultiLocations] = useState([]);
  const [trendPoints, setTrendPoints] = useState([]);
  const [simulationRainfall, setSimulationRainfall] = useState(80);
  const [simulationWaterLevel, setSimulationWaterLevel] = useState(5.5);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulationLoading, setIsSimulationLoading] = useState(false);
  const [error, setError] = useState("");
  const lastHighAlertRef = useRef(0);

  const normalizedAlerts = useMemo(
    () =>
      alerts.map((alert) => ({
        id: alert.id || `${alert.level}-${alert.created_at || alert.timestamp}`,
        level: alert.risk_level || alert.level,
        message: alert.message,
        timestamp: formatAlertTime(alert.created_at || alert.timestamp),
      })),
    [alerts]
  );

  const loadAlerts = async () => {
    try {
      const response = await getAlerts();
      setAlerts(response);
    } catch (alertError) {
      console.warn("Failed to load alerts:", alertError);
    }
  };

  const loadMultiPredictions = async () => {
    try {
      const response = await getMultiPredictions();
      setMultiLocations(response);
    } catch (multiError) {
      console.warn("Failed to load multi-location predictions:", multiError);
    }
  };

  const handleRunSimulation = async () => {
    setIsSimulationLoading(true);

    try {
      const response = await runSimulation({
        rainfall: simulationRainfall,
        water_level: simulationWaterLevel,
      });
      setSimulationResult(response);
    } catch (simulationError) {
      setError("Simulation failed. Confirm the backend /simulate endpoint is running.");
    } finally {
      setIsSimulationLoading(false);
    }
  };

  const loadPrediction = async (lat, lon) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getPrediction(lat, lon);
      setRiskData(response);
      setLastUpdated(new Date());
      setTrendPoints((currentPoints) => {
        const nextPoint = {
          label: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          rainfall: response.factors?.rainfall || response.rainfall || 0,
          riskScore: response.risk_score || 0,
        };

        return [...currentPoints, nextPoint].slice(-8);
      });

      if (response.risk_level === "HIGH" && Date.now() - lastHighAlertRef.current > 60000) {
        try {
          await saveAlert({
            level: response.risk_level,
            message: alertMessages[response.risk_level],
            latitude: lat,
            longitude: lon,
          });
          lastHighAlertRef.current = Date.now();
          await loadAlerts();
        } catch (saveError) {
          console.warn("Failed to log alert:", saveError);
        }
      }
    } catch (err) {
      console.error("[dashboard] prediction fetch failed", err);
      setError("Unable to fetch live data. Confirm the backend is running and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      loadPrediction(location.lat, location.lon);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setLocation(coords);
        loadPrediction(coords.lat, coords.lon);
      },
      () => {
        loadPrediction(location.lat, location.lon);
      },
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    loadAlerts();
    loadMultiPredictions();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadPrediction(location.lat, location.lon);
      loadMultiPredictions();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [location.lat, location.lon]);

  const riskLevel = riskData?.risk_level || "LOW";
  const metrics = [
    {
      title: "Risk Level",
      value: riskData?.risk_level,
      detail: "Current classification from rainfall, water level, and trend.",
    },
    {
      title: "Risk Score",
      value: riskData ? `${riskData.risk_score}/100` : null,
      detail: "Weighted environmental risk index.",
    },
    {
      title: "Probability",
      value: riskData?.probability,
      detail: "Rule-based probability placeholder for future ML.",
    },
    {
      title: "Time to Impact",
      value: riskData?.time_to_impact,
      detail: "Estimated window before local impact.",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Navbar
          location={location}
          lastUpdated={lastUpdated}
          isLoading={isLoading}
          onRefresh={() => loadPrediction(location.lat, location.lon)}
        />

        <main className="mx-auto flex max-w-[1500px] flex-col gap-6 px-4 py-6 md:px-8">
          {error && (
            <section className="rounded-3xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900/50 p-4 text-sm text-rose-700 dark:text-rose-400 shadow-sm mb-6">
              <strong className="block font-semibold">Connection issue</strong>
              <p className="mt-1">{error}</p>
            </section>
          )}

          <AISummary riskData={riskData} alerts={normalizedAlerts} />

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <RiskCard
                key={metric.title}
                title={metric.title}
                value={metric.value}
                detail={metric.detail}
                riskLevel={riskLevel}
                loading={isLoading && !riskData}
              />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.9fr)]">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Live map</p>
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800/50">
                      Live Map Active
                    </span>
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-slate-50">Flood exposure zone</h2>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800/50">Low</span>
                  <span className="rounded-full bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 text-amber-700 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800/50">Medium</span>
                  <span className="rounded-full bg-rose-50 dark:bg-rose-900/30 px-3 py-1.5 text-rose-700 dark:text-rose-400 ring-1 ring-rose-200 dark:ring-rose-800/50">High</span>
                </div>
              </div>

              <div className="relative min-h-[500px] overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-950 xl:h-[700px]">
                {isLoading && (
                  <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600" />
                    Fetching live data
                  </div>
                )}
                <MapView
                  location={location}
                  risk={riskLevel}
                  rainfall={riskData?.rainfall}
                  waterLevel={riskData?.water_level}
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Rainfall</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{riskData ? `${riskData.rainfall} mm` : "--"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Water level</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{riskData ? `${riskData.water_level} m` : "--"}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <MultiLocationPanel locations={multiLocations} loading={isLoading && multiLocations.length === 0} />
              <PredictionInsights prediction={riskData} />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <PredictionTimeline predictions={riskData?.future_predictions} />
            <FactorBreakdown contributions={riskData?.factor_contributions} />
            <SimulationPanel
              rainfall={simulationRainfall}
              waterLevel={simulationWaterLevel}
              result={simulationResult}
              loading={isSimulationLoading}
              onRainfallChange={setSimulationRainfall}
              onWaterLevelChange={setSimulationWaterLevel}
              onRun={handleRunSimulation}
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <TrendChart points={trendPoints} riskLevel={riskLevel} />
            <div className="flex flex-col gap-6">
              <AlertPanel alerts={normalizedAlerts} loading={isLoading} />
              <section className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">System status</p>
              <h2 className="mt-2 text-xl font-semibold">Prediction engine online</h2>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-slate-300">API</span>
                  <span className="font-semibold text-emerald-300">Connected</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-slate-300">Refresh cycle</span>
                  <span className="font-semibold">{REFRESH_INTERVAL_MS / 1000}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Model mode</span>
                  <span className="font-semibold">Rule-based</span>
                </div>
              </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
