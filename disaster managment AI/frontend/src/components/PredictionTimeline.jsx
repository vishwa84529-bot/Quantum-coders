const riskDotStyles = {
  LOW: "bg-emerald-500 ring-emerald-100",
  MEDIUM: "bg-amber-500 ring-amber-100",
  HIGH: "bg-rose-500 ring-rose-100",
};

function PredictionTimeline({ predictions }) {
  const timeline = predictions?.length ? predictions : [{ time: "Now", risk: "LOW" }];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Forecast timeline</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">Time-based risk prediction</h2>

      <div className="mt-6 space-y-4">
        {timeline.map((item, index) => (
          <div key={`${item.time}-${index}`} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className={`h-4 w-4 rounded-full ring-8 ${riskDotStyles[item.risk] || riskDotStyles.LOW}`} />
              {index < timeline.length - 1 && <span className="mt-2 h-10 w-px bg-slate-200" />}
            </div>
            <div className="min-w-0 pb-3">
              <p className="font-semibold text-slate-950">{item.time}</p>
              <p className="mt-1 text-sm text-slate-500">{item.risk} flood risk predicted</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PredictionTimeline;
