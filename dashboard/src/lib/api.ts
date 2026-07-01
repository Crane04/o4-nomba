const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export interface VirtualAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  status: string;
  identityId: string;
  identity: { id: string; currentName: string; kycTier: number; status: string };
}

export interface Identity {
  id: string;
  currentName: string;
  kycTier: number;
  status: string;
  virtualAccounts?: VirtualAccount[];
}

export interface IdentityEvent {
  id: string;
  type: string;
  previousValue: string | null;
  newValue: string | null;
  reason: string | null;
  createdAt: string;
}

export interface ReconciliationMatch {
  id: string;
  expectedPaymentId: string;
  confidenceScore: number;
  amountScore: number;
  nameScore: number;
  timingScore: number;
  historyScore: number;
  reasoning: string;
  decision: string;
  expectedPayment: { label: string; expectedAmount: number; identity: { currentName: string } };
}

export interface TransferWithMatches {
  id: string;
  amount: number;
  senderName: string;
  reference: string | null;
  receivedAt: string;
  status: string;
  matches: ReconciliationMatch[];
}

export interface ExpectedPayment {
  id: string;
  identityId: string;
  expectedAmount: number;
  label: string;
  dueDate: string | null;
  status: string;
  createdAt: string;
  identity: { currentName: string; kycTier: number; status: string };
}

export interface SimulatedTransferResult {
  status: "created" | "duplicate";
  transferId: string;
  autoMatched?: boolean;
  topMatch?: {
    expectedPaymentId: string;
    confidenceScore: number;
    reasoning: string;
  } | null;
}

export const api = {
  getAccounts: () => request<VirtualAccount[]>("/accounts"),
  createAccount: (identityId: string) =>
    request<VirtualAccount>("/accounts", {
      method: "POST",
      body: JSON.stringify({ identityId }),
    }),
  getIdentities: () => request<Identity[]>("/identities"),
  createIdentity: (name: string, kycTier: number) =>
    request<Identity>("/identities", {
      method: "POST",
      body: JSON.stringify({ name, kycTier }),
    }),
  getExpectedPayments: () => request<ExpectedPayment[]>("/expected-payments"),
  createExpectedPayment: (input: {
    identityId: string;
    expectedAmount: number;
    label: string;
    dueDate?: string;
  }) =>
    request<ExpectedPayment>("/expected-payments", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  simulateTransfer: (input: {
    amount: number;
    senderName: string;
    reference: string;
    virtualAccountNumber: string;
  }) =>
    request<SimulatedTransferResult>("/demo/transfers", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  getIdentity: (id: string) => request<any>(`/identities/${id}`),
  getIdentityHistory: (id: string) => request<IdentityEvent[]>(`/identities/${id}/history`),
  getReviewQueue: () => request<TransferWithMatches[]>("/reconciliation/queue"),
  resolveMatch: (id: string, resolvedBy: string) =>
    request(`/reconciliation/matches/${id}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolvedBy }),
    }),
  rejectMatch: (id: string, resolvedBy: string) =>
    request(`/reconciliation/matches/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ resolvedBy }),
    }),
};
