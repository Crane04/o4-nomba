import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { verifyWebhookSignature } from "../middleware/verifyWebhookSignature.js";
import { reconcileTransfer } from "../services/reconciliationService.js";

export const webhookRouter = Router();

interface NombaTransferPayload {
  amount: number;
  senderName: string;
  senderAccountNumber?: string;
  narration?: string;
  reference: string;
  virtualAccountNumber: string;
}

function isValidPayload(body: unknown): body is NombaTransferPayload {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.amount === "number" &&
    b.amount > 0 &&
    typeof b.senderName === "string" &&
    b.senderName.trim().length > 0 &&
    typeof b.reference === "string" &&
    typeof b.virtualAccountNumber === "string"
  );
}

webhookRouter.post("/transfers", verifyWebhookSignature, async (req, res) => {
  const body = req.body;

  if (!isValidPayload(body)) {
    return res.status(400).json({ error: "Malformed transfer payload" });
  }

  const existing = await prisma.transfer.findUnique({ where: { reference: body.reference } });
  if (existing) {
    return res.status(200).json({ message: "Already processed", transferId: existing.id });
  }

  const virtualAccount = await prisma.virtualAccount.findUnique({
    where: { accountNumber: body.virtualAccountNumber },
  });

  const transfer = await prisma.transfer.create({
    data: {
      amount: body.amount,
      senderName: body.senderName,
      senderAccountNumber: body.senderAccountNumber,
      narration: body.narration,
      reference: body.reference,
      virtualAccountId: virtualAccount?.id,
    },
  });

  const result = await reconcileTransfer(transfer.id);

  res.status(201).json({
    transferId: transfer.id,
    autoMatched: result.autoMatched,
    topMatch: result.matches[0] ?? null,
  });
});
