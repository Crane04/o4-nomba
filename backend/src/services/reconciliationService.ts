import { prisma } from "../lib/prisma.js";
import { getKnownNames } from "./identityService.js";
import { scoreTransferAgainstCandidates, type ExpectedPaymentCandidate } from "../helpers/matchingEngine.js";

const AUTO_MATCH_THRESHOLD = Number(process.env.AUTO_MATCH_THRESHOLD ?? 0.85);

export async function reconcileTransfer(transferId: string) {
  const transfer = await prisma.transfer.findUniqueOrThrow({ where: { id: transferId } });

  const expectedPayments = await prisma.expectedPayment.findMany({
    where: { status: { in: ["pending", "partially_matched"] } },
    include: { identity: true },
  });

  if (expectedPayments.length === 0) {
    await prisma.transfer.update({ where: { id: transferId }, data: { status: "under_review" } });
    return { transfer, matches: [], autoMatched: false };
  }

  const candidates: ExpectedPaymentCandidate[] = await Promise.all(
    expectedPayments.map(async (ep) => {
      const knownNames = await getKnownNames(ep.identityId);
      const priorTransfers = await prisma.transfer.findMany({
        where: {
          status: { in: ["matched", "resolved"] },
          virtualAccount: { identityId: ep.identityId },
        },
        select: { senderName: true },
        take: 20,
      });

      return {
        id: ep.id,
        expectedAmount: ep.expectedAmount,
        label: ep.label,
        dueDate: ep.dueDate,
        identityCurrentName: ep.identity.currentName,
        identityKnownNames: knownNames,
        priorSenderNames: priorTransfers.map((t) => t.senderName),
      };
    })
  );

  const scored = scoreTransferAgainstCandidates(
    { amount: transfer.amount, senderName: transfer.senderName, receivedAt: transfer.receivedAt },
    candidates
  );

  const persisted = await Promise.all(
    scored.map((s) =>
      prisma.reconciliationMatch.create({
        data: {
          transferId: transfer.id,
          expectedPaymentId: s.expectedPaymentId,
          confidenceScore: s.confidenceScore,
          amountScore: s.amountScore,
          nameScore: s.nameScore,
          timingScore: s.timingScore,
          historyScore: s.historyScore,
          reasoning: s.reasoning,
          decision: "pending",
        },
      })
    )
  );

  const top = scored[0];
  const autoMatched = top.confidenceScore >= AUTO_MATCH_THRESHOLD;

  if (autoMatched) {
    const winningMatch = persisted.find((m) => m.expectedPaymentId === top.expectedPaymentId)!;
    await prisma.$transaction([
      prisma.reconciliationMatch.update({
        where: { id: winningMatch.id },
        data: { decision: "auto_matched", resolvedBy: "system", resolvedAt: new Date() },
      }),
      prisma.transfer.update({ where: { id: transfer.id }, data: { status: "matched" } }),
      prisma.expectedPayment.update({
        where: { id: top.expectedPaymentId },
        data: { status: "matched" },
      }),
    ]);
  } else {
    await prisma.transfer.update({ where: { id: transfer.id }, data: { status: "under_review" } });
  }

  return { transfer, matches: scored, autoMatched, threshold: AUTO_MATCH_THRESHOLD };
}

export async function resolveMatch(matchId: string, resolvedBy: string) {
  const match = await prisma.reconciliationMatch.findUniqueOrThrow({ where: { id: matchId } });

  return prisma.$transaction([
    prisma.reconciliationMatch.update({
      where: { id: matchId },
      data: { decision: "manual_resolved", resolvedBy, resolvedAt: new Date() },
    }),
    prisma.transfer.update({ where: { id: match.transferId }, data: { status: "resolved" } }),
    prisma.expectedPayment.update({
      where: { id: match.expectedPaymentId },
      data: { status: "matched" },
    }),
  ]);
}

export async function rejectMatch(matchId: string, resolvedBy: string) {
  return prisma.reconciliationMatch.update({
    where: { id: matchId },
    data: { decision: "rejected", resolvedBy, resolvedAt: new Date() },
  });
}

export async function getReviewQueue() {
  const transfers = await prisma.transfer.findMany({
    where: { status: "under_review" },
    include: {
      matches: {
        where: { decision: "pending" },
        orderBy: { confidenceScore: "desc" },
        include: { expectedPayment: { include: { identity: true } } },
      },
    },
    orderBy: { receivedAt: "desc" },
  });
  return transfers;
}
