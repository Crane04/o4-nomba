import { prisma } from "../lib/prisma";
import { reconcileTransfer } from "./reconciliationService";
import type { NombaTransferPayload } from "./webhookService.types";

export async function processTransferWebhook(payload: NombaTransferPayload) {
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

  const result = await reconcileTransfer(transfer.id);

  return {
    status: "created" as const,
    transferId: transfer.id,
    autoMatched: result.autoMatched,
    topMatch: result.matches[0] ?? null,
  };
}
