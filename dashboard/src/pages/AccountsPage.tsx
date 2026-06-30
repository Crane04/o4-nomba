import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type VirtualAccount } from "../lib/api.js";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<VirtualAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getAccounts()
      .then(setAccounts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const activeAccounts = accounts.filter((account) => account.status === "active").length;
  const tierTwoPlus = accounts.filter((account) => account.identity.kycTier >= 2).length;

  if (loading) {
    return (
      <div className="panel p-6">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-24 animate-pulse rounded-md bg-slate-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="page-kicker">Account Registry</p>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="page-title">Virtual Accounts</h1>
            <p className="page-copy">Identity-linked collection accounts and customer status.</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
            Local Postgres
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="metric">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Total Accounts</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{accounts.length}</p>
        </div>
        <div className="metric">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Active</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-700">{activeAccounts}</p>
        </div>
        <div className="metric">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">KYC Tier 2+</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{tierTwoPlus}</p>
        </div>
      </section>

      <div className="panel">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Account Number</th>
              <th className="px-5 py-3 font-bold">Customer</th>
              <th className="px-5 py-3 font-bold">Bank</th>
              <th className="px-5 py-3 font-bold">KYC</th>
              <th className="px-5 py-3 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-emerald-50/40">
                <td className="px-5 py-4 font-mono text-sm font-semibold text-slate-900">
                  {acc.accountNumber}
                </td>
                <td className="px-5 py-4">
                  <Link
                    to={`/identities/${acc.identityId}`}
                    className="font-semibold text-slate-950 underline decoration-emerald-300 decoration-2 underline-offset-4 hover:text-emerald-700"
                  >
                    {acc.identity.currentName}
                  </Link>
                </td>
                <td className="px-5 py-4 text-slate-600">{acc.bankName}</td>
                <td className="px-5 py-4">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                    Tier {acc.identity.kycTier}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`status-pill ${
                      acc.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {acc.status}
                  </span>
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm font-medium text-slate-400">
                  No accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
