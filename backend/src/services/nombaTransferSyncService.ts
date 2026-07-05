import { listVirtualAccountTransfers } from "../helpers/nombaClient";
import type { NombaTransferRecord } from "../helpers/nombaClient.types";
import { prisma } from "../lib/prisma";
import { processTransferWebhook } from "./webhookService";
import type { NombaTransferPayload } from "./webhookService.types";

const DEFAULT_SYNC_TTL_MS = 10_000;
const syncState = new Map<string, { lastSyncedAt: number; inFlight?: Promise<void> }>();

export async function syncRecentNombaTransfers(organizationId: string) {
  if (process.env.NOMBA_SYNC_ON_REQUEST === "false") return;

  const now = Date.now();
  const ttlMs = Number(process.env.NOMBA_SYNC_TTL_MS ?? DEFAULT_SYNC_TTL_MS);
  const state = syncState.get(organizationId);

  if (state?.inFlight) return state.inFlight;
  if (state && now - state.lastSyncedAt < ttlMs) return;

  const syncPromise = runSync(organizationId)
    .catch((error) => {
      console.warn("[nomba-sync] failed", {
        organizationId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    })
    .finally(() => {
      const current = syncState.get(organizationId);
      syncState.set(organizationId, {
        lastSyncedAt: Date.now(),
        inFlight: current?.inFlight === syncPromise ? undefined : current?.inFlight,
      });
    });

  syncState.set(organizationId, { lastSyncedAt: state?.lastSyncedAt ?? 0, inFlight: syncPromise });
  return syncPromise;
}

async function runSync(organizationId: string) {
  const accounts = await prisma.virtualAccount.findMany({
    where: { organizationId, status: "active" },
    select: { accountNumber: true },
  });
  if (accounts.length === 0) return;

  const recordsByAccount = await Promise.all(
    accounts.map(async (account) => ({
      accountNumber: account.accountNumber,
      records: await listVirtualAccountTransfers(account.accountNumber),
    }))
  );
  let processed = 0;
  let skipped = 0;

  for (const accountRecords of recordsByAccount) {
    for (const record of accountRecords.records) {
      const payload = normalizeTransferRecord(record, accountRecords.accountNumber);
      if (!payload) {
        skipped += 1;
        continue;
      }

      const result = await processTransferWebhook(payload, { organizationId });
      if (result.status === "account_not_found") {
        console.warn("[nomba-sync] account_not_found", {
          organizationId,
          reference: payload.reference,
          virtualAccountNumber: payload.virtualAccountNumber,
        });
        skipped += 1;
        continue;
      }

      processed += 1;
    }
  }

  console.info("[nomba-sync] completed", {
    organizationId,
    accounts: accounts.length,
    fetched: recordsByAccount.reduce((sum, account) => sum + account.records.length, 0),
    processed,
    skipped,
  });
}

function normalizeTransferRecord(
  record: NombaTransferRecord,
  fallbackAccountNumber: string
): NombaTransferPayload | null {
  const amount = normalizeAmount(record.amount);
  const senderName = firstString(
    record.senderName,
    record.ktaSenderName,
    record.senderAccountName,
    record.sourceAccountName
  );
  const reference = firstString(
    record.reference,
    record.transactionReference,
    record.paymentVendorReference,
    record.billingVendorReference,
    record.sessionId,
    record.id
  );
  const virtualAccountNumber = firstString(
    record.virtualAccountNumber,
    record.recipientAccountNumber,
    record.destinationAccountNumber,
    record.bankAccountNumber,
    fallbackAccountNumber
  );

  if (!amount || !senderName || !reference || !virtualAccountNumber) {
    return null;
  }

  return {
    amount,
    senderName,
    senderAccountNumber: firstString(
      record.senderAccountNumber,
      record.ktaSenderAccountNumber,
      record.sourceAccountNumber,
      record.accountNumber
    ),
    narration: firstString(record.narration, record.description),
    reference,
    virtualAccountNumber,
  };
}

function normalizeAmount(amount: number | string | undefined) {
  if (typeof amount === "number") return amount > 0 ? amount : null;
  if (typeof amount !== "string") return null;

  const parsed = Number(amount.replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function firstString(...values: Array<string | undefined>) {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }

  return undefined;
}
