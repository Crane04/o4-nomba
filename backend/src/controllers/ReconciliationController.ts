import type { Request, Response } from "express";
import { getReviewQueue, rejectMatch, resolveMatch } from "../services/reconciliationService.js";
import { validateResolveMatch } from "../validators/reconciliationValidator.js";
import { sendValidationError } from "../validators/validator.js";

export class ReconciliationController {
  queue = async (_req: Request, res: Response) => {
    const queue = await getReviewQueue();
    res.json(queue);
  };

  resolve = async (req: Request, res: Response) => {
    const validation = validateResolveMatch(req.body);
    if (!validation.ok) return sendValidationError(res, validation);

    const result = await resolveMatch(req.params.id, validation.data.resolvedBy);
    res.json(result);
  };

  reject = async (req: Request, res: Response) => {
    const validation = validateResolveMatch(req.body);
    if (!validation.ok) return sendValidationError(res, validation);

    const result = await rejectMatch(req.params.id, validation.data.resolvedBy);
    res.json(result);
  };
}
