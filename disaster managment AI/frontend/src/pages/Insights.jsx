import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Sidebar from "../components/Sidebar";
import { getInsights } from "../services/api";

const factorLabels = [
  { key: "rainfall", label: "Rainfall", color: "bg-sky-500" },
  { key: "water_level", label: "Water level", color: "bg-cyan-600" },
  { key: "trend", label: "Trend", color: "bg-violet-500" },
];

function SummaryCard({ label, value, detail }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </article>
  );
}

function Insights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInsights = async () => {
    setError("");

    try {
      const response = await getInsights();
      setInsights(response);
    } catch (insightsError) {
      setError("Unable to load prediction insights. Confirm the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-[1300px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Prediction analytics</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-950">Insights</h1>
                <p className="mt-2 text-sm text-slate-500">Explainable analytics generated from stored prediction history.</p>
              </div>
              <button
                onClick={loadInsights}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Refresh Insights
              </button>
            </div>
          </section>

          {error && (
            <section className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </section>
          )}

          {loading ? (
            <section className="mt-6 grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-36 animate-pulse rounded-3xl bg-slate-100" />
              ))}
            </section>
          ) : (
            <>
              <section className="mt-6 grid gap-4 md:grid-cols-3">
                <SummaryCard label="Average Risk Score" value={insights?.avg_risk_score ?? 0} detail="Mean score across stored predictions." />
                <SummaryCard label="Highest Risk Location" value={insights?.highest_risk_location || "No data"} detail="Location with the highest recorded score." />
                <SummaryCard label="Trend" value={insights?.trend || "stable"} detail="Direction across recent predictions." />
              </section>

              <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Risk trend</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">Recent prediction scores</h2>
                  <div className="mt-6 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={insights?.recent_predictions || []} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                        <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0" }} />
                        <Line type="monotone" dataKey="risk" name="Risk score" stroke="#0891b2" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Factor analysis</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">Contribution breakdown</h2>
                  <div className="mt-6 space-y-5">
                    {factorLabels.map((factor) => {
                      const value = insights?.factor_analysis?.[factor.key] ?? 0;

                      return (
                        <div key={factor.key}>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-700">{factor.label}</span>
                            <span className="font-semibold text-slate-950">{value}%</span>
                          </div>
                          <div className="h-3 rounded-full bg-slate-100">
                            <div className={`h-3 rounded-full ${factor.color}`} style={{ width: `${value}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="mt-6 rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Prediction explanation</p>
                <p className="mt-3 text-lg leading-8">{insights?.explanation || "Risk explanation will appear after predictions are stored."}</p>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Insights;
