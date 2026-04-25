function SimulationPanel({ rainfall, waterLevel, result, loading, onRainfallChange, onWaterLevelChange, onRun }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Simulation mode</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Test prediction scenarios</h2>
        </div>
        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-200">What-if</span>
      </div>

      <div className="mt-6 space-y-5">
        <label className="block">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-slate-700">Rainfall</span>
            <span className="font-semibold text-slate-950">{rainfall} mm</span>
          </div>
          <input
            type="range"
            min="0"
            max="160"
            value={rainfall}
            onChange={(event) => onRainfallChange(Number(event.target.value))}
            className="w-full accent-cyan-600"
          />
        </label>

        <label className="block">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-slate-700">Water level</span>
            <span className="font-semibold text-slate-950">{waterLevel} m</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="0.1"
            value={waterLevel}
            onChange={(event) => onWaterLevelChange(Number(event.target.value))}
            className="w-full accent-cyan-600"
          />
        </label>

        <button
          onClick={onRun}
          className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          {loading ? "Running simulation..." : "Run Simulation"}
        </button>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-500">Simulated prediction</p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold text-slate-950">{result?.risk_level || "--"}</p>
            <p className="mt-1 text-sm text-slate-500">{result ? `${result.risk_score}/100 risk score` : "No simulation run yet"}</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
            {result?.probability || "--"}
          </span>
        </div>
      </div>
    </section>
  );
}

export default SimulationPanel;
