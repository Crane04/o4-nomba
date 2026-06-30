import type { Request, Response } from "express";
import { processTransferWebhook, type NombaTransferPayload } from "../services/webhookService.js";

function isValidTransferPayload(body: unknown): body is NombaTransferPayload {
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

export class WebhookController {
  receiveTransfer = async (req: Request, res: Response) => {
    if (!isValidTransferPayload(req.body)) {
      return res.status(400).json({ error: "Malformed transfer payload" });
    }

    const result = await processTransferWebhook(req.body);
    if (result.status === "duplicate") {
      return res.status(200).json({ message: "Already processed", transferId: result.transferId });
    }

    res.status(201).json({
      transferId: result.transferId,
      autoMatched: result.autoMatched,
      topMatch: result.topMatch,
    });
  };
}
