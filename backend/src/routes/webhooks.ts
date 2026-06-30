import { Router } from "express";
import { WebhookController } from "../controllers/WebhookController.js";
import { verifyWebhookSignature } from "../middleware/verifyWebhookSignature.js";

export const webhookRouter = Router();
const webhookController = new WebhookController();

webhookRouter.post("/transfers", verifyWebhookSignature, webhookController.receiveTransfer);
