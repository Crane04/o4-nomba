import { distance } from "fastest-levenshtein";
import type {
  ExpectedPaymentCandidate,
  ScoredMatch,
  TransferInput,
} from "./matchingEngine.types";

const WEIGHTS = {
  amount: 0.4,
  name: 0.3,
  timing: 0.15,
  history: 0.15,
};

export function scoreAmount(transferAmount: number, expectedAmount: number): number {
  if (expectedAmount <= 0) return 0;
  const diff = Math.abs(transferAmount - expectedAmount);
  const relativeDiff = diff / expectedAmount;
  const score = Math.max(0, 1 - relativeDiff * 3);
  return Math.min(1, score);
}

export function scoreName(senderName: string, knownNames: string[]): number {
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const a = normalize(senderName);

  let best = 0;
  for (const candidate of knownNames) {
    const b = normalize(candidate);
    if (!a || !b) continue;
    const dist = distance(a, b);
    const maxLen = Math.max(a.length, b.length);
    const similarity = maxLen === 0 ? 1 : 1 - dist / maxLen;
    if (similarity > best) best = similarity;
  }
  return Math.max(0, best);
}

export function scoreTiming(receivedAt: Date, dueDate: Date | null): number {
  if (!dueDate) return 0.5;
  const daysDiff = Math.abs((receivedAt.getTime() - dueDate.getTime()) / 86_400_000);
  const score = Math.max(0, 1 - daysDiff / 30);
  return Math.min(1, score);
}

export function scoreHistory(senderName: string, priorSenderNames: string[]): number {
  if (priorSenderNames.length === 0) return 0.3;
  const normalize = (s: string) => s.trim().toLowerCase();
  return priorSenderNames.some((n) => normalize(n) === normalize(senderName)) ? 1 : 0.2;
}

export function buildReasoning(scores: {
  amountScore: number;
  nameScore: number;
  timingScore: number;
  historyScore: number;
  label: string;
}): string {
  const parts: string[] = [];

  if (scores.amountScore >= 0.95) parts.push("amount matches exactly");
  else if (scores.amountScore >= 0.6) parts.push("amount is close but not exact");
  else parts.push("amount differs significantly");

  if (scores.nameScore >= 0.95) parts.push("sender name matches");
  else if (scores.nameScore >= 0.7) parts.push("sender name is a close/partial match");
  else parts.push("sender name does not closely match");

  if (scores.historyScore >= 0.9) parts.push("this sender has paid this identity before");
  else if (scores.historyScore <= 0.25) parts.push("no prior payments from this sender");

  if (scores.timingScore >= 0.8) parts.push("received close to the due date");

  return `Matched against "${scores.label}": ${parts.join(", ")}.`;
}

export function scoreTransferAgainstCandidates(
  transfer: TransferInput,
  candidates: ExpectedPaymentCandidate[]
): ScoredMatch[] {
  const results = candidates.map((candidate) => {
    const amountScore = scoreAmount(transfer.amount, candidate.expectedAmount);
    const nameScore = scoreName(transfer.senderName, [
      candidate.identityCurrentName,
      ...candidate.identityKnownNames,
    ]);
    const timingScore = scoreTiming(transfer.receivedAt, candidate.dueDate);
    const historyScore = scoreHistory(transfer.senderName, candidate.priorSenderNames);

    const confidenceScore =
      amountScore * WEIGHTS.amount +
      nameScore * WEIGHTS.name +
      timingScore * WEIGHTS.timing +
      historyScore * WEIGHTS.history;

    return {
      expectedPaymentId: candidate.id,
      confidenceScore: Math.round(confidenceScore * 1000) / 1000,
      amountScore: Math.round(amountScore * 1000) / 1000,
      nameScore: Math.round(nameScore * 1000) / 1000,
      timingScore: Math.round(timingScore * 1000) / 1000,
      historyScore: Math.round(historyScore * 1000) / 1000,
      reasoning: buildReasoning({ amountScore, nameScore, timingScore, historyScore, label: candidate.label }),
    };
  });

  return results.sort((a, b) => b.confidenceScore - a.confidenceScore);
}
