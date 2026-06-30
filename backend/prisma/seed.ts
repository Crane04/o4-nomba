import { prisma } from "../src/lib/prisma";
import { createIdentity, renameIdentity } from "../src/services/identityService";

async function main() {
  const adeola = await createIdentity("Adeola Johnson", 2);
  await prisma.virtualAccount.create({
    data: { accountNumber: "9001234567", identityId: adeola.id },
  });
  await prisma.expectedPayment.create({
    data: {
      identityId: adeola.id,
      expectedAmount: 50000,
      label: "March rent",
      dueDate: new Date("2026-03-01T00:00:00Z"),
    },
  });

  const chidi = await createIdentity("Chidi Okafor", 2);
  await prisma.virtualAccount.create({
    data: { accountNumber: "9007654321", identityId: chidi.id },
  });
  await prisma.expectedPayment.create({
    data: {
      identityId: chidi.id,
      expectedAmount: 75000,
      label: "Term 2 school fees",
      dueDate: new Date("2026-03-10T00:00:00Z"),
    },
  });
  await renameIdentity(chidi.id, "Chidi Eze", "Marriage - surname change");

  const tunde = await createIdentity("Tunde Bakare", 1);
  await prisma.virtualAccount.create({
    data: { accountNumber: "9009998888", identityId: tunde.id },
  });
  await prisma.expectedPayment.create({
    data: {
      identityId: tunde.id,
      expectedAmount: 30000,
      label: "April rent",
      dueDate: new Date("2026-04-01T00:00:00Z"),
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
