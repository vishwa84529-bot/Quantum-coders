const riskStyles = {
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  HIGH: "border-rose-200 bg-rose-50 text-rose-700",
};

function MultiLocationPanel({ locations, loading }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Multi-location</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Regional prediction watch</h2>
        </div>
        {loading && <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-600" />}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {(locations || []).map((location) => (
          <article
            key={location.city}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-slate-200/70"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">{location.city}</p>
                <p className="mt-1 text-sm text-slate-500">Score {location.score}/100</p>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${riskStyles[location.risk] || riskStyles.LOW}`}>
                {location.risk}
              </span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-slate-200">
              <div
                className={`h-2 rounded-full ${
                  location.risk === "HIGH" ? "bg-rose-500" : location.risk === "MEDIUM" ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(location.score || 0, 100)}%` }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MultiLocationPanel;
