import { useEffect, useMemo, useState } from "react";
import { formatCurrency, formatDateTime, isCollectedStatus, transferDisplayStatus } from "../lib/collections";
import { usePortalData } from "../lib/portalData";
import { EmptyState, ErrorState, LoadingState, Metric, StatusBadge } from "../lib/ui";

export default function TransfersPage() {
  const { transfers: transfersState, loadTransfers } = usePortalData();
  const { data: transfers, loading, error } = transfersState;
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadTransfers();
  }, [loadTransfers]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return transfers;

    return transfers.filter((transfer) => {
      const identityName = transfer.virtualAccount.identity.currentName.toLowerCase();
      return (
        identityName.includes(term) ||
        transfer.senderName.toLowerCase().includes(term) ||
        transfer.virtualAccount.accountNumber.includes(term) ||
        transfer.reference?.toLowerCase().includes(term)
      );
    });
  }, [query, transfers]);

  const summary = useMemo(() => {
    const total = transfers.reduce((sum, transfer) => sum + transfer.amount, 0);
    const collected = transfers
      .filter((transfer) => isCollectedStatus(transfer.status))
      .reduce((sum, transfer) => sum + transfer.amount, 0);
    const underReview = transfers.filter((transfer) => transfer.status === "under_review").length;

    return { count: transfers.length, total, collected, underReview };
  }, [transfers]);

  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="page-title">Transfers</h1>
          <p className="page-copy">
            All received transfers across every dedicated collection account.
          </p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="input-field w-full md:w-[320px]"
          placeholder="Search transfers"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total Transfers" value={String(summary.count)} />
        <Metric label="Total Received" value={formatCurrency(summary.total)} />
        <Metric label="Reconciled" value={formatCurrency(summary.collected)} />
        <Metric label="Under Review" value={String(summary.underReview)} />
      </section>

      <section className="panel">
        {loading ? (
          <div className="p-5">
            <LoadingState label="Loading transfers..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState>No transfers found.</EmptyState>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-4 font-semibold sm:px-6">Customer</th>
                  <th className="px-4 py-4 font-semibold sm:px-6">Account</th>
                  <th className="px-4 py-4 font-semibold sm:px-6">Sender</th>
                  <th className="px-4 py-4 font-semibold sm:px-6">Amount</th>
                  <th className="px-4 py-4 font-semibold sm:px-6">Status</th>
                  <th className="px-4 py-4 font-semibold sm:px-6">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((transfer) => (
                  <tr
                    key={transfer.id}
                    className="border-b border-[rgba(255,255,255,0.04)] odd:bg-[rgba(255,255,255,0.01)] last:border-b-0"
                  >
                    <td className="px-4 py-4 font-medium text-[#f0f4ff] sm:px-6">
                      {transfer.virtualAccount.identity.currentName}
                    </td>
                    <td className="px-4 py-4 font-mono font-semibold text-[#f0f4ff] sm:px-6">
                      {transfer.virtualAccount.accountNumber}
                    </td>
                    <td className="px-4 py-4 text-[#f0f4ff] sm:px-6">{transfer.senderName}</td>
                    <td className="px-4 py-4 font-mono font-semibold text-[#f0f4ff] sm:px-6">
                      {formatCurrency(transfer.amount)}
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <StatusBadge label={transferDisplayStatus(transfer.status)} />
                    </td>
                    <td className="px-4 py-4 text-[#8892a4] sm:px-6">{formatDateTime(transfer.receivedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
