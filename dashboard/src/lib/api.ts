const BASE_URL = "http://localhost:4000";

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

export const api = {
  getAccounts: () => request<VirtualAccount[]>("/accounts"),
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
