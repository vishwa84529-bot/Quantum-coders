function formatTimeAgo(updatedAt) {
  if (!updatedAt) {
    return "Waiting for first update";
  }

  const seconds = Math.max(0, Math.floor((Date.now() - updatedAt.getTime()) / 1000));

  if (seconds < 5) {
    return "Just now";
  }

  if (seconds < 60) {
    return `${seconds} seconds ago`;
  }

  const minutes = Math.floor(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
}

import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

function Navbar({ location, lastUpdated, isLoading, onRefresh }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 px-4 py-4 backdrop-blur-xl md:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-400">Prediction Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white md:text-3xl">Flood risk command center</h1>

        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Current location</p>
            <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-slate-100">
              {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Last updated</p>
            <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-slate-100">{formatTimeAgo(lastUpdated)}</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            <span className={`h-2.5 w-2.5 rounded-full ${isLoading ? "animate-pulse bg-amber-500" : "bg-emerald-500"}`} />
            {isLoading ? "Updating" : "Live"}
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-800 p-3 text-slate-700 dark:text-slate-300 transition hover:bg-slate-300 dark:hover:bg-slate-700"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={onRefresh}
            className="rounded-2xl bg-slate-950 dark:bg-slate-100 px-5 py-3 text-sm font-semibold text-white dark:text-slate-950 shadow-lg shadow-slate-950/10 dark:shadow-slate-100/10 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:hover:bg-white"
          >
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
