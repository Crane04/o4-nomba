const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
const TOKEN_KEY = "o4_portal_token";

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? body.message ?? `Request failed: ${res.status}`);
  }

  return res.json();
}

export interface Organization {
  id: string;
  name: string;
  email: string;
  apiKey?: string;
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  organization: Organization;
}

export interface RegisterResponse {
  organization: Organization;
  apiKey: string;
}

export interface MeResponse {
  organization: Pick<Organization, "id" | "name" | "email">;
}

export interface Identity {
  id: string;
  currentName: string;
  kycTier: number;
  status: string;
  virtualAccounts?: VirtualAccount[];
  expectedPayments?: ExpectedPayment[];
}

export interface VirtualAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  status: string;
  identityId: string;
  identity: Pick<Identity, "id" | "currentName" | "kycTier" | "status">;
}

export interface ExpectedPayment {
  id: string;
  identityId: string;
  expectedAmount: number;
  label: string;
  dueDate: string | null;
  status: string;
  createdAt: string;
  identity?: Pick<Identity, "id" | "currentName" | "kycTier" | "status">;
}

export interface Transfer {
  id: string;
  virtualAccountId: string;
  amount: number;
  senderName: string;
  reference: string | null;
  narration?: string | null;
  receivedAt: string;
  status: string;
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
  expectedPayment: {
    label: string;
    expectedAmount: number;
    identity: { currentName: string };
  };
}

export interface ReviewTransfer extends Transfer {
  matches: ReconciliationMatch[];
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<MeResponse>("/auth/me"),
  getIdentities: () => request<Identity[]>("/identities"),
  createIdentity: (name: string, kycTier: number) =>
    request<Identity>("/identities", {
      method: "POST",
      body: JSON.stringify({ name, kycTier }),
    }),
  getIdentity: (id: string) => request<Identity>(`/identities/${id}`),
  getIdentityHistory: (id: string) => request<IdentityEvent[]>(`/identities/${id}/history`),
  getAccounts: () => request<VirtualAccount[]>("/accounts"),
  createAccount: (identityId: string) =>
    request<VirtualAccount>("/accounts", {
      method: "POST",
      body: JSON.stringify({ identityId }),
    }),
  getAccountTransfers: (id: string) => request<Transfer[]>(`/accounts/${id}/transfers`),
  getExpectedPayments: (status?: string) =>
    request<ExpectedPayment[]>(`/expected-payments${status ? `?status=${status}` : ""}`),
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
  getReviewQueue: () => request<ReviewTransfer[]>("/reconciliation/queue"),
  resolveMatch: (matchId: string, resolvedBy: string) =>
    request(`/reconciliation/matches/${matchId}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolvedBy }),
    }),
  rejectMatch: (matchId: string, resolvedBy: string) =>
    request(`/reconciliation/matches/${matchId}/reject`, {
      method: "POST",
      body: JSON.stringify({ resolvedBy }),
    }),
};
