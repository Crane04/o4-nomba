import { Router } from "express";
import { WebhookController } from "../controllers/WebhookController";
import { verifyWebhookSignature } from "../middleware/verifyWebhookSignature";

export const webhookRouter = Router();
const webhookController = new WebhookController();

webhookRouter.post("/transfers", verifyWebhookSignature, webhookController.receiveTransfer);
