import type { Request, Response } from "express";
import { processTransferWebhook } from "../services/webhookService.js";
import { validateTransferWebhook } from "../validators/webhookValidator.js";
import { sendValidationError } from "../validators/validator.js";

export class WebhookController {
  receiveTransfer = async (req: Request, res: Response) => {
    const validation = validateTransferWebhook(req.body);
    if (!validation.ok) return sendValidationError(res, validation);

    const result = await processTransferWebhook(validation.data);
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
