import { prisma } from "../lib/prisma";
import { syncRecentNombaTransfers } from "./nombaTransferSyncService";

export async function listTransfers(organizationId: string) {
  await syncRecentNombaTransfers(organizationId);

  return prisma.transfer.findMany({
    where: { virtualAccount: { organizationId } },
    include: {
      virtualAccount: {
        include: { identity: true },
      },
      matches: {
        orderBy: { confidenceScore: "desc" },
        take: 1,
        include: { expectedPayment: true },
      },
    },
    orderBy: { receivedAt: "desc" },
  });
}
