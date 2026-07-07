import { vi } from "vitest";

export const prismaMock = {
  organization: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
  customerIdentity: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findFirstOrThrow: vi.fn(),
    update: vi.fn(),
  },
  identityEvent: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  virtualAccount: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    updateMany: vi.fn(),
  },
  expectedPayment: {
    findMany: vi.fn(),
    update: vi.fn(),
  },
  transfer: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
  },
  reconciliationMatch: {
    create: vi.fn(),
    findFirstOrThrow: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(async (operations: unknown[]) => Promise.all(operations)),
};

export function resetPrismaMock() {
  for (const model of Object.values(prismaMock)) {
    if (typeof model === "function") {
      model.mockReset();
      continue;
    }

    for (const method of Object.values(model)) {
      if (typeof method === "function" && "mockReset" in method) {
        method.mockReset();
      }
    }
  }

  prismaMock.$transaction.mockImplementation(async (operations: unknown[]) => Promise.all(operations));
}
