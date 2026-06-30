import { Link, Outlet, useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();

  const navItem = (to: string, label: string) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-200"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-lg tracking-tight">O4</span>
            <span className="text-slate-400 text-sm">reconciliation infrastructure</span>
          </div>
          <nav className="flex gap-2">
            {navItem("/", "Accounts")}
            {navItem("/review", "Review Queue")}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
