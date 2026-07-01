import { processTransferWebhook } from "./webhookService";
import type { NombaTransferPayload } from "./webhookService.types";

export async function simulateTransfer(organizationId: string, payload: NombaTransferPayload) {
  return processTransferWebhook(payload, { organizationId });
}
