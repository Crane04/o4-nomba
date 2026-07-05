import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import { formatCurrency, formatDateTime } from "../lib/collections";
import { usePortalData } from "../lib/portalData";
import { MiniScore } from "../components/MiniScore";
import { ScoreBar } from "../components/ScoreBar";
import { Button, EmptyState, ErrorState, LoadingState } from "../lib/ui";

export default function ReviewPage() {
  const { organization } = useAuth();
  const {
    reviewQueue,
    loadReviewQueue,
    resolveCandidate: resolveReviewCandidate,
    rejectCandidate: rejectReviewCandidate,
  } = usePortalData();
  const { data: transfers, loading, error } = reviewQueue;
  const [actionError, setActionError] = useState("");
  const [actingMatchId, setActingMatchId] = useState<string | null>(null);

  useEffect(() => {
    loadReviewQueue();
  }, [loadReviewQueue]);

  const resolveCandidate = async (matchId: string) => {
    await runMatchAction(matchId, () => resolveReviewCandidate(matchId, organization?.email ?? "portal"));
  };

  const rejectCandidate = async (matchId: string) => {
    await runMatchAction(matchId, () => rejectReviewCandidate(matchId, organization?.email ?? "portal"));
  };

  const runMatchAction = async (matchId: string, action: () => Promise<unknown>) => {
    setActionError("");
    setActingMatchId(matchId);

    try {
      await action();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not update match");
    } finally {
      setActingMatchId(null);
    }
  };

  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="page-title">Flagged Payments</h1>
        <p className="page-copy">
          Transfers OhFour could not automatically reconcile. Confirm or reject candidate matches here.
        </p>
        {actionError ? (
          <div className="mt-4 rounded-lg border border-[#f87171]/20 bg-[#2a1a1a] px-3 py-2 text-sm font-medium text-[#f87171]">
            {actionError}
          </div>
        ) : null}
      </section>

      <section className="space-y-6">
        {loading ? (
          <LoadingState label="Loading flagged payments..." />
        ) : transfers.length === 0 ? (
          <EmptyState>No flagged payments in the queue.</EmptyState>
        ) : (
          transfers.map((transfer) => (
            <article key={transfer.id} className="panel p-4 sm:p-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="font-mono text-3xl font-semibold text-[#f0f4ff]">{formatCurrency(transfer.amount)}</p>
                  <p className="mt-2 text-sm font-medium text-[#f0f4ff]">{transfer.senderName}</p>
                  <p className="mt-1 text-sm text-[#8892a4]">{formatDateTime(transfer.receivedAt)}</p>
                </div>
                <span className="status-pill bg-[#3a2a0a] text-[#fbbf24]" title="Under Review">
                  Review
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <p className="page-kicker">Candidate Matches</p>
                {transfer.matches?.length ? (
                  transfer.matches.map((match) => (
                    <div key={match.id} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111827] p-4">
                      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                      <div>
                          <p className="text-sm font-medium text-[#f0f4ff]">{match.expectedPayment.label}</p>
                          <p className="mt-1 text-sm text-[#8892a4]">{match.expectedPayment.identity.currentName}</p>
                        </div>
                        <p className="font-mono text-sm font-semibold text-[#f0f4ff]">
                          {formatCurrency(match.expectedPayment.expectedAmount)}
                        </p>
                      </div>

                      <ScoreBar label="Confidence" score={match.confidenceScore} />
                      <div className="mt-4 grid gap-3 md:grid-cols-4">
                        <MiniScore label="Amount" score={match.amountScore} />
                        <MiniScore label="Name" score={match.nameScore} />
                        <MiniScore label="Timing" score={match.timingScore} />
                        <MiniScore label="History" score={match.historyScore} />
                      </div>
                      <p className="mt-4 text-sm italic text-[#8892a4]">{match.reasoning}</p>
                      <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
                        <Button
                          type="button"
                          onClick={() => resolveCandidate(match.id)}
                          disabled={actingMatchId !== null}
                          className="justify-center"
                        >
                          {actingMatchId === match.id ? "Confirming..." : "Confirm match"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => rejectCandidate(match.id)}
                          disabled={actingMatchId !== null}
                          className="justify-center"
                        >
                          {actingMatchId === match.id ? "Updating..." : "Not a match"}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#8892a4]">No candidate match was returned.</p>
                )}
              </div>

              <p className="mt-6 text-sm text-[#8892a4]">Resolution is handled in this portal and logged to OhFour.</p>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
