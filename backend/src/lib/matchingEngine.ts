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
  const a = normalizeName(senderName);

  let best = 0;
  for (const candidate of knownNames) {
    const b = normalizeName(candidate);
    if (!a || !b) continue;

    const similarity = Math.max(scoreNameStringSimilarity(a, b), scoreNameTokenSimilarity(a, b));
    best = Math.max(best, similarity);
  }

  return Math.min(1, Math.max(0, best));
}

export function scoreTiming(receivedAt: Date, dueDate: Date | null): number {
  if (!dueDate) return 0.5;
  const daysDiff = Math.abs((receivedAt.getTime() - dueDate.getTime()) / 86_400_000);
  const score = Math.max(0, 1 - daysDiff / 30);
  return Math.min(1, score);
}

export function scoreHistory(senderName: string, priorSenderNames: string[]): number {
  if (priorSenderNames.length === 0) return 0.3;
  return priorSenderNames.some((n) => scoreName(senderName, [n]) >= 0.9) ? 1 : 0.2;
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

function normalizeName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ");
}

function scoreNameStringSimilarity(a: string, b: string) {
  const dist = distance(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : 1 - dist / maxLen;
}

function scoreNameTokenSimilarity(a: string, b: string) {
  const aTokens = tokenizeName(a);
  const bTokens = tokenizeName(b);
  if (aTokens.length === 0 || bTokens.length === 0) return 0;
  if (Math.min(aTokens.length, bTokens.length) < 2) return 0;

  let matched = 0;
  let matchedScore = 0;
  const remaining = [...bTokens];

  for (const token of aTokens) {
    const matches = remaining
      .map((candidate, index) => ({ index, score: scoreNameStringSimilarity(token, candidate) }))
      .filter(({ score }) => score >= 0.8)
      .sort((left, right) => right.score - left.score);
    const match = matches[0];
    if (!match) continue;

    matched += 1;
    matchedScore += match.score;
    remaining.splice(match.index, 1);
  }

  const smallerTokenCount = Math.min(aTokens.length, bTokens.length);
  const largerTokenCount = Math.max(aTokens.length, bTokens.length);
  const coverage = matched / smallerTokenCount;
  const completeness = matched / largerTokenCount;

  if (matched >= 2 && coverage >= 0.66) {
    return Math.max(0.9, matchedScore / largerTokenCount);
  }

  return completeness;
}

function tokenizeName(name: string) {
  return name.split(" ").filter((token) => token.length >= 2);
}
