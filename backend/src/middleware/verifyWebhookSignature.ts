import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

export function verifyWebhookSignature(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.NOMBA_WEBHOOK_SECRET;
  const signature = req.header("x-nomba-signature");

  if (!secret) {
    console.error("NOMBA_WEBHOOK_SECRET is not configured");
    return res.status(500).json({ error: "Webhook verification not configured" });
  }

  if (!signature) {
    return res.status(401).json({ error: "Missing webhook signature" });
  }

  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!rawBody) {
    return res.status(400).json({ error: "Missing raw body for signature verification" });
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  const valid =
    sigBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(sigBuffer, expectedBuffer);

  if (!valid) {
    return res.status(401).json({ error: "Invalid webhook signature" });
  }

  next();
}
