import { Router } from "express";
import { getReviewQueue, resolveMatch, rejectMatch } from "../services/reconciliationService.js";

export const reconciliationRouter = Router();

reconciliationRouter.get("/queue", async (_req, res) => {
  const queue = await getReviewQueue();
  res.json(queue);
});

reconciliationRouter.post("/matches/:id/resolve", async (req, res) => {
  const { resolvedBy } = req.body ?? {};
  if (typeof resolvedBy !== "string" || !resolvedBy.trim()) {
    return res.status(400).json({ error: "resolvedBy is required" });
  }
  const result = await resolveMatch(req.params.id, resolvedBy);
  res.json(result);
});

reconciliationRouter.post("/matches/:id/reject", async (req, res) => {
  const { resolvedBy } = req.body ?? {};
  if (typeof resolvedBy !== "string" || !resolvedBy.trim()) {
    return res.status(400).json({ error: "resolvedBy is required" });
  }
  const result = await rejectMatch(req.params.id, resolvedBy);
  res.json(result);
});
