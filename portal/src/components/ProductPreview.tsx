import { ProductPreviewMetric } from "./ProductPreviewMetric";
import { StatusBadge } from "../lib/ui";

const rows = [
  ["Amina Stores", "NGN 185,000", "Matched"],
  ["Riverside Pharmacy", "NGN 72,500", "Review"],
  ["Prime Mart", "NGN 310,000", "Matched"],
];

export function ProductPreview() {
  return (
    <div className="mx-auto overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#151b2a] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="flex items-center border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
          <span className="h-3 w-3 rounded-full bg-[#f59e0b]" />
          <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
        </div>
        <div className="mx-auto rounded-lg bg-[#0d1117] px-5 py-1.5 font-mono text-xs font-semibold text-[#8892a4]">
          app.ohfour.co
        </div>
      </div>

      <div className="grid min-h-[360px] md:grid-cols-[240px_1fr]">
        <aside className="hidden border-r border-[rgba(255,255,255,0.06)] p-5 md:block">
          <div className="rounded-lg bg-[#17264a] px-4 py-3 text-sm font-semibold text-[#8fb5ff]">Collections</div>
          {["Dashboard", "Retailers", "Invoices", "Review"].map((item) => (
            <div key={item} className="mt-4 flex items-center gap-3 px-4 text-sm font-medium text-[#8892a4]">
              <span className="h-4 w-4 rounded bg-[#20293c]" />
              {item}
            </div>
          ))}
        </aside>

        <section className="p-5 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-3">
            <ProductPreviewMetric label="Invoiced" value="NGN 8.4m" />
            <ProductPreviewMetric label="Collected" value="NGN 6.9m" />
            <ProductPreviewMetric label="Review" value="7" />
          </div>
          <div className="mt-7 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0d1117]">
            <div className="border-b border-[rgba(255,255,255,0.06)] px-4 py-3 text-left text-sm font-semibold text-[#f0f4ff]">
              Incoming transfers
            </div>
            {rows.map(([name, amount, status]) => (
              <div
                key={name}
                className="grid grid-cols-[1fr_auto] gap-4 border-b border-[rgba(255,255,255,0.05)] px-4 py-4 text-left last:border-b-0 sm:grid-cols-[1fr_150px_90px]"
              >
                <p className="min-w-0 truncate text-sm font-semibold text-[#f0f4ff]">{name}</p>
                <p className="font-mono text-sm font-semibold text-[#f0f4ff]">{amount}</p>
                <StatusBadge label={status} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
