import { ComponentPropsWithoutRef, ReactNode } from "react";
import { Link } from "react-router-dom";
import type { ButtonLinkProps, ButtonProps, ButtonVariant } from "./types";

function buttonClassName(variant: ButtonVariant, className = "") {
  const base = variant === "primary" ? "primary-button" : "outline-button";
  return `${base} inline-flex items-center ${className}`.trim();
}

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClassName(variant, className)} {...props} />;
}

export function ButtonLink({ variant = "primary", className = "", ...props }: ButtonLinkProps) {
  return <Link className={buttonClassName(variant, className)} {...props} />;
}

export function IconButton({ className = "", type = "button", ...props }: ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type={type}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[rgba(255,255,255,0.08)] text-[#8892a4] transition-colors hover:text-[#f0f4ff] ${className}`.trim()}
      {...props}
    />
  );
}

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

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div
      className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111827] px-4 py-10 text-center text-sm font-medium text-[#8892a4]"
      role="status"
      aria-live="polite"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-[rgba(255,255,255,0.12)] border-t-[#3b6ef8]" />
      <span>{label}</span>
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

export function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "blue" | "green" | "amber";
}) {
  const dot = tone === "green" ? "bg-[#4ade80]" : tone === "amber" ? "bg-[#fbbf24]" : "bg-[#3b6ef8]";

  return (
    <div className="metric relative">
      {tone ? <span className={`absolute right-6 top-6 h-2.5 w-2.5 rounded-full ${dot}`} /> : null}
      <p className="text-xs font-semibold uppercase tracking-widest text-[#8892a4]">{label}</p>
      <p className="mt-4 break-words font-mono text-2xl font-semibold text-[#f0f4ff] sm:text-3xl">{value}</p>
    </div>
  );
}

export function SectionHeader({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="border-b border-[rgba(255,255,255,0.04)] px-4 py-5 sm:px-6">
      <h2 className="text-sm font-semibold text-[#f0f4ff]">{title}</h2>
      <p className="mt-1 text-sm text-[#8892a4]">{copy}</p>
    </div>
  );
}
