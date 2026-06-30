import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  api,
  type ExpectedPayment,
  type Identity,
  type SimulatedTransferResult,
  type VirtualAccount,
} from "../lib/api.js";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function PaymentsLabPage() {
  const [accounts, setAccounts] = useState<VirtualAccount[]>([]);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [payments, setPayments] = useState<ExpectedPayment[]>([]);
  const [selectedIdentityId, setSelectedIdentityId] = useState("");
  const [selectedAccountNumber, setSelectedAccountNumber] = useState("");
  const [label, setLabel] = useState("Hackathon demo payment");
  const [expectedAmount, setExpectedAmount] = useState(50000);
  const [dueDate, setDueDate] = useState(today());
  const [senderName, setSenderName] = useState("");
  const [transferAmount, setTransferAmount] = useState(50000);
  const [reference, setReference] = useState(`demo-${Date.now()}`);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulatedTransferResult | null>(null);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.accountNumber === selectedAccountNumber),
    [accounts, selectedAccountNumber]
  );

  const load = async () => {
    setLoading(true);
    const [accountList, identityList, paymentList] = await Promise.all([
      api.getAccounts(),
      api.getIdentities(),
      api.getExpectedPayments(),
    ]);
    setAccounts(accountList);
    setIdentities(identityList);
    setPayments(paymentList);
    setSelectedIdentityId((current) => current || identityList[0]?.id || "");
    setSelectedAccountNumber((current) => current || accountList[0]?.accountNumber || "");
    setSenderName((current) => current || accountList[0]?.identity.currentName || "");
    setLoading(false);
  };

  useEffect(() => {
    load().catch((e) => {
      setError(e instanceof Error ? e.message : "Unable to load payment lab");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedAccount && !senderName) {
      setSenderName(selectedAccount.identity.currentName);
    }
  }, [selectedAccount, senderName]);

  const handleCreateExpectedPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWorking(true);
    setError(null);
    setMessage(null);
    setSimulationResult(null);

    try {
      const payment = await api.createExpectedPayment({
        identityId: selectedIdentityId,
        expectedAmount,
        label,
        dueDate,
      });
      setMessage(`Created expected payment: ${payment.label}.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create expected payment");
    } finally {
      setWorking(false);
    }
  };

  const handleSimulateTransfer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWorking(true);
    setError(null);
    setMessage(null);
    setSimulationResult(null);

    try {
      const result = await api.simulateTransfer({
        amount: transferAmount,
        senderName,
        reference,
        virtualAccountNumber: selectedAccountNumber,
      });
      setSimulationResult(result);
      setMessage(result.autoMatched ? "Transfer auto-matched." : "Transfer sent to review queue.");
      setReference(`demo-${Date.now()}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to simulate transfer");
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className="panel p-6">
        <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-40 animate-pulse rounded-md bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="page-kicker">Payment Flow</p>
        <h1 className="page-title">Reconciliation Lab</h1>
        <p className="page-copy">
          Create an expected payment, simulate an inbound transfer, and watch the matching engine
          decide whether to auto-match or route it to review.
        </p>
      </section>

      {(error || message) && (
        <div
          className={`rounded-lg border p-4 text-sm font-semibold ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={handleCreateExpectedPayment} className="panel p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Step 1</p>
          <h2 className="mt-1 text-lg font-bold tracking-tight">Expected Payment</h2>

          <div className="mt-4 grid gap-3">
            <label>
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Identity</span>
              <select
                value={selectedIdentityId}
                onChange={(event) => setSelectedIdentityId(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {identities.map((identity) => (
                  <option key={identity.id} value={identity.id}>
                    {identity.currentName} · Tier {identity.kycTier}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Label</span>
                <input
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <label>
                <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Amount</span>
                <input
                  type="number"
                  value={expectedAmount}
                  onChange={(event) => setExpectedAmount(Number(event.target.value))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
            </div>

            <label>
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Due Date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={working || !selectedIdentityId || !label.trim() || expectedAmount <= 0}
            className="mt-4 rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create expected payment
          </button>
        </form>

        <form onSubmit={handleSimulateTransfer} className="panel p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Step 2</p>
          <h2 className="mt-1 text-lg font-bold tracking-tight">Inbound Transfer</h2>

          <div className="mt-4 grid gap-3">
            <label>
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Virtual Account</span>
              <select
                value={selectedAccountNumber}
                onChange={(event) => {
                  const accountNumber = event.target.value;
                  setSelectedAccountNumber(accountNumber);
                  const account = accounts.find((item) => item.accountNumber === accountNumber);
                  setSenderName(account?.identity.currentName ?? "");
                }}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.accountNumber}>
                    {account.accountNumber} · {account.identity.currentName}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Sender Name</span>
                <input
                  value={senderName}
                  onChange={(event) => setSenderName(event.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <label>
                <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Amount</span>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(event) => setTransferAmount(Number(event.target.value))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
            </div>

            <label>
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Reference</span>
              <input
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={working || !selectedAccountNumber || !senderName.trim() || transferAmount <= 0}
            className="mt-4 rounded-md bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Simulate transfer
          </button>
        </form>
      </section>

      {simulationResult?.topMatch && (
        <section className="panel p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Match Result</p>
          <div className="mt-3 flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <p className="text-lg font-bold">
                {Math.round(simulationResult.topMatch.confidenceScore * 100)}% confidence
              </p>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600">
                {simulationResult.topMatch.reasoning}
              </p>
            </div>
            {!simulationResult.autoMatched && (
              <Link
                to="/review"
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
              >
                Open review queue
              </Link>
            )}
          </div>
        </section>
      )}

      <section className="panel">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-sm font-bold">Expected Payments</p>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Label</th>
              <th className="px-5 py-3 font-bold">Customer</th>
              <th className="px-5 py-3 font-bold">Amount</th>
              <th className="px-5 py-3 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-5 py-4 font-semibold">{payment.label}</td>
                <td className="px-5 py-4 text-slate-600">{payment.identity.currentName}</td>
                <td className="px-5 py-4 font-mono font-semibold">
                  ₦{payment.expectedAmount.toLocaleString()}
                </td>
                <td className="px-5 py-4">
                  <span className="status-pill bg-slate-100 text-slate-700">{payment.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
