import type { Request, Response } from "express";
import { simulateTransfer } from "../services/demoService";
import { validateTransferWebhook } from "../validators/webhookValidator";
import { sendValidationError } from "../validators/validator";

export class DemoController {
  simulateTransfer = async (req: Request, res: Response) => {
    const validation = validateTransferWebhook(req.body);
    if (!validation.ok) return sendValidationError(res, validation);

    const result = await simulateTransfer(validation.data);
    res.status(result.status === "duplicate" ? 200 : 201).json(result);
  };
}
