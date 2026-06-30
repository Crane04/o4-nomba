import { Router } from "express";
import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";

export const accountsRouter = Router();

function generateAccountNumber(): string {
  return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
}

accountsRouter.post("/", async (req, res) => {
  const { identityId, bankName } = req.body ?? {};
  if (typeof identityId !== "string") {
    return res.status(400).json({ error: "identityId is required" });
  }

  const identity = await prisma.customerIdentity.findUnique({ where: { id: identityId } });
  if (!identity) return res.status(404).json({ error: "Identity not found" });

  const account = await prisma.virtualAccount.create({
    data: {
      accountNumber: generateAccountNumber(),
      bankName: bankName ?? "Nomba",
      identityId,
    },
  });

  res.status(201).json(account);
});

accountsRouter.get("/", async (_req, res) => {
  const accounts = await prisma.virtualAccount.findMany({
    include: { identity: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(accounts);
});

accountsRouter.get("/:id/transfers", async (req, res) => {
  const transfers = await prisma.transfer.findMany({
    where: { virtualAccountId: req.params.id },
    orderBy: { receivedAt: "desc" },
  });
  res.json(transfers);
});
