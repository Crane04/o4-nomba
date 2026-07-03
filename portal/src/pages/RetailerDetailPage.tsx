import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { api, ExpectedPayment, Identity, IdentityEvent, Transfer, VirtualAccount } from "../lib/api";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getBusinessType,
  isCollectedStatus,
  transferDisplayStatus,
} from "../lib/collections";
import { EmptyState, ErrorState, StatusBadge } from "../lib/ui";

export default function RetailerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [account, setAccount] = useState<VirtualAccount | null>(null);
  const [expectedPayments, setExpectedPayments] = useState<ExpectedPayment[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [history, setHistory] = useState<IdentityEvent[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [invoiceLabel, setInvoiceLabel] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDueDate, setInvoiceDueDate] = useState("");
  const [invoiceError, setInvoiceError] = useState("");
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  const loadRetailer = async () => {
    if (!id) return;

    const [identityResult, accounts, allExpectedPayments, historyResult] = await Promise.all([
      api.getIdentity(id),
      api.getAccounts(),
      api.getExpectedPayments(),
      api.getIdentityHistory(id),
    ]);

    const selectedAccount =
      identityResult.virtualAccounts?.[0] ?? accounts.find((candidate) => candidate.identityId === id) ?? null;
    const accountTransfers = selectedAccount ? await api.getAccountTransfers(selectedAccount.id) : [];

    setIdentity(identityResult);
    setAccount(selectedAccount);
    setExpectedPayments(allExpectedPayments.filter((payment) => payment.identityId === id));
    setTransfers(accountTransfers);
    setHistory(historyResult);
  };

  useEffect(() => {
    loadRetailer().catch((err: Error) => setError(err.message));
  }, [id]);

  const totals = useMemo(() => {
    const invoiced = expectedPayments.reduce((sum, payment) => sum + payment.expectedAmount, 0);
    const collected = transfers
      .filter((transfer) => isCollectedStatus(transfer.status))
      .reduce((sum, transfer) => sum + transfer.amount, 0);

    return { invoiced, collected, outstanding: Math.max(invoiced - collected, 0) };
  }, [expectedPayments, transfers]);

  const copyAccount = async () => {
    if (!account?.accountNumber) return;
    await navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const createInvoice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;

    setInvoiceError("");
    setCreatingInvoice(true);

    try {
      await api.createExpectedPayment({
        identityId: id,
        expectedAmount: Number(invoiceAmount),
        label: invoiceLabel,
        dueDate: invoiceDueDate || undefined,
      });
      setInvoiceLabel("");
      setInvoiceAmount("");
      setInvoiceDueDate("");
      await loadRetailer();
    } catch (err) {
      setInvoiceError(err instanceof Error ? err.message : "Could not create invoice");
    } finally {
      setCreatingInvoice(false);
    }
  };

  if (error) return <ErrorState message={error} />;
  if (!identity) return <EmptyState>Loading retailer profile...</EmptyState>;

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <Link to="/retailers" className="inline-flex items-center gap-2 text-sm font-medium text-[#3b6ef8] hover:text-[#2d5ee0]">
            <FiArrowLeft className="h-4 w-4" />
            Back to retailers
          </Link>
          <h1 className="mt-4 page-title">{identity.currentName}</h1>
          <p className="page-copy">{getBusinessType(identity.id)}</p>
        </div>
      </section>

      <section className="panel p-4 sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div className="min-w-0">
            <p className="page-kicker">Dedicated Collection Account</p>
            <p className="mt-4 break-all font-mono text-2xl font-semibold tracking-wide text-[#f0f4ff] sm:text-3xl">
              {account?.accountNumber ?? "No account provisioned"}
            </p>
            <p className="mt-2 text-sm text-[#8892a4]">
              Retailer sends payment to this account number from any bank app
            </p>
            {account?.bankName ? <p className="mt-1 text-sm font-medium text-[#8892a4]">{account.bankName}</p> : null}
          </div>
          <button
            type="button"
            onClick={copyAccount}
            disabled={!account?.accountNumber}
            className="outline-button w-full sm:w-auto"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Total Invoiced" value={formatCurrency(totals.invoiced)} />
        <Metric label="Received" value={formatCurrency(totals.collected)} />
        <Metric label="Outstanding" value={formatCurrency(totals.outstanding)} />
      </section>

      <section className="panel">
        <SectionHeader title="Open Invoices" copy="Expected distributor payments for this retailer." />
        <form
          onSubmit={createInvoice}
          className="grid gap-3 border-b border-[rgba(255,255,255,0.04)] p-4 sm:p-6 md:grid-cols-[minmax(220px,1fr)_150px_150px_140px]"
        >
          <input
            value={invoiceLabel}
            onChange={(event) => setInvoiceLabel(event.target.value)}
            className="input-field"
            placeholder="Delivery #0032 - Rice & Beans"
            required
          />
          <input
            value={invoiceAmount}
            onChange={(event) => setInvoiceAmount(event.target.value)}
            type="number"
            min="1"
            step="1"
            className="input-field font-mono"
            placeholder="Amount"
            required
          />
          <input
            value={invoiceDueDate}
            onChange={(event) => setInvoiceDueDate(event.target.value)}
            type="date"
            className="input-field"
          />
          <button
            type="submit"
            disabled={creatingInvoice}
            className="primary-button"
          >
            {creatingInvoice ? "Creating..." : "Create invoice"}
          </button>
          {invoiceError ? (
            <div className="rounded-lg border border-[#f87171]/20 bg-[#2a1a1a] px-3 py-2 text-sm font-medium text-[#f87171] md:col-span-4">
              {invoiceError}
            </div>
          ) : null}
        </form>
        {expectedPayments.length === 0 ? (
          <div className="p-5">
            <EmptyState>No expected payments found.</EmptyState>
          </div>
        ) : (
          <div>
            {expectedPayments.map((payment) => (
              <div key={payment.id} className="grid gap-3 border-b border-[rgba(255,255,255,0.04)] px-4 py-4 last:border-b-0 sm:px-6 md:grid-cols-[1fr_160px_130px_120px] md:items-center">
                <p className="font-medium text-[#f0f4ff]">{payment.label}</p>
                <p className="font-mono font-semibold text-[#f0f4ff]">{formatCurrency(payment.expectedAmount)}</p>
                <p className="text-sm text-[#8892a4]">{formatDate(payment.dueDate)}</p>
                <StatusBadge label={payment.status.toLowerCase() === "matched" ? "Cleared" : "Outstanding"} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <SectionHeader title="Transfers" copy="Bank transfers received on this retailer's account." />
        {transfers.length === 0 ? (
          <div className="p-5">
            <EmptyState>No transfers received yet.</EmptyState>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Sender Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((transfer) => (
                  <tr key={transfer.id} className="border-b border-[rgba(255,255,255,0.04)] odd:bg-[rgba(255,255,255,0.01)] last:border-b-0">
                    <td className="px-6 py-4 font-mono font-semibold text-[#f0f4ff]">
                      {formatCurrency(transfer.amount)}
                    </td>
                    <td className="px-6 py-4 font-medium text-[#f0f4ff]">{transfer.senderName}</td>
                    <td className="px-6 py-4">
                      <StatusBadge label={transferDisplayStatus(transfer.status)} />
                    </td>
                    <td className="px-6 py-4 text-[#8892a4]">{formatDateTime(transfer.receivedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <SectionHeader title="Account History" copy="Name and KYC changes recorded in OhFour." />
        {history.length === 0 ? (
          <div className="p-5">
            <EmptyState>No account history recorded.</EmptyState>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            {history.map((event) => (
              <HistoryItem key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function HistoryItem({ event }: { event: IdentityEvent }) {
  const formatted = formatHistoryEvent(event);

  return (
    <div className="relative border-l border-[rgba(255,255,255,0.08)] pl-5">
      <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-[#3b6ef8]" />
      <div className="flex flex-col justify-between gap-2 md:flex-row">
        <div>
          <p className="text-sm font-medium text-[#f0f4ff]">{formatted.title}</p>
          <p className="mt-1 text-sm text-[#8892a4]">{formatted.description}</p>
          {event.reason ? <p className="mt-1 text-xs text-[#8892a4]">Reason: {event.reason}</p> : null}
        </div>
        <p className="text-xs text-[#8892a4]">{formatDateTime(event.createdAt)}</p>
      </div>
    </div>
  );
}

function formatHistoryEvent(event: IdentityEvent) {
  const previous = parseEventValue(event.previousValue);
  const next = parseEventValue(event.newValue);

  if (event.type === "created") {
    const name = next.name ?? "this retailer";
    const tier = next.kycTier ? `, KYC Tier ${next.kycTier}` : "";
    return {
      title: "Retailer created",
      description: `Created ${name}${tier}.`,
    };
  }

  if (event.type === "renamed") {
    return {
      title: "Retailer renamed",
      description: `Changed name from ${previous.name ?? "previous name"} to ${next.name ?? "new name"}.`,
    };
  }

  if (event.type === "kyc_tier_changed") {
    return {
      title: "KYC tier changed",
      description: `Changed from Tier ${previous.kycTier ?? "unknown"} to Tier ${next.kycTier ?? "unknown"}.`,
    };
  }

  if (event.type === "closed") {
    return {
      title: "Retailer closed",
      description: "Closed this retailer account.",
    };
  }

  return {
    title: event.type.replaceAll("_", " "),
    description: describeGenericChange(previous, next),
  };
}

function parseEventValue(value: string | null) {
  if (!value) return {} as { name?: string; kycTier?: number; value?: string };

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : undefined,
      kycTier: typeof parsed.kycTier === "number" ? parsed.kycTier : undefined,
      value,
    };
  } catch {
    return { value };
  }
}

function describeGenericChange(
  previous: { name?: string; kycTier?: number; value?: string },
  next: { name?: string; kycTier?: number; value?: string }
) {
  const oldValue = previous.name ?? previous.kycTier ?? previous.value ?? "empty";
  const newValue = next.name ?? next.kycTier ?? next.value ?? "empty";
  return `Changed from ${oldValue} to ${newValue}.`;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#8892a4]">{label}</p>
      <p className="mt-4 break-words font-mono text-xl font-semibold text-[#f0f4ff] sm:text-2xl">{value}</p>
    </div>
  );
}

function SectionHeader({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="border-b border-[rgba(255,255,255,0.04)] px-4 py-5 sm:px-6">
      <h2 className="text-sm font-semibold text-[#f0f4ff]">{title}</h2>
      <p className="mt-1 text-sm text-[#8892a4]">{copy}</p>
    </div>
  );
}
