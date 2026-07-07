import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "./mockPrisma";
import { processTransferWebhook } from "../services/webhookService";
import { reconcileTransfer } from "../services/reconciliationService";
import type { NombaTransferPayload } from "../services/webhookService.types";

vi.mock("../lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("../services/reconciliationService", () => ({
  reconcileTransfer: vi.fn(),
}));

const reconcileTransferMock = vi.mocked(reconcileTransfer);

const payload: NombaTransferPayload = {
  amount: 50000,
  senderName: "Amina Stores",
  senderAccountNumber: "0011223344",
  narration: "Invoice payment",
  reference: "nomba-ref-1",
  virtualAccountNumber: "1234567890",
};

describe("webhookService", () => {
  beforeEach(() => {
    resetPrismaMock();
    reconcileTransferMock.mockReset();
  });

  it("ignores duplicate transfer references", async () => {
    prismaMock.transfer.findUnique.mockResolvedValue({ id: "transfer-existing" });

    await expect(processTransferWebhook(payload)).resolves.toEqual({
      status: "duplicate",
      transferId: "transfer-existing",
    });

    expect(prismaMock.transfer.create).not.toHaveBeenCalled();
    expect(reconcileTransferMock).not.toHaveBeenCalled();
  });

  it("rejects account numbers outside the provided organization", async () => {
    prismaMock.transfer.findUnique.mockResolvedValue(null);
    prismaMock.virtualAccount.findUnique.mockResolvedValue({
      id: "account-1",
      organizationId: "org-other",
    });

    await expect(processTransferWebhook(payload, { organizationId: "org-1" })).resolves.toEqual({
      status: "account_not_found",
      transferId: null,
    });

    expect(prismaMock.transfer.create).not.toHaveBeenCalled();
    expect(reconcileTransferMock).not.toHaveBeenCalled();
  });

  it("creates an under-review transfer when the virtual account is unknown", async () => {
    prismaMock.transfer.findUnique.mockResolvedValue(null);
    prismaMock.virtualAccount.findUnique.mockResolvedValue(null);
    prismaMock.transfer.create.mockResolvedValue({ id: "transfer-1" });
    prismaMock.transfer.update.mockResolvedValue({ id: "transfer-1", status: "under_review" });

    await expect(processTransferWebhook(payload)).resolves.toEqual({
      status: "created",
      transferId: "transfer-1",
      autoMatched: false,
      topMatch: null,
    });

    expect(prismaMock.transfer.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        amount: 50000,
        senderName: "Amina Stores",
        reference: "nomba-ref-1",
        virtualAccountId: undefined,
      }),
    });
    expect(prismaMock.transfer.update).toHaveBeenCalledWith({
      where: { id: "transfer-1" },
      data: { status: "under_review" },
    });
    expect(reconcileTransferMock).not.toHaveBeenCalled();
  });

  it("creates known-account transfers and delegates reconciliation", async () => {
    prismaMock.transfer.findUnique.mockResolvedValue(null);
    prismaMock.virtualAccount.findUnique.mockResolvedValue({
      id: "account-1",
      organizationId: "org-1",
    });
    prismaMock.transfer.create.mockResolvedValue({ id: "transfer-1" });
    reconcileTransferMock.mockResolvedValue({
      transfer: { id: "transfer-1" },
      matches: [{ expectedPaymentId: "expected-1", confidenceScore: 0.95 }],
      autoMatched: true,
      threshold: 0.85,
    } as Awaited<ReturnType<typeof reconcileTransfer>>);

    await expect(processTransferWebhook(payload)).resolves.toEqual({
      status: "created",
      transferId: "transfer-1",
      autoMatched: true,
      topMatch: { expectedPaymentId: "expected-1", confidenceScore: 0.95 },
    });

    expect(prismaMock.transfer.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        reference: "nomba-ref-1",
        virtualAccountId: "account-1",
      }),
    });
    expect(reconcileTransferMock).toHaveBeenCalledWith("org-1", "transfer-1");
  });
});
