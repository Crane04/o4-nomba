import { processTransferWebhook } from "./webhookService";
import type { NombaTransferPayload } from "./webhookService.types";

export async function simulateTransfer(payload: NombaTransferPayload) {
  return processTransferWebhook(payload);
}
