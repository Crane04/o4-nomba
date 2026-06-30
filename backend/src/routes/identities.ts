import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  createIdentity,
  renameIdentity,
  changeKycTier,
  closeIdentity,
  getIdentityHistory,
} from "../services/identityService.js";

export const identityRouter = Router();

identityRouter.post("/", async (req, res) => {
  const { name, kycTier } = req.body ?? {};
  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  const identity = await createIdentity(name.trim(), kycTier ?? 1);
  res.status(201).json(identity);
});

identityRouter.get("/", async (_req, res) => {
  const identities = await prisma.customerIdentity.findMany({
    include: { virtualAccounts: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(identities);
});

identityRouter.get("/:id", async (req, res) => {
  const identity = await prisma.customerIdentity.findUnique({
    where: { id: req.params.id },
    include: { virtualAccounts: true, expectedPayments: true },
  });
  if (!identity) return res.status(404).json({ error: "Not found" });
  res.json(identity);
});

identityRouter.get("/:id/history", async (req, res) => {
  const history = await getIdentityHistory(req.params.id);
  res.json(history);
});

identityRouter.post("/:id/rename", async (req, res) => {
  const { newName, reason } = req.body ?? {};
  if (typeof newName !== "string" || !newName.trim()) {
    return res.status(400).json({ error: "newName is required" });
  }
  const result = await renameIdentity(req.params.id, newName.trim(), reason);
  res.json(result);
});

identityRouter.post("/:id/kyc-tier", async (req, res) => {
  const { newTier, reason } = req.body ?? {};
  if (typeof newTier !== "number" || newTier < 1 || newTier > 3) {
    return res.status(400).json({ error: "newTier must be 1, 2, or 3" });
  }
  const result = await changeKycTier(req.params.id, newTier, reason);
  res.json(result);
});

identityRouter.post("/:id/close", async (req, res) => {
  const { reason } = req.body ?? {};
  const result = await closeIdentity(req.params.id, reason);
  res.json(result);
});
