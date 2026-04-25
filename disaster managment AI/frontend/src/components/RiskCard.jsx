const themeByRisk = {
  LOW: "border-emerald-300 bg-emerald-50 text-emerald-700",
  MEDIUM: "border-amber-300 bg-amber-50 text-amber-700",
  HIGH: "border-rose-300 bg-rose-50 text-rose-700",
};

function RiskCard({ title, value, detail, riskLevel = "LOW", loading }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${themeByRisk[riskLevel] || themeByRisk.LOW}`}>
          {riskLevel}
        </span>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          <div className="h-9 w-28 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-4 w-36 animate-pulse rounded-full bg-slate-100" />
        </div>
      ) : (
        <>
          <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">{value || "--"}</p>
          <p className="mt-2 text-sm leading-5 text-slate-500">{detail}</p>
        </>
      )}
    </article>
  );
}

export default RiskCard;
