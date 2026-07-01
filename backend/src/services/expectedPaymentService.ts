import { prisma } from "../lib/prisma";

export async function createExpectedPayment(input: {
  organizationId: string;
  identityId: string;
  expectedAmount: number;
  label: string;
  dueDate?: string;
}) {
  const identity = await prisma.customerIdentity.findFirst({
    where: { id: input.identityId, organizationId: input.organizationId },
  });
  if (!identity) return null;

  return prisma.expectedPayment.create({
    data: {
      organizationId: input.organizationId,
      identityId: input.identityId,
      expectedAmount: input.expectedAmount,
      label: input.label,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    },
  });
}

export async function listExpectedPayments(organizationId: string, status?: string) {
  return prisma.expectedPayment.findMany({
    where: { organizationId, ...(status ? { status } : {}) },
    include: { identity: true },
    orderBy: { createdAt: "desc" },
  });
}
