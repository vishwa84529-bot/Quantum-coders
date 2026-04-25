function PredictionInsights({ prediction }) {
  const fallback = "Waiting for rainfall, water level, and trend signals.";
  const message = prediction?.explanation || fallback;
  const factors = prediction?.factors;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-xl hover:shadow-slate-200/70">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Prediction insights</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">Why this risk level?</h2>
      <p className="mt-4 text-sm leading-6 text-slate-600">{message}</p>

      <div className="mt-5 grid gap-3 text-sm">
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <span className="text-slate-500">Rainfall trend</span>
          <span className="font-semibold capitalize text-slate-950">{factors?.trend || "--"}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <span className="text-slate-500">Rainfall</span>
          <span className="font-semibold text-slate-950">{factors ? `${factors.rainfall} mm` : "--"}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <span className="text-slate-500">Water level</span>
          <span className="font-semibold text-slate-950">{factors ? `${factors.water_level} m` : "--"}</span>
        </div>
      </div>
    </section>
  );
}

export default PredictionInsights;
