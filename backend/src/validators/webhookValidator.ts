import { compileSchema, validate } from "./validator";
import type { NombaTransferPayload } from "../services/webhookService.types";

const transferWebhookCheck = compileSchema({
  $$strict: "remove",
  amount: { type: "number", positive: true },
  senderName: { type: "string", empty: false, trim: true },
  senderAccountNumber: { type: "string", empty: false, trim: true, optional: true },
  narration: { type: "string", empty: false, trim: true, optional: true },
  reference: { type: "string", empty: false, trim: true },
  virtualAccountNumber: { type: "string", empty: false, trim: true },
});

export function validateTransferWebhook(payload: unknown) {
  return validate<NombaTransferPayload>(transferWebhookCheck, payload);
}
