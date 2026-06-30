import type { Request, Response } from "express";
import { getReviewQueue, rejectMatch, resolveMatch } from "../services/reconciliationService.js";

export class ReconciliationController {
  queue = async (_req: Request, res: Response) => {
    const queue = await getReviewQueue();
    res.json(queue);
  };

  resolve = async (req: Request, res: Response) => {
    const { resolvedBy } = req.body ?? {};
    if (typeof resolvedBy !== "string" || !resolvedBy.trim()) {
      return res.status(400).json({ error: "resolvedBy is required" });
    }

    const result = await resolveMatch(req.params.id, resolvedBy);
    res.json(result);
  };

  reject = async (req: Request, res: Response) => {
    const { resolvedBy } = req.body ?? {};
    if (typeof resolvedBy !== "string" || !resolvedBy.trim()) {
      return res.status(400).json({ error: "resolvedBy is required" });
    }

    const result = await rejectMatch(req.params.id, resolvedBy);
    res.json(result);
  };
}
