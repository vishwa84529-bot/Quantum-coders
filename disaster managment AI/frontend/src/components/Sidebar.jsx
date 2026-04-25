import { NavLink } from "react-router-dom";

const navigation = [
  { label: "Dashboard", icon: "grid", to: "/dashboard" },
  { label: "Alerts", icon: "bell", to: "/alerts" },
  { label: "Insights", icon: "chart", to: "/insights" },
];

function Icon({ name }) {
  const common = {
    className: "h-5 w-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (name === "bell") {
    return (
      <svg {...common}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
    );
  }

  if (name === "chart") {
    return (
      <svg {...common}>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 14 3-3 3 2 5-7" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-200 bg-white px-5 py-6 shadow-sm lg:block">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-600 text-lg font-bold text-white shadow-lg shadow-cyan-600/20">
          FS
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-950">FloodSense AI</p>
          <p className="text-xs font-medium text-slate-500">Prediction Operations</p>
        </div>
      </div>

      <nav className="mt-10 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`
            }
          >
            <Icon name={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-10 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
        <p className="text-sm font-semibold text-cyan-950">Monitoring active</p>
        <p className="mt-2 text-xs leading-5 text-cyan-800">
          Live environmental signals refresh automatically every 12 seconds.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
