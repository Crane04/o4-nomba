import { prisma } from "../lib/prisma";

export async function createExpectedPayment(input: {
  identityId: string;
  expectedAmount: number;
  label: string;
  dueDate?: string;
}) {
  return prisma.expectedPayment.create({
    data: {
      identityId: input.identityId,
      expectedAmount: input.expectedAmount,
      label: input.label,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    },
  });
}

export async function listExpectedPayments(status?: string) {
  return prisma.expectedPayment.findMany({
    where: status ? { status } : undefined,
    include: { identity: true },
    orderBy: { createdAt: "desc" },
  });
}
