const factors = [
  { key: "rainfall_contribution", label: "Rainfall", color: "bg-sky-500" },
  { key: "water_level_contribution", label: "Water level", color: "bg-cyan-600" },
  { key: "trend_contribution", label: "Trend", color: "bg-violet-500" },
];

function FactorBreakdown({ contributions }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Explainability</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">Factor contribution</h2>

      <div className="mt-6 space-y-5">
        {factors.map((factor) => {
          const value = contributions?.[factor.key] ?? 0;

          return (
            <div key={factor.key}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{factor.label}</span>
                <span className="font-semibold text-slate-950">{value}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div className={`h-3 rounded-full ${factor.color} transition-all duration-500`} style={{ width: `${value}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FactorBreakdown;
