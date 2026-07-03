import type { Request, Response } from "express";
import { processTransferWebhook } from "../services/webhookService";
import { validateTransferWebhook } from "../validators/webhookValidator";
import { sendValidationError } from "../validators/validator";

export class WebhookController {
  receiveTransfer = async (req: Request, res: Response) => {
    console.info("[webhook:transfers] received", {
      contentType: req.header("content-type"),
      hasSignature: Boolean(req.header("x-nomba-signature")),
      bodyKeys: typeof req.body === "object" && req.body ? Object.keys(req.body) : [],
    });

    const validation = validateTransferWebhook(req.body);
    if (!validation.ok) {
      console.warn("[webhook:transfers] validation_failed", { errors: validation.errors });
      return sendValidationError(res, validation);
    }

    const result = await processTransferWebhook(validation.data);
    if (result.status === "duplicate") {
      console.info("[webhook:transfers] duplicate", {
        reference: validation.data.reference,
        transferId: result.transferId,
      });
      return res.status(200).json({ message: "Already processed", transferId: result.transferId });
    }

    console.info("[webhook:transfers] processed", {
      reference: validation.data.reference,
      virtualAccountNumber: validation.data.virtualAccountNumber,
      amount: validation.data.amount,
      senderName: validation.data.senderName,
      transferId: result.transferId,
      autoMatched: result.autoMatched,
      topMatchScore: result.topMatch?.confidenceScore,
    });

    res.status(201).json({
      transferId: result.transferId,
      autoMatched: result.autoMatched,
      topMatch: result.topMatch,
    });
  };
}
