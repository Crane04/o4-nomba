import { vi } from "vitest";
import { collectionsData } from "./fixtures";
import type { PortalDataContextValue } from "../lib/types";

export const loadCollections = vi.fn<() => Promise<void>>();
export const loadTransfers = vi.fn<() => Promise<void>>();
export const loadReviewQueue = vi.fn<() => Promise<void>>();
export const loadRetailerDetail = vi.fn<(identityId: string) => Promise<void>>();
export const createRetailer = vi.fn<PortalDataContextValue["createRetailer"]>();
export const createInvoice = vi.fn<PortalDataContextValue["createInvoice"]>();
export const resolveCandidate = vi.fn<PortalDataContextValue["resolveCandidate"]>();
export const rejectCandidate = vi.fn<PortalDataContextValue["rejectCandidate"]>();

export function resetPortalDataMocks() {
  vi.clearAllMocks();
  loadCollections.mockResolvedValue();
  loadTransfers.mockResolvedValue();
  loadReviewQueue.mockResolvedValue();
  loadRetailerDetail.mockResolvedValue();
  createInvoice.mockResolvedValue();
  resolveCandidate.mockResolvedValue();
  rejectCandidate.mockResolvedValue();
  createRetailer.mockResolvedValue({
    id: "identity-new",
    currentName: "New Market Shop",
    kycTier: 2,
    status: "active",
  });
}

export function portalData(overrides: Partial<PortalDataContextValue> = {}): PortalDataContextValue {
  return {
    collections: { data: collectionsData, loading: false, error: "" },
    transfers: { data: [], loading: false, error: "" },
    reviewQueue: { data: [], loading: false, error: "" },
    retailerDetails: {},
    loadCollections,
    loadTransfers,
    loadReviewQueue,
    loadRetailerDetail,
    createRetailer,
    createInvoice,
    resolveCandidate,
    rejectCandidate,
    ...overrides,
  };
}
