import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

  if (loading) {
    return (
      <div className="panel p-6">
        <div className="h-4 w-52 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-36 animate-pulse rounded-md bg-slate-100" />
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
        Identity not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm font-bold text-emerald-700 hover:text-emerald-800">
        Back to accounts
      </Link>

      <section className="panel p-6">
        <p className="page-kicker">Identity Profile</p>
        <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{identity.currentName}</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              {identity.virtualAccounts?.length ?? 0} linked account(s)
            </p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
              KYC Tier {identity.kycTier}
            </span>
            <span
              className={`status-pill ${
                identity.status === "active"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {identity.status}
            </span>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="page-kicker">Audit Trail</p>
            <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-950">Identity Events</h2>
          </div>
          <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm">
            {history.length} event(s)
          </span>
        </div>

        <ol className="relative ml-3 border-l border-slate-200">
          {history.map((event) => (
            <li key={event.id} className="mb-5 ml-6">
              <span className="absolute -left-1.5 mt-2 h-3 w-3 rounded-full border-2 border-white bg-emerald-600" />
              <div className="panel p-4">
                <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                  <span className="text-sm font-bold text-slate-950">
                    {EVENT_LABELS[event.type] ?? event.type}
                  </span>
                  <time className="text-xs font-medium text-slate-500">
                    {new Date(event.createdAt).toLocaleString()}
                  </time>
                </div>
                <div className="mt-3 grid gap-2 text-xs font-medium text-slate-600 md:grid-cols-2">
                  {event.previousValue && (
                    <p className="rounded-md bg-slate-50 px-3 py-2">From: {formatValue(event.previousValue)}</p>
                  )}
                  {event.newValue && (
                    <p className="rounded-md bg-emerald-50 px-3 py-2 text-emerald-800">
                      To: {formatValue(event.newValue)}
                    </p>
                  )}
                </div>
                {event.reason && (
                  <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                    {event.reason}
                  </p>
                )}
              </div>
            </li>
          ))}
          {history.length === 0 && <p className="text-sm font-medium text-slate-400">No events yet.</p>}
        </ol>
      </section>
    </div>
  );
}
