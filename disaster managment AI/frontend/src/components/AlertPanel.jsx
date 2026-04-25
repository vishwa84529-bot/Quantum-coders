const severityStyles = {
  LOW: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 ring-amber-200",
  HIGH: "bg-rose-50 text-rose-700 ring-rose-200",
};

function AlertPanel({ alerts, loading }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-xl hover:shadow-slate-200/70">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Alerts</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Recent notifications</h2>
        </div>
        {loading && <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-600" />}
      </div>

      <div className="mt-5 space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
            No alerts yet. High-risk predictions will appear here automatically.
          </div>
        ) : (
          alerts.slice(0, 4).map((alert) => (
            <article
              key={alert.id}
              className={`rounded-2xl border p-4 transition ${
                alert.level === "HIGH" ? "border-rose-200 bg-rose-50/70" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium leading-6 text-slate-800">{alert.message}</p>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${severityStyles[alert.level] || severityStyles.LOW}`}>
                  {alert.level}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{alert.timestamp}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default AlertPanel;
