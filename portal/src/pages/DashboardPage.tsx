import { useEffect, useMemo } from "react";
import {
  formatCurrency,
  formatDateTime,
  isCollectedStatus,
  transferDisplayStatus,
} from "../lib/collections";
import { usePortalData } from "../lib/portalData";
import { EmptyState, ErrorState, LoadingState, Metric, StatusBadge } from "../lib/ui";

export default function DashboardPage() {
  const { collections, loadCollections } = usePortalData();
  const { data, loading, error } = collections;

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const summary = useMemo(() => {
    const totalInvoiced = data?.expectedPayments.reduce((sum, payment) => sum + payment.expectedAmount, 0) ?? 0;
    const amountCollected =
      data?.transfers
        .filter((transfer) => isCollectedStatus(transfer.status))
        .reduce((sum, transfer) => sum + transfer.amount, 0) ?? 0;

    return {
      totalRetailers: data?.identities.length ?? 0,
      totalInvoiced,
      amountCollected,
      outstanding: Math.max(totalInvoiced - amountCollected, 0),
    };
  }, [data]);

  const recentTransfers = useMemo(
    () =>
      [...(data?.transfers ?? [])]
        .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
        .slice(0, 8),
    [data]
  );

  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="page-title">Collections Overview</h1>
        <p className="page-copy">
          Monitor retailer invoices, dedicated virtual accounts, and incoming transfers
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total Retailers" value={String(summary.totalRetailers)} tone="blue" />
        <Metric label="Total Invoiced" value={formatCurrency(summary.totalInvoiced)} tone="blue" />
        <Metric label="Amount Collected" value={formatCurrency(summary.amountCollected)} tone="green" />
        <Metric label="Outstanding" value={formatCurrency(summary.outstanding)} tone="amber" />
      </section>

      <section className="panel">
        <div className="border-b border-[rgba(255,255,255,0.04)] px-6 py-5">
          <h2 className="text-sm font-semibold text-[#f0f4ff]">Recent Activity</h2>
        </div>

        {loading ? (
          <div className="p-6">
            <LoadingState label="Loading collection activity..." />
          </div>
        ) : recentTransfers.length === 0 ? (
          <div className="p-6">
            <EmptyState>No transfer activity yet.</EmptyState>
          </div>
        ) : (
          <div>
            {recentTransfers.map((transfer) => (
              <div
                key={transfer.id}
                className="grid gap-3 border-b border-[rgba(255,255,255,0.04)] px-4 py-4 last:border-b-0 sm:px-6 md:grid-cols-[1fr_160px_120px_150px] md:items-center"
              >
                <div>
                  <p className="text-sm font-medium text-[#f0f4ff]">{transfer.account.identity.currentName}</p>
                  <p className="mt-1 font-mono text-xs text-[#8892a4]">{transfer.account.accountNumber}</p>
                </div>
                <p className="font-mono text-sm font-semibold text-[#f0f4ff]">{formatCurrency(transfer.amount)}</p>
                <StatusBadge label={transferDisplayStatus(transfer.status)} />
                <p className="text-sm text-[#8892a4]">{formatDateTime(transfer.receivedAt)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
