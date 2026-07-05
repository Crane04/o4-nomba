import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { FiAlertTriangle, FiCreditCard, FiGrid, FiLogOut, FiShoppingBag } from "react-icons/fi";
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
    const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
    const Icon =
      to === "/dashboard"
        ? FiGrid
        : to === "/retailers"
          ? FiShoppingBag
          : to === "/transfers"
            ? FiCreditCard
            : FiAlertTriangle;

    return (
      <Link
        to={to}
        className={`flex items-center justify-center gap-2 rounded-lg border border-transparent px-2 py-2 text-xs font-medium transition-colors lg:justify-start lg:gap-3 lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l-[3px] lg:px-4 lg:py-3 lg:text-sm ${
          active
            ? "border-[#3b6ef8] bg-[rgba(59,110,248,0.1)] text-[#3b6ef8]"
            : "text-[#8892a4] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f4ff]"
        }`}
      >
        <Icon className="hidden h-4 w-4 sm:block" />
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f4ff]">
      <header className="sticky top-0 z-30 border-b border-[rgba(255,255,255,0.06)] bg-[#111827]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <LogoMark size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#f0f4ff]">{organization.name}</p>
              <p className="text-xs text-[#8892a4]">Collections Portal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[rgba(255,255,255,0.08)] text-[#8892a4]"
            aria-label="Logout"
          >
            <FiLogOut className="h-4 w-4" />
          </button>
        </div>
        <nav className="mt-3 grid grid-cols-4 gap-2">
          {navItem("/dashboard", "Dashboard")}
          {navItem("/retailers", "Retailers")}
          {navItem("/transfers", "Transfers")}
          {navItem("/review", "Flagged")}
        </nav>
      </header>

      <aside className="fixed inset-y-0 left-0 hidden w-[240px] flex-col border-r border-[rgba(255,255,255,0.06)] bg-[#111827] lg:flex">
        <div className="px-6 py-6">
          <LogoMark />
          <p className="mt-4 text-sm font-semibold text-[#f0f4ff]">{organization.name}</p>
          <p className="mt-1 text-xs text-[#8892a4]">Collections Portal</p>
        </div>

        <nav className="space-y-1 px-3">
          {navItem("/dashboard", "Dashboard")}
          {navItem("/retailers", "Retailers")}
          {navItem("/transfers", "Transfers")}
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

      <main className="min-w-0 p-4 sm:p-6 lg:ml-[240px] lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
