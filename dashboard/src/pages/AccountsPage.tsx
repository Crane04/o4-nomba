import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Identity, type VirtualAccount } from "../lib/api.js";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<VirtualAccount[]>([]);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [identityName, setIdentityName] = useState("");
  const [kycTier, setKycTier] = useState(1);
  const [selectedIdentityId, setSelectedIdentityId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submittingIdentity, setSubmittingIdentity] = useState(false);
  const [provisioningAccount, setProvisioningAccount] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [accountList, identityList] = await Promise.all([api.getAccounts(), api.getIdentities()]);
      setAccounts(accountList);
      setIdentities(identityList);
      setSelectedIdentityId((current) => current || identityList[0]?.id || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeAccounts = accounts.filter((account) => account.status === "active").length;
  const tierTwoPlus = accounts.filter((account) => account.identity.kycTier >= 2).length;

  const handleCreateIdentity = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccess(null);
    setSubmittingIdentity(true);

    try {
      const identity = await api.createIdentity(identityName.trim(), kycTier);
      setIdentityName("");
      setSelectedIdentityId(identity.id);
      setSuccess(`Created identity for ${identity.currentName}.`);
      await loadData();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Unable to create identity");
    } finally {
      setSubmittingIdentity(false);
    }
  };

  const handleProvisionAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccess(null);
    setProvisioningAccount(true);

    try {
      const account = await api.createAccount(selectedIdentityId);
      setSuccess(`Provisioned ${account.bankName} account ${account.accountNumber}.`);
      await loadData();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Unable to provision account");
    } finally {
      setProvisioningAccount(false);
    }
  };

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

      <section className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={handleCreateIdentity} className="panel p-5">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Step 1</p>
            <h2 className="mt-1 text-lg font-bold tracking-tight">Create Identity</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Name</span>
              <input
                value={identityName}
                onChange={(event) => setIdentityName(event.target.value)}
                placeholder="Customer name"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">KYC Tier</span>
              <select
                value={kycTier}
                onChange={(event) => setKycTier(Number(event.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value={1}>Tier 1</option>
                <option value={2}>Tier 2</option>
                <option value={3}>Tier 3</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={!identityName.trim() || submittingIdentity}
            className="mt-4 rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submittingIdentity ? "Creating..." : "Create identity"}
          </button>
        </form>

        <form onSubmit={handleProvisionAccount} className="panel p-5">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Step 2</p>
            <h2 className="mt-1 text-lg font-bold tracking-tight">Provision Nomba Account</h2>
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Identity</span>
            <select
              value={selectedIdentityId}
              onChange={(event) => setSelectedIdentityId(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {identities.map((identity) => (
                <option key={identity.id} value={identity.id}>
                  {identity.currentName} · Tier {identity.kycTier}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={!selectedIdentityId || provisioningAccount}
            className="mt-4 rounded-md bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {provisioningAccount ? "Provisioning..." : "Provision account"}
          </button>
        </form>
      </section>

      {(formError || success) && (
        <div
          className={`rounded-lg border p-4 text-sm font-semibold ${
            formError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {formError ?? success}
        </div>
      )}

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
