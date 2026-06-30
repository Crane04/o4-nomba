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

  if (loading) return <p className="text-slate-500">Loading accounts…</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Virtual Accounts</h1>
      <p className="text-slate-500 text-sm mb-6">
        Every account is tied to an identity, not the other way around. Click into one to see its
        full event history.
      </p>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Account Number</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">KYC Tier</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => (
              <tr key={acc.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono">{acc.accountNumber}</td>
                <td className="px-4 py-3">
                  <Link to={`/identities/${acc.identityId}`} className="text-blue-600 hover:underline">
                    {acc.identity.currentName}
                  </Link>
                </td>
                <td className="px-4 py-3">Tier {acc.identity.kycTier}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      acc.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {acc.status}
                  </span>
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No accounts yet. Seed the database or provision one via the API.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
