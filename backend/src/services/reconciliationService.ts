import { prisma } from "../lib/prisma";
import { getKnownNames } from "./identityService";
import { scoreTransferAgainstCandidates, type ExpectedPaymentCandidate } from "../helpers/matchingEngine";

const AUTO_MATCH_THRESHOLD = Number(process.env.AUTO_MATCH_THRESHOLD ?? 0.85);
const PARTIAL_SETTLEMENT_OVERPAY_TOLERANCE = 1.25;
const STRONG_IDENTITY_SCORE = 0.9;
const GOOD_TIMING_SCORE = 0.7;

export async function reconcileTransfer(organizationId: string, transferId: string) {
  const transfer = await prisma.transfer.findUniqueOrThrow({ where: { id: transferId } });

  const expectedPayments = await prisma.expectedPayment.findMany({
    where: { organizationId, status: { in: ["pending", "partially_matched"] } },
    include: { identity: true },
  });

  if (expectedPayments.length === 0) {
    await prisma.transfer.update({ where: { id: transferId }, data: { status: "under_review" } });
    return { transfer, matches: [], autoMatched: false };
  }

  const candidates: ExpectedPaymentCandidate[] = await Promise.all(
    expectedPayments.map(async (ep) => {
      const knownNames = await getKnownNames(organizationId, ep.identityId);
      const priorTransfers = await prisma.transfer.findMany({
        where: {
          status: { in: ["matched", "resolved"] },
          virtualAccount: { organizationId, identityId: ep.identityId },
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
        priorSenderNames: uniqueNames([
          ...priorTransfers.map((t) => t.senderName),
          ...ep.identity.knownSenderNames,
        ]),
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
  const topCandidate = candidates.find((candidate) => candidate.id === top.expectedPaymentId)!;
  const winningMatch = persisted.find((m) => m.expectedPaymentId === top.expectedPaymentId)!;
  const priorSettlementMatches = (
    await getPriorSettlementMatches(top.expectedPaymentId, transfer.id, {
      includePending: true,
    })
  ).filter((match) => hasStrongIdentitySignal(match) && match.timingScore >= GOOD_TIMING_SCORE);
  const settlementTotal =
    transfer.amount + priorSettlementMatches.reduce((sum, match) => sum + match.transfer.amount, 0);
  const settlesWithPartials =
    settlementTotal >= topCandidate.expectedAmount &&
    settlementTotal <= topCandidate.expectedAmount * PARTIAL_SETTLEMENT_OVERPAY_TOLERANCE &&
    hasStrongIdentitySignal(top) &&
    top.timingScore >= GOOD_TIMING_SCORE;
  const acceptableOverpayment =
    transfer.amount >= topCandidate.expectedAmount &&
    transfer.amount <= topCandidate.expectedAmount * PARTIAL_SETTLEMENT_OVERPAY_TOLERANCE &&
    hasStrongIdentitySignal(top) &&
    top.timingScore >= GOOD_TIMING_SCORE;
  const autoMatched = top.confidenceScore >= AUTO_MATCH_THRESHOLD || settlesWithPartials || acceptableOverpayment;

  if (autoMatched) {
    await prisma.$transaction([
      prisma.reconciliationMatch.update({
        where: { id: winningMatch.id },
        data: { decision: "auto_matched", resolvedBy: "system", resolvedAt: new Date() },
      }),
      ...priorSettlementMatches
        .filter((match) => match.decision === "pending")
        .map((match) =>
          prisma.reconciliationMatch.update({
            where: { id: match.id },
            data: { decision: "auto_matched", resolvedBy: "system", resolvedAt: new Date() },
          })
        ),
      prisma.transfer.update({ where: { id: transfer.id }, data: { status: "matched" } }),
      ...priorSettlementMatches
        .filter((match) => match.transfer.status === "under_review")
        .map((match) => prisma.transfer.update({ where: { id: match.transferId }, data: { status: "matched" } })),
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

export async function settlePendingPartialMatches(organizationId: string) {
  const pendingMatches = await prisma.reconciliationMatch.findMany({
    where: {
      decision: "pending",
      transfer: {
        status: "under_review",
        virtualAccount: { organizationId },
      },
      expectedPayment: {
        organizationId,
        status: { in: ["pending", "partially_matched"] },
      },
    },
    include: {
      transfer: true,
      expectedPayment: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const matchesByExpectedPayment = new Map<string, typeof pendingMatches>();
  for (const match of pendingMatches) {
    if (!hasStrongIdentitySignal(match) || match.timingScore < GOOD_TIMING_SCORE) continue;

    const group = matchesByExpectedPayment.get(match.expectedPaymentId) ?? [];
    group.push(match);
    matchesByExpectedPayment.set(match.expectedPaymentId, group);
  }

  let settled = 0;

  for (const matches of matchesByExpectedPayment.values()) {
    const expectedPayment = matches[0]?.expectedPayment;
    if (!expectedPayment) continue;

    const settlementTotal = matches.reduce((sum, match) => sum + match.transfer.amount, 0);
    const isSettled =
      settlementTotal >= expectedPayment.expectedAmount &&
      settlementTotal <= expectedPayment.expectedAmount * PARTIAL_SETTLEMENT_OVERPAY_TOLERANCE;

    if (!isSettled) continue;

    await prisma.$transaction([
      ...matches.map((match) =>
        prisma.reconciliationMatch.update({
          where: { id: match.id },
          data: { decision: "auto_matched", resolvedBy: "system", resolvedAt: new Date() },
        })
      ),
      ...matches.map((match) => prisma.transfer.update({ where: { id: match.transferId }, data: { status: "matched" } })),
      prisma.expectedPayment.update({
        where: { id: expectedPayment.id },
        data: { status: "matched" },
      }),
    ]);
    settled += 1;
  }

  return { settled };
}

export async function resolveMatch(organizationId: string, matchId: string, resolvedBy: string) {
  const match = await prisma.reconciliationMatch.findFirstOrThrow({
    where: { id: matchId, expectedPayment: { organizationId } },
    include: {
      transfer: true,
      expectedPayment: true,
    },
  });

  const result = await prisma.$transaction([
    prisma.reconciliationMatch.update({
      where: { id: matchId },
      data: { decision: "manual_resolved", resolvedBy, resolvedAt: new Date() },
    }),
    prisma.transfer.update({ where: { id: match.transferId }, data: { status: "resolved" } }),
    prisma.expectedPayment.update({
      where: { id: match.expectedPaymentId },
      data: { status: await getExpectedPaymentSettlementStatus(match.expectedPaymentId, match.transferId) },
    }),
  ]);

  await rememberTrustedSenderName(
    organizationId,
    match.expectedPayment.identityId,
    match.transfer.senderName
  );

  return result;
}

export async function rejectMatch(organizationId: string, matchId: string, resolvedBy: string) {
  await prisma.reconciliationMatch.findFirstOrThrow({
    where: { id: matchId, expectedPayment: { organizationId } },
  });

  return prisma.reconciliationMatch.update({
    where: { id: matchId },
    data: { decision: "rejected", resolvedBy, resolvedAt: new Date() },
  });
}

export async function getReviewQueue(organizationId: string) {
  const transfers = await prisma.transfer.findMany({
    where: { status: "under_review", virtualAccount: { organizationId } },
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

function uniqueNames(names: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const name of names) {
    const trimmed = name.trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) continue;

    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

async function rememberTrustedSenderName(organizationId: string, identityId: string, senderName: string) {
  const trustedName = senderName.trim();
  if (!trustedName) return;

  const identity = await prisma.customerIdentity.findFirstOrThrow({
    where: { id: identityId, organizationId },
    select: { knownSenderNames: true },
  });

  const alreadyKnown = identity.knownSenderNames.some(
    (knownName) => knownName.toLowerCase() === trustedName.toLowerCase()
  );
  if (alreadyKnown) return;

  await prisma.customerIdentity.update({
    where: { id: identityId },
    data: { knownSenderNames: [...identity.knownSenderNames, trustedName] },
  });
}

function hasStrongIdentitySignal(match: { nameScore: number; historyScore: number }) {
  return match.nameScore >= STRONG_IDENTITY_SCORE || match.historyScore >= STRONG_IDENTITY_SCORE;
}

async function getExpectedPaymentSettlementStatus(expectedPaymentId: string, currentTransferId: string) {
  const expectedPayment = (await prisma.expectedPayment.findMany({
    where: { id: expectedPaymentId },
  })) ?? [];
  const expectedAmount = expectedPayment[0]?.expectedAmount ?? 0;
  const priorSettlementMatches = await getPriorSettlementMatches(expectedPaymentId, currentTransferId, {
    includePending: false,
  });
  const currentMatch = await prisma.reconciliationMatch.findFirstOrThrow({
    where: { expectedPaymentId, transferId: currentTransferId },
    include: { transfer: true },
  });
  const settledAmount =
    currentMatch.transfer.amount + priorSettlementMatches.reduce((sum, match) => sum + match.transfer.amount, 0);

  return settledAmount >= expectedAmount ? "matched" : "partially_matched";
}

async function getPriorSettlementMatches(
  expectedPaymentId: string,
  currentTransferId: string,
  options: { includePending: boolean }
) {
  return prisma.reconciliationMatch.findMany({
    where: {
      expectedPaymentId,
      transferId: { not: currentTransferId },
      decision: {
        in: options.includePending
          ? ["pending", "auto_matched", "manual_resolved"]
          : ["auto_matched", "manual_resolved"],
      },
      transfer: {
        status: { in: options.includePending ? ["under_review", "matched", "resolved"] : ["matched", "resolved"] },
      },
    },
    include: { transfer: true },
    orderBy: { createdAt: "asc" },
  });
}
