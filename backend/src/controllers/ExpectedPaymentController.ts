import type { Request, Response } from "express";
import { createExpectedPayment, listExpectedPayments } from "../services/expectedPaymentService.js";

export class ExpectedPaymentController {
  create = async (req: Request, res: Response) => {
    const { identityId, expectedAmount, label, dueDate } = req.body ?? {};
    if (typeof identityId !== "string" || typeof expectedAmount !== "number" || typeof label !== "string") {
      return res.status(400).json({ error: "identityId, expectedAmount, and label are required" });
    }

    const payment = await createExpectedPayment({ identityId, expectedAmount, label, dueDate });
    res.status(201).json(payment);
  };

  list = async (req: Request, res: Response) => {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const payments = await listExpectedPayments(status);
    res.json(payments);
  };
}
