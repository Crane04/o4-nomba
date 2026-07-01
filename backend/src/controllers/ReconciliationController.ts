import type { Request, Response } from "express";
import { getReviewQueue, rejectMatch, resolveMatch } from "../services/reconciliationService";
import { validateResolveMatch } from "../validators/reconciliationValidator";
import { sendValidationError } from "../validators/validator";

export class ReconciliationController {
  queue = async (req: Request, res: Response) => {
    const queue = await getReviewQueue(req.org!.id);
    res.json(queue);
  };

  resolve = async (req: Request, res: Response) => {
    const validation = validateResolveMatch(req.body);
    if (!validation.ok) return sendValidationError(res, validation);

    const result = await resolveMatch(req.org!.id, req.params.id, validation.data.resolvedBy);
    res.json(result);
  };

  reject = async (req: Request, res: Response) => {
    const validation = validateResolveMatch(req.body);
    if (!validation.ok) return sendValidationError(res, validation);

    const result = await rejectMatch(req.org!.id, req.params.id, validation.data.resolvedBy);
    res.json(result);
  };
}
