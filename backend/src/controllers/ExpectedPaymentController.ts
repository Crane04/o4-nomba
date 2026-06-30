import type { Request, Response } from "express";
import { createExpectedPayment, listExpectedPayments } from "../services/expectedPaymentService";
import {
  validateCreateExpectedPayment,
  validateListExpectedPayments,
} from "../validators/expectedPaymentValidator";
import { sendValidationError } from "../validators/validator";

export class ExpectedPaymentController {
  create = async (req: Request, res: Response) => {
    const validation = validateCreateExpectedPayment(req.body);
    if (!validation.ok) return sendValidationError(res, validation);

    const payment = await createExpectedPayment(validation.data);
    res.status(201).json(payment);
  };

  list = async (req: Request, res: Response) => {
    const validation = validateListExpectedPayments(req.query);
    if (!validation.ok) return sendValidationError(res, validation);

    const payments = await listExpectedPayments(validation.data.status);
    res.json(payments);
  };
}
