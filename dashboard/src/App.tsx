import { Link, Outlet, useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();

  const navItem = (to: string, label: string) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`border-b-2 px-1 py-4 text-sm font-semibold transition ${
          active
            ? "border-emerald-500 text-slate-950"
            : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#f6f7f4] text-slate-950">
      <header className="border-b border-slate-200/80 bg-white/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3 py-3">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-slate-950 font-mono text-sm font-black text-white">
              O4
            </div>
            <div>
              <p className="text-sm font-bold leading-5 tracking-tight">Nomba Reconciliation</p>
              <p className="text-xs font-medium text-slate-500">Operations Console</p>
            </div>
          </div>
          <nav className="flex gap-7">
            {navItem("/", "Accounts")}
            {navItem("/review", "Review Queue")}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
