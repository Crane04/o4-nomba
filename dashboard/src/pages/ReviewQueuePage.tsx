import { useEffect, useState } from "react";
import { api, type TransferWithMatches } from "../lib/api.js";

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-16 font-semibold text-slate-500">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right font-mono font-semibold text-slate-700">{pct}%</span>
    </div>
  );
}

export default function ReviewQueuePage() {
  const [queue, setQueue] = useState<TransferWithMatches[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInFlight, setActionInFlight] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .getReviewQueue()
      .then(setQueue)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleResolve = async (matchId: string) => {
    setActionInFlight(matchId);
    try {
      await api.resolveMatch(matchId, "ops_demo_user");
      load();
    } finally {
      setActionInFlight(null);
    }
  };

  const handleReject = async (matchId: string) => {
    setActionInFlight(matchId);
    try {
      await api.rejectMatch(matchId, "ops_demo_user");
      load();
    } finally {
      setActionInFlight(null);
    }
  };

  const candidateCount = queue.reduce((total, transfer) => total + transfer.matches.length, 0);

  if (loading) {
    return (
      <div className="panel p-6">
        <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-40 animate-pulse rounded-md bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="page-kicker">Exception Handling</p>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="page-title">Review Queue</h1>
            <p className="page-copy">Transfers waiting for an operator decision.</p>
          </div>
          <div className="flex gap-3">
            <div className="metric min-w-32 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Transfers</p>
              <p className="mt-1 text-2xl font-bold">{queue.length}</p>
            </div>
            <div className="metric min-w-32 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Candidates</p>
              <p className="mt-1 text-2xl font-bold">{candidateCount}</p>
            </div>
          </div>
        </div>
      </section>

      {queue.length === 0 && (
        <div className="panel p-10 text-center">
          <p className="text-sm font-semibold text-slate-500">Queue is empty.</p>
        </div>
      )}

      <div className="space-y-4">
        {queue.map((transfer) => (
          <div key={transfer.id} className="panel">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4 md:flex-row md:items-center">
              <div>
                <p className="font-mono text-2xl font-bold tracking-tight">
                  ₦{transfer.amount.toLocaleString()}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-600">{transfer.senderName}</p>
              </div>
              <div className="text-left md:text-right">
                <span className="status-pill bg-amber-100 text-amber-800">{transfer.status}</span>
                <time className="mt-2 block text-xs font-medium text-slate-500">
                  {new Date(transfer.receivedAt).toLocaleString()}
                </time>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50/70 p-4">
              {transfer.matches.map((match) => (
                <div key={match.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex flex-col justify-between gap-2 md:flex-row md:items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-950">{match.expectedPayment.label}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {match.expectedPayment.identity.currentName} · expected ₦
                        {match.expectedPayment.expectedAmount.toLocaleString()}
                      </p>
                    </div>
                    <span className="rounded-md bg-slate-950 px-2.5 py-1 font-mono text-sm font-bold text-white">
                      {Math.round(match.confidenceScore * 100)}% confidence
                    </span>
                  </div>

                  <div className="mb-3 grid gap-x-6 gap-y-2 md:grid-cols-2">
                    <ScoreBar label="Amount" value={match.amountScore} />
                    <ScoreBar label="Name" value={match.nameScore} />
                    <ScoreBar label="Timing" value={match.timingScore} />
                    <ScoreBar label="History" value={match.historyScore} />
                  </div>

                  <p className="mb-4 rounded-md bg-slate-50 px-3 py-2 text-xs font-medium leading-5 text-slate-600">
                    {match.reasoning}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(match.id)}
                      disabled={actionInFlight === match.id}
                      className="rounded-md bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                    >
                      Confirm match
                    </button>
                    <button
                      onClick={() => handleReject(match.id)}
                      disabled={actionInFlight === match.id}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                      Not a match
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
