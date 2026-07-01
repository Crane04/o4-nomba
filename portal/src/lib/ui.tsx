import { ReactNode } from "react";

export function StatusBadge({ label }: { label: string }) {
  const displayLabel =
    label === "Under Review" ? "Review" : label === "Outstanding" ? "Due" : label;
  const tone =
    label === "Cleared" || label === "Matched"
      ? "bg-[#1a3a2a] text-[#4ade80]"
      : label === "Partial" || label === "Under Review"
        ? "bg-[#3a2a0a] text-[#fbbf24]"
        : label === "Outstanding"
          ? "bg-[#2a1a1a] text-[#f87171]"
          : "bg-[#1e2535] text-[#8892a4]";

  return (
    <span className={`status-pill ${tone}`} title={label}>
      {displayLabel}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-[rgba(255,255,255,0.08)] bg-[#111827] px-4 py-10 text-center text-sm text-[#8892a4]">
      {children}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-[#f87171]/20 bg-[#2a1a1a] px-4 py-3 text-sm font-medium text-[#f87171]">
      {message}
    </div>
  );
}
