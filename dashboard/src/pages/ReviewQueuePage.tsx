import { useEffect, useState } from "react";
import { api, type TransferWithMatches } from "../lib/api.js";

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 text-slate-500">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-slate-600 font-mono">{pct}%</span>
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

  if (loading) return <p className="text-slate-500">Loading queue…</p>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Misdirected Payment Review Queue</h1>
      <p className="text-slate-500 text-sm mb-6">
        Transfers that didn't clear the auto-match confidence threshold. Each candidate below shows
        its score breakdown and reasoning — resolve to confirm a match, or reject to rule it out.
      </p>

      {queue.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-400">
          Queue is empty — everything auto-matched, or no transfers yet.
        </div>
      )}

      <div className="space-y-4">
        {queue.map((transfer) => (
          <div key={transfer.id} className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-mono font-semibold">₦{transfer.amount.toLocaleString()}</span>
                <span className="text-slate-400 mx-2">from</span>
                <span className="font-medium">{transfer.senderName}</span>
              </div>
              <time className="text-xs text-slate-400">
                {new Date(transfer.receivedAt).toLocaleString()}
              </time>
            </div>

            <div className="space-y-3">
              {transfer.matches.map((match) => (
                <div key={match.id} className="border border-slate-100 rounded-md p-3 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-sm">{match.expectedPayment.label}</span>
                      <span className="text-slate-400 text-xs ml-2">
                        ({match.expectedPayment.identity.currentName}, expected ₦
                        {match.expectedPayment.expectedAmount.toLocaleString()})
                      </span>
                    </div>
                    <span className="font-mono text-sm font-semibold">
                      {Math.round(match.confidenceScore * 100)}% confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-2">
                    <ScoreBar label="Amount" value={match.amountScore} />
                    <ScoreBar label="Name" value={match.nameScore} />
                    <ScoreBar label="Timing" value={match.timingScore} />
                    <ScoreBar label="History" value={match.historyScore} />
                  </div>

                  <p className="text-xs text-slate-500 italic mb-3">{match.reasoning}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(match.id)}
                      disabled={actionInFlight === match.id}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50"
                    >
                      Confirm match
                    </button>
                    <button
                      onClick={() => handleReject(match.id)}
                      disabled={actionInFlight === match.id}
                      className="px-3 py-1.5 text-xs font-medium border border-slate-300 text-slate-600 rounded-md hover:bg-slate-100 disabled:opacity-50"
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
