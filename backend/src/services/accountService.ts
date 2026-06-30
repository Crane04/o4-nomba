import { prisma } from "../lib/prisma.js";
import { generateAccountNumber } from "../helpers/accountNumber.js";

export async function createAccount(identityId: string, bankName?: string) {
  const identity = await prisma.customerIdentity.findUnique({ where: { id: identityId } });
  if (!identity) return null;

  return prisma.virtualAccount.create({
    data: {
      accountNumber: generateAccountNumber(),
      bankName: bankName ?? "Nomba",
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
