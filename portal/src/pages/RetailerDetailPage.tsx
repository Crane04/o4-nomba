import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { HistoryItem } from "../components/HistoryItem";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getBusinessType,
  isCollectedStatus,
  transferDisplayStatus,
} from "../lib/collections";
import { usePortalData, useRetailerDetail } from "../lib/portalData";
import { Button, EmptyState, ErrorState, LoadingState, Metric, SectionHeader, StatusBadge } from "../lib/ui";

export default function RetailerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { createInvoice: createInvoiceRecord, loadRetailerDetail } = usePortalData();
  const detail = useRetailerDetail(id);
  const [copied, setCopied] = useState(false);
  const [invoiceLabel, setInvoiceLabel] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDueDate, setInvoiceDueDate] = useState("");
  const [invoiceError, setInvoiceError] = useState("");
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  useEffect(() => {
    if (id) loadRetailerDetail(id);
  }, [id, loadRetailerDetail]);

  const { identity, account, expectedPayments, transfers, history } = detail?.data ?? {
    identity: null,
    account: null,
    expectedPayments: [],
    transfers: [],
    history: [],
  };

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
      await createInvoiceRecord({
        identityId: id,
        expectedAmount: Number(invoiceAmount),
        label: invoiceLabel,
        dueDate: invoiceDueDate || undefined,
      });
      setInvoiceLabel("");
      setInvoiceAmount("");
      setInvoiceDueDate("");
    } catch (err) {
      setInvoiceError(err instanceof Error ? err.message : "Could not create invoice");
    } finally {
      setCreatingInvoice(false);
    }
  };

  if (detail?.error) return <ErrorState message={detail.error} />;
  if (detail?.loading || !identity) return <LoadingState label="Loading retailer profile..." />;

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
          <Button
            type="button"
            variant="outline"
            onClick={copyAccount}
            disabled={!account?.accountNumber}
            className="w-full sm:w-auto"
          >
            {copied ? "Copied" : "Copy"}
          </Button>
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
          <Button
            type="submit"
            disabled={creatingInvoice}
            className="justify-center"
          >
            {creatingInvoice ? "Creating..." : "Create invoice"}
          </Button>
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
