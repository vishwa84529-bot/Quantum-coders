import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getAlerts } from "../services/api";

const riskStyles = {
  LOW: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 ring-amber-200",
  HIGH: "bg-rose-50 text-rose-700 ring-rose-200",
};

function formatTime(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp || "Unknown time";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sortedAlerts = useMemo(
    () => [...alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [alerts]
  );

  const loadAlerts = async () => {
    setError("");

    try {
      const response = await getAlerts();
      setAlerts(response);
    } catch (alertError) {
      setError("Unable to load prediction alerts. Confirm the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const intervalId = window.setInterval(loadAlerts, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Prediction alerts</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-950">Prediction Alerts</h1>
                <p className="mt-2 text-sm text-slate-500">Latest prediction-driven flood warnings from the risk engine.</p>
              </div>
              <button
                onClick={loadAlerts}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Refresh Alerts
              </button>
            </div>
          </section>

          {error && (
            <section className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </section>
          )}

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : sortedAlerts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <p className="text-lg font-semibold text-slate-950">No alerts available</p>
                <p className="mt-2 text-sm text-slate-500">Prediction alerts will appear when high flood risk is detected.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedAlerts.map((alert) => {
                  const riskLevel = alert.risk_level || alert.level || "LOW";

                  return (
                    <article
                      key={alert.id}
                      className={`rounded-3xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${
                        riskLevel === "HIGH" ? "border-rose-200 bg-rose-50/70" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-500">{alert.location}</p>
                          <h2 className="mt-2 text-lg font-semibold text-slate-950">{alert.message}</h2>
                          <p className="mt-2 text-sm text-slate-500">{formatTime(alert.timestamp)}</p>
                        </div>
                        <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${riskStyles[riskLevel] || riskStyles.LOW}`}>
                          {riskLevel}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Alerts;
