import { Area, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function TrendChart({ points, riskLevel }) {
  const data = points.length
    ? points
    : [
        { label: "T-5", rainfall: 8, riskScore: 12 },
        { label: "T-4", rainfall: 14, riskScore: 18 },
        { label: "T-3", rainfall: 19, riskScore: 24 },
        { label: "T-2", rainfall: 31, riskScore: 36 },
        { label: "T-1", rainfall: 46, riskScore: 48 },
        { label: "Now", rainfall: 52, riskScore: 30 },
      ];

  const riskColor = riskLevel === "HIGH" ? "#dc2626" : riskLevel === "MEDIUM" ? "#d97706" : "#16a34a";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-xl hover:shadow-slate-200/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Trend visualization</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Risk progression</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Live sample</span>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-slate-50 p-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 20px 45px rgba(15,23,42,0.12)",
                }}
              />
              <Area type="monotone" dataKey="riskScore" fill={riskColor} fillOpacity={0.12} stroke="none" />
              <Line type="monotone" dataKey="riskScore" name="Risk score" stroke={riskColor} strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="rainfall" name="Rainfall" stroke="#0ea5e9" strokeWidth={3} strokeDasharray="6 6" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-2 text-slate-600">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: riskColor }} />
          Risk score
        </span>
        <span className="flex items-center gap-2 text-slate-600">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
          Rainfall
        </span>
      </div>
    </section>
  );
}

export default TrendChart;
