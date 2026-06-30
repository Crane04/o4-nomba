import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, type IdentityEvent } from "../lib/api.js";

const EVENT_LABELS: Record<string, string> = {
  created: "Identity created",
  renamed: "Renamed",
  kyc_tier_changed: "KYC tier changed",
  closed: "Account closed",
  reopened: "Account reopened",
};

function formatValue(raw: string | null): string {
  if (!raw) return "—";
  try {
    const parsed = JSON.parse(raw);
    return Object.entries(parsed)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
  } catch {
    return raw;
  }
}

export default function IdentityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [identity, setIdentity] = useState<any>(null);
  const [history, setHistory] = useState<IdentityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.getIdentity(id), api.getIdentityHistory(id)])
      .then(([i, h]) => {
        setIdentity(i);
        setHistory(h);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (!identity) return <p className="text-red-600">Identity not found.</p>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">{identity.currentName}</h1>
      <p className="text-slate-500 text-sm mb-6">
        KYC Tier {identity.kycTier} · {identity.virtualAccounts?.length ?? 0} linked account(s) ·{" "}
        {identity.status}
      </p>

      <h2 className="text-sm font-semibold text-slate-700 mb-2">Identity Event Log</h2>
      <p className="text-slate-400 text-xs mb-4">
        Every rename, tier change, and closure is an immutable event — nothing is overwritten in place.
      </p>

      <ol className="relative border-l border-slate-200 ml-3">
        {history.map((event) => (
          <li key={event.id} className="mb-6 ml-6">
            <span className="absolute -left-1.5 w-3 h-3 bg-slate-900 rounded-full mt-1.5" />
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{EVENT_LABELS[event.type] ?? event.type}</span>
                <time className="text-xs text-slate-400">
                  {new Date(event.createdAt).toLocaleString()}
                </time>
              </div>
              {event.previousValue && (
                <p className="text-xs text-slate-500 mt-1">From: {formatValue(event.previousValue)}</p>
              )}
              {event.newValue && (
                <p className="text-xs text-slate-500">To: {formatValue(event.newValue)}</p>
              )}
              {event.reason && <p className="text-xs text-slate-400 mt-1 italic">"{event.reason}"</p>}
            </div>
          </li>
        ))}
        {history.length === 0 && <p className="text-slate-400 text-sm">No events yet.</p>}
      </ol>
    </div>
  );
}
