import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const expectedPaymentsRouter = Router();

expectedPaymentsRouter.post("/", async (req, res) => {
  const { identityId, expectedAmount, label, dueDate } = req.body ?? {};
  if (typeof identityId !== "string" || typeof expectedAmount !== "number" || typeof label !== "string") {
    return res.status(400).json({ error: "identityId, expectedAmount, and label are required" });
  }

  const payment = await prisma.expectedPayment.create({
    data: {
      identityId,
      expectedAmount,
      label,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  res.status(201).json(payment);
});

expectedPaymentsRouter.get("/", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const payments = await prisma.expectedPayment.findMany({
    where: status ? { status } : undefined,
    include: { identity: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(payments);
});
