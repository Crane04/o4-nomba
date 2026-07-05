import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import {
  collectedTotalFor,
  formatCurrency,
  getBusinessType,
  invoiceTotalFor,
  paymentStatus,
} from "../lib/collections";
import { usePortalData } from "../lib/portalData";
import { Button, EmptyState, ErrorState, LoadingState, StatusBadge } from "../lib/ui";

export default function RetailersPage() {
  const navigate = useNavigate();
  const { collections, createRetailer: createRetailerAccount, loadCollections } = usePortalData();
  const { data, loading, error } = collections;
  const [retailerName, setRetailerName] = useState("");
  const [kycTier, setKycTier] = useState(1);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const rows = useMemo(
    () =>
      (data?.accounts ?? []).map((account) => {
        const invoiced = invoiceTotalFor(account.identityId, data?.expectedPayments ?? []);
        const collected = collectedTotalFor(account.identityId, data?.transfers ?? []);
        const outstanding = Math.max(invoiced - collected, 0);

        return {
          account,
          outstanding,
          status: paymentStatus(invoiced, collected),
        };
      }),
    [data]
  );

  if (error) return <ErrorState message={error} />;

  const submitRetailer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError("");
    setCreating(true);

    try {
      const identity = await createRetailerAccount(retailerName, kycTier);
      setRetailerName("");
      setKycTier(1);
      navigate(`/retailers/${identity.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not create retailer account");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <div>
          <h1 className="page-title">Retailers</h1>
          <p className="page-copy">
            Dedicated collection accounts mapped to each retailer
          </p>
        </div>
      </section>

      <section className="panel p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-sm font-semibold text-[#f0f4ff]">Create Retailer Account</h2>
            <p className="mt-1 text-sm text-[#8892a4]">
              OhFour creates the retailer identity, then provisions a dedicated Nomba virtual account number.
            </p>
          </div>
          <form onSubmit={submitRetailer} className="grid w-full gap-3 md:grid-cols-[minmax(220px,1fr)_120px_170px] lg:w-auto">
            <input
              value={retailerName}
              onChange={(event) => setRetailerName(event.target.value)}
              className="input-field"
              placeholder="Retailer business name"
              required
            />
            <select
              value={kycTier}
              onChange={(event) => setKycTier(Number(event.target.value))}
              className="input-field"
            >
              <option value={1}>Tier 1</option>
              <option value={2}>Tier 2</option>
              <option value={3}>Tier 3</option>
            </select>
            <Button
              type="submit"
              disabled={creating}
              className="whitespace-nowrap"
            >
              {creating ? "Provisioning..." : "Create + provision"}
            </Button>
          </form>
        </div>
        {createError ? (
          <div className="mt-4 rounded-lg border border-[#f87171]/20 bg-[#2a1a1a] px-3 py-2 text-sm font-medium text-[#f87171]">
            {createError}
          </div>
        ) : null}
      </section>

      <section className="panel">
        {loading ? (
          <div className="p-5">
            <LoadingState label="Loading retailer accounts..." />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-5">
            <EmptyState>No retailer accounts found.</EmptyState>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-4 font-semibold sm:px-6">Retailer Name</th>
                  <th className="px-4 py-4 font-semibold sm:px-6">Business Type</th>
                  <th className="px-4 py-4 font-semibold sm:px-6">Account Number</th>
                  <th className="px-4 py-4 font-semibold sm:px-6">Total Outstanding</th>
                  <th className="px-4 py-4 font-semibold sm:px-6">Status</th>
                  <th className="w-12 px-4 py-4 sm:px-6" />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ account, outstanding, status }) => (
                  <tr
                    key={account.id}
                    onClick={() => navigate(`/retailers/${account.identityId}`)}
                    className="group cursor-pointer border-b border-[rgba(255,255,255,0.04)] transition-colors odd:bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(255,255,255,0.02)] last:border-b-0"
                  >
                    <td className="px-4 py-4 font-medium text-[#f0f4ff] sm:px-6">{account.identity.currentName}</td>
                    <td className="px-4 py-4 text-[#8892a4] sm:px-6">{getBusinessType(account.identityId)}</td>
                    <td className="px-4 py-4 font-mono font-semibold text-[#f0f4ff] sm:px-6">{account.accountNumber}</td>
                    <td className="px-4 py-4 font-mono font-semibold text-[#f0f4ff] sm:px-6">{formatCurrency(outstanding)}</td>
                    <td className="px-4 py-4 sm:px-6">
                      <StatusBadge label={status} />
                    </td>
                    <td className="px-4 py-4 text-right text-[#8892a4] opacity-0 transition-opacity group-hover:opacity-100 sm:px-6">
                      <FiChevronRight className="ml-auto h-4 w-4" />
                    </td>
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
