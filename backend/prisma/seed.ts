import bcrypt from "bcrypt";
import type { CustomerIdentity, ExpectedPayment, VirtualAccount } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { createIdentity, renameIdentity } from "../src/services/identityService";

const PASSWORD = "demo1234";

interface RetailerSeed {
  name: string;
  kycTier: number;
  accountNumber: string;
  invoices: Array<{
    expectedAmount: number;
    label: string;
    dueDate: string;
  }>;
  rename?: {
    newName: string;
    reason: string;
  };
}

interface SeededRetailer {
  identity: CustomerIdentity;
  account: VirtualAccount;
  payments: ExpectedPayment[];
}

const orgSeeds: Array<{
  name: string;
  email: string;
  retailers: RetailerSeed[];
}> = [
  {
    name: "Eko Supplies Ltd",
    email: "admin@ekosupplies.com",
    retailers: [
      {
        name: "Balogun Provision Store",
        kycTier: 2,
        accountNumber: "9001234567",
        invoices: [
          { expectedAmount: 185000, label: "Delivery #0023 - Rice & Beans", dueDate: "2026-07-08T00:00:00Z" },
          { expectedAmount: 92000, label: "Delivery #0024 - Palm Oil", dueDate: "2026-07-12T00:00:00Z" },
        ],
      },
      {
        name: "Yusuf Mayowa Stores",
        kycTier: 1,
        accountNumber: "9009998888",
        invoices: [
          { expectedAmount: 130000, label: "Delivery #0025 - Noodles & Pasta", dueDate: "2026-07-10T00:00:00Z" },
          { expectedAmount: 64000, label: "Delivery #0026 - Beverages", dueDate: "2026-07-18T00:00:00Z" },
        ],
      },
      {
        name: "Chidi Okafor Ventures",
        kycTier: 2,
        accountNumber: "9007654321",
        invoices: [
          { expectedAmount: 210000, label: "Delivery #0027 - Rice & Tomato Paste", dueDate: "2026-07-15T00:00:00Z" },
          { expectedAmount: 78000, label: "Delivery #0028 - Groundnut Oil", dueDate: "2026-07-21T00:00:00Z" },
        ],
        rename: {
          newName: "Chidi Eze Ventures",
          reason: "Business name updated after CAC renewal",
        },
      },
      {
        name: "Adeola Johnson Supermarket",
        kycTier: 3,
        accountNumber: "9001112233",
        invoices: [
          { expectedAmount: 340000, label: "Delivery #0029 - Bulk Household Goods", dueDate: "2026-07-22T00:00:00Z" },
          { expectedAmount: 125000, label: "Delivery #0030 - Frozen Foods", dueDate: "2026-07-25T00:00:00Z" },
          { expectedAmount: 68000, label: "Delivery #0031 - Detergents", dueDate: "2026-07-29T00:00:00Z" },
        ],
      },
    ],
  },
  {
    name: "Kano Distributors",
    email: "admin@kanodist.com",
    retailers: [
      {
        name: "Sabon Gari Pharmacy",
        kycTier: 2,
        accountNumber: "9011234567",
        invoices: [
          { expectedAmount: 260000, label: "Delivery #0101 - OTC Medicines", dueDate: "2026-07-09T00:00:00Z" },
          { expectedAmount: 115000, label: "Delivery #0102 - Baby Care Supplies", dueDate: "2026-07-13T00:00:00Z" },
        ],
      },
      {
        name: "Aminu Spare Parts",
        kycTier: 1,
        accountNumber: "9017654321",
        invoices: [
          { expectedAmount: 420000, label: "Delivery #0103 - Filters & Brake Pads", dueDate: "2026-07-16T00:00:00Z" },
          { expectedAmount: 175000, label: "Delivery #0104 - Engine Oil", dueDate: "2026-07-20T00:00:00Z" },
        ],
      },
      {
        name: "Halima Cosmetics",
        kycTier: 2,
        accountNumber: "9019998888",
        invoices: [
          { expectedAmount: 150000, label: "Delivery #0105 - Hair Products", dueDate: "2026-07-11T00:00:00Z" },
          { expectedAmount: 97000, label: "Delivery #0106 - Skin Care", dueDate: "2026-07-24T00:00:00Z" },
        ],
        rename: {
          newName: "Halima Beauty Hub",
          reason: "Retailer rebranded shop name",
        },
      },
      {
        name: "Dala Mini Mart",
        kycTier: 3,
        accountNumber: "9014445566",
        invoices: [
          { expectedAmount: 205000, label: "Delivery #0107 - Groceries", dueDate: "2026-07-17T00:00:00Z" },
          { expectedAmount: 89000, label: "Delivery #0108 - Soft Drinks", dueDate: "2026-07-23T00:00:00Z" },
          { expectedAmount: 54000, label: "Delivery #0109 - Cleaning Items", dueDate: "2026-07-30T00:00:00Z" },
        ],
      },
    ],
  },
];

async function main() {
  await prisma.reconciliationMatch.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.expectedPayment.deleteMany();
  await prisma.identityEvent.deleteMany();
  await prisma.virtualAccount.deleteMany();
  await prisma.customerIdentity.deleteMany();
  await prisma.organization.deleteMany();

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  for (const orgSeed of orgSeeds) {
    const organization = await prisma.organization.create({
      data: {
        name: orgSeed.name,
        email: orgSeed.email,
        passwordHash,
      },
    });

    const seededRetailers: SeededRetailer[] = [];

    for (const retailer of orgSeed.retailers) {
      const identity = await createIdentity(organization.id, retailer.name, retailer.kycTier);
      const account = await prisma.virtualAccount.create({
        data: {
          organizationId: organization.id,
          identityId: identity.id,
          accountNumber: retailer.accountNumber,
          bankName: "Nomba",
        },
      });

      const payments = await Promise.all(
        retailer.invoices.map((invoice) =>
          prisma.expectedPayment.create({
            data: {
              organizationId: organization.id,
              identityId: identity.id,
              expectedAmount: invoice.expectedAmount,
              label: invoice.label,
              dueDate: new Date(invoice.dueDate),
            },
          })
        )
      );

      if (retailer.rename) {
        await renameIdentity(organization.id, identity.id, retailer.rename.newName, retailer.rename.reason);
      }

      seededRetailers.push({ identity, account, payments });
    }

    await seedTransfersForOrganization(orgSeed.name, seededRetailers);
  }
}

async function seedTransfersForOrganization(orgName: string, retailers: SeededRetailer[]) {
  const [first, second, third, fourth] = retailers;
  if (!first || !second || !third || !fourth) return;

  await createMatchedTransfer({
    account: first.account,
    payment: first.payments[0],
    amount: first.payments[0].expectedAmount,
    senderName: first.identity.currentName,
    reference: `${orgName}-auto-001`,
    receivedAt: new Date("2026-07-01T09:12:00Z"),
    reasoning: "Exact account, amount, and retailer name match.",
  });

  await createResolvedTransfer({
    identity: second.identity,
    account: second.account,
    payment: second.payments[0],
    amount: second.payments[0].expectedAmount,
    senderName: `${second.identity.currentName.split(" ")[0]} Trading`,
    reference: `${orgName}-manual-001`,
    receivedAt: new Date("2026-07-01T10:45:00Z"),
    reasoning: "Finance confirmed this sender name belongs to the retailer.",
  });

  await createUnderReviewTransfer({
    account: third.account,
    amount: Math.round(third.payments[0].expectedAmount * 0.95),
    senderName: "Cash Deposit Branch Transfer",
    reference: `${orgName}-review-001`,
    receivedAt: new Date("2026-07-01T12:20:00Z"),
    candidates: [
      {
        payment: third.payments[0],
        confidenceScore: 0.72,
        amountScore: 0.82,
        nameScore: 0.38,
        timingScore: 0.74,
        historyScore: 0.1,
        reasoning: "Amount is close to this invoice, but sender name is generic and needs finance review.",
      },
      {
        payment: fourth.payments[0],
        confidenceScore: 0.43,
        amountScore: 0.51,
        nameScore: 0.22,
        timingScore: 0.61,
        historyScore: 0,
        reasoning: "Possible invoice by timing, but amount and sender identity are weak.",
      },
    ],
  });

  await createUnderReviewTransfer({
    account: fourth.account,
    amount: Math.round(fourth.payments[1].expectedAmount * 0.6),
    senderName: "Unknown POS Settlement",
    reference: `${orgName}-review-002`,
    receivedAt: new Date("2026-07-01T14:05:00Z"),
    candidates: [
      {
        payment: fourth.payments[1],
        confidenceScore: 0.64,
        amountScore: 0.58,
        nameScore: 0.31,
        timingScore: 0.8,
        historyScore: 0.15,
        reasoning: "Partial amount and timing line up, but sender name does not clearly identify the retailer.",
      },
      {
        payment: first.payments[1],
        confidenceScore: 0.39,
        amountScore: 0.44,
        nameScore: 0.18,
        timingScore: 0.52,
        historyScore: 0,
        reasoning: "Low-confidence backup candidate for review comparison.",
      },
    ],
  });
}

async function createMatchedTransfer(input: {
  account: VirtualAccount;
  payment: ExpectedPayment;
  amount: number;
  senderName: string;
  reference: string;
  receivedAt: Date;
  reasoning: string;
}) {
  const transfer = await prisma.transfer.create({
    data: {
      virtualAccountId: input.account.id,
      amount: input.amount,
      senderName: input.senderName,
      senderAccountNumber: "0123456789",
      narration: input.payment.label,
      reference: input.reference,
      receivedAt: input.receivedAt,
      status: "matched",
    },
  });

  await prisma.$transaction([
    prisma.reconciliationMatch.create({
      data: {
        transferId: transfer.id,
        expectedPaymentId: input.payment.id,
        confidenceScore: 0.96,
        amountScore: 1,
        nameScore: 0.96,
        timingScore: 0.88,
        historyScore: 0.9,
        decision: "auto_matched",
        resolvedBy: "system",
        resolvedAt: input.receivedAt,
        reasoning: input.reasoning,
      },
    }),
    prisma.expectedPayment.update({
      where: { id: input.payment.id },
      data: { status: "matched" },
    }),
  ]);
}

async function createResolvedTransfer(input: {
  identity: CustomerIdentity;
  account: VirtualAccount;
  payment: ExpectedPayment;
  amount: number;
  senderName: string;
  reference: string;
  receivedAt: Date;
  reasoning: string;
}) {
  const transfer = await prisma.transfer.create({
    data: {
      virtualAccountId: input.account.id,
      amount: input.amount,
      senderName: input.senderName,
      senderAccountNumber: "0987654321",
      narration: input.payment.label,
      reference: input.reference,
      receivedAt: input.receivedAt,
      status: "resolved",
    },
  });

  await prisma.$transaction([
    prisma.reconciliationMatch.create({
      data: {
        transferId: transfer.id,
        expectedPaymentId: input.payment.id,
        confidenceScore: 0.68,
        amountScore: 1,
        nameScore: 0.42,
        timingScore: 0.79,
        historyScore: 0.2,
        decision: "manual_resolved",
        resolvedBy: "Eko Finance",
        resolvedAt: input.receivedAt,
        reasoning: input.reasoning,
      },
    }),
    prisma.expectedPayment.update({
      where: { id: input.payment.id },
      data: { status: "matched" },
    }),
    prisma.customerIdentity.update({
      where: { id: input.identity.id },
      data: { knownSenderNames: [input.senderName] },
    }),
  ]);
}

async function createUnderReviewTransfer(input: {
  account: VirtualAccount;
  amount: number;
  senderName: string;
  reference: string;
  receivedAt: Date;
  candidates: Array<{
    payment: ExpectedPayment;
    confidenceScore: number;
    amountScore: number;
    nameScore: number;
    timingScore: number;
    historyScore: number;
    reasoning: string;
  }>;
}) {
  const transfer = await prisma.transfer.create({
    data: {
      virtualAccountId: input.account.id,
      amount: input.amount,
      senderName: input.senderName,
      senderAccountNumber: "0112233445",
      narration: "Distributor payment",
      reference: input.reference,
      receivedAt: input.receivedAt,
      status: "under_review",
    },
  });

  await prisma.reconciliationMatch.createMany({
    data: input.candidates.map((candidate) => ({
      transferId: transfer.id,
      expectedPaymentId: candidate.payment.id,
      confidenceScore: candidate.confidenceScore,
      amountScore: candidate.amountScore,
      nameScore: candidate.nameScore,
      timingScore: candidate.timingScore,
      historyScore: candidate.historyScore,
      decision: "pending",
      reasoning: candidate.reasoning,
    })),
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
