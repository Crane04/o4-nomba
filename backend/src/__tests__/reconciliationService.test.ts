import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "./mockPrisma";
import { getKnownNames } from "../services/identityService";
import {
  reconcileTransfer,
  rejectMatch,
  resolveMatch,
} from "../services/reconciliationService";

vi.mock("../lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("../services/identityService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/identityService")>();
  return {
    ...actual,
    getKnownNames: vi.fn(),
  };
});

const getKnownNamesMock = vi.mocked(getKnownNames);

const transfer = {
  id: "transfer-1",
  amount: 50000,
  senderName: "Amina Stores",
  receivedAt: new Date("2026-01-10T00:00:00.000Z"),
};

const expectedPayment = {
  id: "expected-1",
  identityId: "identity-1",
  expectedAmount: 50000,
  label: "January invoice",
  dueDate: new Date("2026-01-10T00:00:00.000Z"),
  identity: {
    id: "identity-1",
    currentName: "Amina Stores",
    knownSenderNames: [],
  },
};

describe("reconciliationService", () => {
  beforeEach(() => {
    resetPrismaMock();
    getKnownNamesMock.mockReset();
    prismaMock.transfer.findUniqueOrThrow.mockResolvedValue(transfer);
    prismaMock.reconciliationMatch.create.mockImplementation(async ({ data }) => ({
      id: `match-${data.expectedPaymentId}`,
      ...data,
    }));
  });

  it("marks transfers under review when there are no expected payments", async () => {
    prismaMock.expectedPayment.findMany.mockResolvedValue([]);
    prismaMock.transfer.update.mockResolvedValue({ id: "transfer-1", status: "under_review" });

    await expect(reconcileTransfer("org-1", "transfer-1")).resolves.toMatchObject({
      matches: [],
      autoMatched: false,
    });

    expect(prismaMock.transfer.update).toHaveBeenCalledWith({
      where: { id: "transfer-1" },
      data: { status: "under_review" },
    });
    expect(prismaMock.reconciliationMatch.create).not.toHaveBeenCalled();
  });

  it("auto-matches high confidence transfers and updates related records", async () => {
    prismaMock.expectedPayment.findMany.mockResolvedValue([expectedPayment]);
    prismaMock.transfer.findMany.mockResolvedValue([]);
    getKnownNamesMock.mockResolvedValue(["Amina Stores"]);
    prismaMock.reconciliationMatch.update.mockResolvedValue({ id: "match-expected-1" });
    prismaMock.transfer.update.mockResolvedValue({ id: "transfer-1", status: "matched" });
    prismaMock.expectedPayment.update.mockResolvedValue({ id: "expected-1", status: "matched" });

    const result = await reconcileTransfer("org-1", "transfer-1");

    expect(result.autoMatched).toBe(true);
    expect(prismaMock.reconciliationMatch.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        transferId: "transfer-1",
        expectedPaymentId: "expected-1",
        decision: "pending",
      }),
    });
    expect(prismaMock.reconciliationMatch.update).toHaveBeenCalledWith({
      where: { id: "match-expected-1" },
      data: expect.objectContaining({
        decision: "auto_matched",
        resolvedBy: "system",
      }),
    });
    expect(prismaMock.transfer.update).toHaveBeenCalledWith({
      where: { id: "transfer-1" },
      data: { status: "matched" },
    });
    expect(prismaMock.expectedPayment.update).toHaveBeenCalledWith({
      where: { id: "expected-1" },
      data: { status: "matched" },
    });
  });

  it("keeps low confidence transfers under review", async () => {
    prismaMock.expectedPayment.findMany.mockResolvedValue([
      {
        ...expectedPayment,
        expectedAmount: 10000,
        identity: { ...expectedPayment.identity, currentName: "Different Customer" },
      },
    ]);
    prismaMock.transfer.findMany.mockResolvedValue([]);
    getKnownNamesMock.mockResolvedValue(["Different Customer"]);
    prismaMock.transfer.update.mockResolvedValue({ id: "transfer-1", status: "under_review" });

    const result = await reconcileTransfer("org-1", "transfer-1");

    expect(result.autoMatched).toBe(false);
    expect(prismaMock.transfer.update).toHaveBeenCalledWith({
      where: { id: "transfer-1" },
      data: { status: "under_review" },
    });
    expect(prismaMock.reconciliationMatch.update).not.toHaveBeenCalled();
  });

  it("resolves a match, updates records, and remembers a new trusted sender", async () => {
    prismaMock.reconciliationMatch.findFirstOrThrow.mockResolvedValue({
      id: "match-1",
      transferId: "transfer-1",
      expectedPaymentId: "expected-1",
      transfer: { id: "transfer-1", senderName: "Amina Stores Branch" },
      expectedPayment: { id: "expected-1", identityId: "identity-1" },
    });
    prismaMock.reconciliationMatch.update.mockResolvedValue({ id: "match-1", decision: "manual_resolved" });
    prismaMock.transfer.update.mockResolvedValue({ id: "transfer-1", status: "resolved" });
    prismaMock.expectedPayment.update.mockResolvedValue({ id: "expected-1", status: "matched" });
    prismaMock.customerIdentity.findFirstOrThrow.mockResolvedValue({ knownSenderNames: ["Amina Stores"] });
    prismaMock.customerIdentity.update.mockResolvedValue({
      id: "identity-1",
      knownSenderNames: ["Amina Stores", "Amina Stores Branch"],
    });

    await resolveMatch("org-1", "match-1", "ops@example.com");

    expect(prismaMock.reconciliationMatch.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: "match-1", expectedPayment: { organizationId: "org-1" } },
      include: { transfer: true, expectedPayment: true },
    });
    expect(prismaMock.reconciliationMatch.update).toHaveBeenCalledWith({
      where: { id: "match-1" },
      data: expect.objectContaining({
        decision: "manual_resolved",
        resolvedBy: "ops@example.com",
      }),
    });
    expect(prismaMock.customerIdentity.update).toHaveBeenCalledWith({
      where: { id: "identity-1" },
      data: { knownSenderNames: ["Amina Stores", "Amina Stores Branch"] },
    });
  });

  it("rejects matches only inside the current organization", async () => {
    prismaMock.reconciliationMatch.findFirstOrThrow.mockResolvedValue({ id: "match-1" });
    prismaMock.reconciliationMatch.update.mockResolvedValue({ id: "match-1", decision: "rejected" });

    await rejectMatch("org-1", "match-1", "ops@example.com");

    expect(prismaMock.reconciliationMatch.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: "match-1", expectedPayment: { organizationId: "org-1" } },
    });
    expect(prismaMock.reconciliationMatch.update).toHaveBeenCalledWith({
      where: { id: "match-1" },
      data: expect.objectContaining({
        decision: "rejected",
        resolvedBy: "ops@example.com",
      }),
    });
  });
});
