import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { FiAlertTriangle, FiGrid, FiLogOut, FiShoppingBag } from "react-icons/fi";
import { useAuth } from "./lib/auth";
import { LogoMark } from "./components/LogoMark";

export default function App() {
  const location = useLocation();
  const { loading, logout, organization } = useAuth();

  useEffect(() => {
    document.title = organization
      ? `${organization.name} | OhFour: Virtual Account Reconciliation Platform`
      : "OhFour: Virtual Account Reconciliation Platform";
  }, [organization]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0d1117] text-sm font-medium text-[#8892a4]">
        Loading workspace...
      </div>
    );
  }

  if (!organization) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const navItem = (to: string, label: string) => {
    const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
    const Icon = to === "/" ? FiGrid : to === "/retailers" ? FiShoppingBag : FiAlertTriangle;

    return (
      <Link
        to={to}
        className={`flex items-center gap-3 border-l-[3px] px-4 py-3 text-sm font-medium transition-colors ${
          active
            ? "border-[#3b6ef8] bg-[rgba(59,110,248,0.1)] text-[#3b6ef8]"
            : "border-transparent text-[#8892a4] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f4ff]"
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f4ff]">
      <aside className="fixed inset-y-0 left-0 flex w-[240px] flex-col border-r border-[rgba(255,255,255,0.06)] bg-[#111827]">
        <div className="px-6 py-6">
          <LogoMark />
          <p className="mt-4 text-sm font-semibold text-[#f0f4ff]">{organization.name}</p>
          <p className="mt-1 text-xs text-[#8892a4]">Collections Portal</p>
        </div>

        <nav className="space-y-1 px-3">
          {navItem("/", "Dashboard")}
          {navItem("/retailers", "Retailers")}
          {navItem("/review", "Flagged Payments")}
        </nav>

        <div className="mt-auto border-t border-[rgba(255,255,255,0.06)] px-6 py-5">
          <p className="text-sm font-medium text-[#f0f4ff]">{organization.name}</p>
          <p className="mt-1 break-all text-xs text-[#8892a4]">{organization.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#8892a4] transition-colors hover:text-[#3b6ef8]"
          >
            <FiLogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-[240px] min-h-screen p-8">
        <Outlet />
      </main>
    </div>
  );
}
