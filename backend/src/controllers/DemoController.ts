import type { Request, Response } from "express";
import { simulateTransfer } from "../services/demoService";
import { validateTransferWebhook } from "../validators/webhookValidator";
import { sendValidationError } from "../validators/validator";

export class DemoController {
  simulateTransfer = async (req: Request, res: Response) => {
    const validation = validateTransferWebhook(req.body);
    if (!validation.ok) return sendValidationError(res, validation);

    const result = await simulateTransfer(req.org!.id, validation.data);
    if (result.status === "account_not_found") {
      return res.status(404).json({ error: "Virtual account not found for this organization" });
    }

    res.status(result.status === "duplicate" ? 200 : 201).json(result);
  };
}
