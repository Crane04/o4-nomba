import { prisma } from "../lib/prisma";

export async function createIdentity(organizationId: string, name: string, kycTier = 1) {
  const identity = await prisma.customerIdentity.create({
    data: {
      organizationId,
      currentName: name,
      kycTier,
      identityEvents: {
        create: {
          type: "created",
          newValue: JSON.stringify({ name, kycTier }),
        },
      },
    },
  });
  return identity;
}

export async function listIdentities(organizationId: string) {
  return prisma.customerIdentity.findMany({
    where: { organizationId },
    include: { virtualAccounts: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getIdentity(organizationId: string, identityId: string) {
  return prisma.customerIdentity.findFirst({
    where: { id: identityId, organizationId },
    include: { virtualAccounts: true, expectedPayments: true },
  });
}

export async function renameIdentity(organizationId: string, identityId: string, newName: string, reason?: string) {
  const identity = await prisma.customerIdentity.findFirstOrThrow({ where: { id: identityId, organizationId } });

  return prisma.$transaction([
    prisma.identityEvent.create({
      data: {
        identityId,
        type: "renamed",
        previousValue: JSON.stringify({ name: identity.currentName }),
        newValue: JSON.stringify({ name: newName }),
        reason,
      },
    }),
    prisma.customerIdentity.update({
      where: { id: identityId },
      data: { currentName: newName },
    }),
  ]);
}

export async function changeKycTier(organizationId: string, identityId: string, newTier: number, reason?: string) {
  const identity = await prisma.customerIdentity.findFirstOrThrow({ where: { id: identityId, organizationId } });

  return prisma.$transaction([
    prisma.identityEvent.create({
      data: {
        identityId,
        type: "kyc_tier_changed",
        previousValue: JSON.stringify({ kycTier: identity.kycTier }),
        newValue: JSON.stringify({ kycTier: newTier }),
        reason,
      },
    }),
    prisma.customerIdentity.update({
      where: { id: identityId },
      data: { kycTier: newTier },
    }),
  ]);
}

export async function closeIdentity(organizationId: string, identityId: string, reason?: string) {
  await prisma.customerIdentity.findFirstOrThrow({ where: { id: identityId, organizationId } });

  return prisma.$transaction([
    prisma.identityEvent.create({
      data: { identityId, type: "closed", reason },
    }),
    prisma.customerIdentity.update({
      where: { id: identityId },
      data: { status: "closed" },
    }),
    prisma.virtualAccount.updateMany({
      where: { identityId, organizationId },
      data: { status: "closed" },
    }),
  ]);
}

export async function getKnownNames(organizationId: string, identityId: string): Promise<string[]> {
  const identity = await prisma.customerIdentity.findFirstOrThrow({ where: { id: identityId, organizationId } });
  const renameEvents = await prisma.identityEvent.findMany({
    where: { identityId, type: "renamed" },
  });

  const names = new Set<string>([identity.currentName]);
  for (const event of renameEvents) {
    if (event.previousValue) {
      const parsed = JSON.parse(event.previousValue) as { name?: string };
      if (parsed.name) names.add(parsed.name);
    }
    if (event.newValue) {
      const parsed = JSON.parse(event.newValue) as { name?: string };
      if (parsed.name) names.add(parsed.name);
    }
  }
  return Array.from(names);
}

export async function getIdentityHistory(organizationId: string, identityId: string) {
  const identity = await prisma.customerIdentity.findFirst({ where: { id: identityId, organizationId } });
  if (!identity) return [];

  return prisma.identityEvent.findMany({
    where: { identityId },
    orderBy: { createdAt: "asc" },
  });
}
