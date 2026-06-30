import crypto from "node:crypto";
import { prisma } from "../lib/prisma";
import { createVirtualAccount, NombaApiError } from "../helpers/nombaClient";

export class AccountProvisioningError extends Error {
  statusCode = 502;
}

export async function createAccount(identityId: string, bankName?: string) {
  const identity = await prisma.customerIdentity.findUnique({ where: { id: identityId } });
  if (!identity) return null;

  const accountRef = crypto.randomUUID();
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
      identityId,
    },
  });
}

export async function listAccounts() {
  return prisma.virtualAccount.findMany({
    include: { identity: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAccountTransfers(accountId: string) {
  return prisma.transfer.findMany({
    where: { virtualAccountId: accountId },
    orderBy: { receivedAt: "desc" },
  });
}
