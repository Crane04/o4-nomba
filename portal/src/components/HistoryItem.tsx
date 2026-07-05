import { formatDateTime } from "../lib/collections";
import type { IdentityEvent } from "../lib/types";

export function HistoryItem({ event }: { event: IdentityEvent }) {
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
