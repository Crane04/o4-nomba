import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

export function verifyWebhookSignature(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.NOMBA_WEBHOOK_SECRET;
  const signature = req.header("x-nomba-signature");

  console.info("[webhook:signature] verifying", {
    method: req.method,
    path: req.originalUrl,
    contentType: req.header("content-type"),
    hasSecret: Boolean(secret),
    hasSignature: Boolean(signature),
    signatureLength: signature?.length ?? 0,
    signaturePrefix: signature ? signature.slice(0, 8) : null,
  });

  if (!secret) {
    console.error("[webhook:signature] NOMBA_WEBHOOK_SECRET is not configured");
    return res.status(500).json({ error: "Webhook verification not configured" });
  }

  if (!signature) {
    console.warn("[webhook:signature] missing_signature");
    return res.status(401).json({ error: "Missing webhook signature" });
  }

  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!rawBody) {
    console.warn("[webhook:signature] missing_raw_body");
    return res.status(400).json({ error: "Missing raw body for signature verification" });
  }

  console.info("[webhook:signature] raw_body_captured", {
    byteLength: rawBody.length,
  });

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  const valid =
    sigBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(sigBuffer, expectedBuffer);

  if (!valid) {
    console.warn("[webhook:signature] invalid_signature", {
      receivedLength: sigBuffer.length,
      expectedLength: expectedBuffer.length,
      receivedPrefix: signature.slice(0, 8),
      expectedPrefix: expected.slice(0, 8),
    });
    return res.status(401).json({ error: "Invalid webhook signature" });
  }

  console.info("[webhook:signature] verified");
  next();
}
