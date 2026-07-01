import { prisma } from "../lib/prisma";
import { reconcileTransfer } from "./reconciliationService";
import type { NombaTransferPayload } from "./webhookService.types";

export async function processTransferWebhook(
  payload: NombaTransferPayload,
  options: { organizationId?: string } = {}
) {
  const existing = await prisma.transfer.findUnique({ where: { reference: payload.reference } });
  if (existing) {
    return {
      status: "duplicate" as const,
      transferId: existing.id,
    };
  }

  const virtualAccount = await prisma.virtualAccount.findUnique({
    where: { accountNumber: payload.virtualAccountNumber },
  });

  if (options.organizationId && virtualAccount?.organizationId !== options.organizationId) {
    return {
      status: "account_not_found" as const,
      transferId: null,
    };
  }

  const transfer = await prisma.transfer.create({
    data: {
      amount: payload.amount,
      senderName: payload.senderName,
      senderAccountNumber: payload.senderAccountNumber,
      narration: payload.narration,
      reference: payload.reference,
      virtualAccountId: virtualAccount?.id,
    },
  });

  if (!virtualAccount) {
    await prisma.transfer.update({ where: { id: transfer.id }, data: { status: "under_review" } });
    return {
      status: "created" as const,
      transferId: transfer.id,
      autoMatched: false,
      topMatch: null,
    };
  }

  const result = await reconcileTransfer(virtualAccount.organizationId, transfer.id);

  return {
    status: "created" as const,
    transferId: transfer.id,
    autoMatched: result.autoMatched,
    topMatch: result.matches[0] ?? null,
  };
}
