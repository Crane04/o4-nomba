import { Router } from "express";
import { ExpectedPaymentController } from "../controllers/ExpectedPaymentController.js";

export const expectedPaymentsRouter = Router();
const expectedPaymentController = new ExpectedPaymentController();

expectedPaymentsRouter.post("/", expectedPaymentController.create);
expectedPaymentsRouter.get("/", expectedPaymentController.list);
