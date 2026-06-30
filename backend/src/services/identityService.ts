import { prisma } from "../lib/prisma.js";

export async function createIdentity(name: string, kycTier = 1) {
  const identity = await prisma.customerIdentity.create({
    data: {
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

export async function renameIdentity(identityId: string, newName: string, reason?: string) {
  const identity = await prisma.customerIdentity.findUniqueOrThrow({ where: { id: identityId } });

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

export async function changeKycTier(identityId: string, newTier: number, reason?: string) {
  const identity = await prisma.customerIdentity.findUniqueOrThrow({ where: { id: identityId } });

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

export async function closeIdentity(identityId: string, reason?: string) {
  return prisma.$transaction([
    prisma.identityEvent.create({
      data: { identityId, type: "closed", reason },
    }),
    prisma.customerIdentity.update({
      where: { id: identityId },
      data: { status: "closed" },
    }),
    prisma.virtualAccount.updateMany({
      where: { identityId },
      data: { status: "closed" },
    }),
  ]);
}

export async function getKnownNames(identityId: string): Promise<string[]> {
  const identity = await prisma.customerIdentity.findUniqueOrThrow({ where: { id: identityId } });
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

export async function getIdentityHistory(identityId: string) {
  return prisma.identityEvent.findMany({
    where: { identityId },
    orderBy: { createdAt: "asc" },
  });
}
