import crypto from "node:crypto";
import { prisma } from "../lib/prisma";
import { createVirtualAccount, NombaApiError } from "../helpers/nombaClient";
import { syncRecentNombaTransfers } from "./nombaTransferSyncService";

export class AccountProvisioningError extends Error {
  statusCode = 502;
}

export async function createAccount(organizationId: string, identityId: string, bankName?: string) {
  const identity = await prisma.customerIdentity.findFirst({ where: { id: identityId, organizationId } });
  if (!identity) return null;

  const accountRef = `O4${crypto.randomBytes(12).toString("hex")}`;
  let virtualAccount;
  try {
    virtualAccount = await createVirtualAccount(accountRef, identity.currentName);
  } catch (error) {
    if (error instanceof NombaApiError) {
      throw new AccountProvisioningError(error.message);
    }

    throw error;
  }

  return prisma.virtualAccount.create({
    data: {
      accountNumber: virtualAccount.bankAccountNumber,
      bankName: virtualAccount.bankName ?? bankName ?? "Nomba",
      organizationId,
      identityId,
    },
  });
}

export async function listAccounts(organizationId: string) {
  await syncRecentNombaTransfers(organizationId);

  return prisma.virtualAccount.findMany({
    where: { organizationId },
    include: { identity: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAccountTransfers(organizationId: string, accountId: string) {
  await syncRecentNombaTransfers(organizationId);

  return prisma.transfer.findMany({
    where: { virtualAccountId: accountId, virtualAccount: { organizationId } },
    orderBy: { receivedAt: "desc" },
  });
}
