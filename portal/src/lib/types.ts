import type { ComponentPropsWithoutRef } from "react";
import type { LinkProps } from "react-router-dom";

export type ButtonVariant = "primary" | "outline";
export type LogoMarkSize = "sm" | "md" | "lg";

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
}

export interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
}

export interface LogoMarkProps {
  size?: LogoMarkSize;
  centered?: boolean;
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

export interface TransferWithAccount extends Transfer {
  virtualAccount: VirtualAccount;
  matches?: Array<{
    id: string;
    confidenceScore: number;
    decision: string;
    expectedPayment?: Pick<ExpectedPayment, "id" | "label" | "expectedAmount" | "status">;
  }>;
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

export interface AccountTransfer extends Transfer {
  account: VirtualAccount;
}

export interface CollectionsData {
  identities: Identity[];
  accounts: VirtualAccount[];
  expectedPayments: ExpectedPayment[];
  transfers: AccountTransfer[];
}

export interface AsyncSlice<T> {
  data: T;
  loading: boolean;
  error: string;
}

export interface RetailerDetailData {
  identity: Identity | null;
  account: VirtualAccount | null;
  expectedPayments: ExpectedPayment[];
  transfers: Transfer[];
  history: IdentityEvent[];
}

export interface PortalDataState {
  collections: AsyncSlice<CollectionsData | null>;
  transfers: AsyncSlice<TransferWithAccount[]>;
  reviewQueue: AsyncSlice<ReviewTransfer[]>;
  retailerDetails: Record<string, AsyncSlice<RetailerDetailData>>;
}

export interface CreateInvoiceInput {
  identityId: string;
  expectedAmount: number;
  label: string;
  dueDate?: string;
}

export interface PortalDataContextValue extends PortalDataState {
  loadCollections: () => Promise<void>;
  loadTransfers: () => Promise<void>;
  loadReviewQueue: () => Promise<void>;
  loadRetailerDetail: (identityId: string) => Promise<void>;
  createRetailer: (name: string, kycTier: number) => Promise<Identity>;
  createInvoice: (input: CreateInvoiceInput) => Promise<void>;
  resolveCandidate: (matchId: string, resolvedBy: string) => Promise<void>;
  rejectCandidate: (matchId: string, resolvedBy: string) => Promise<void>;
}

export interface AuthContextValue {
  organization: Organization | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export type PortalDataAction =
  | { type: "collections/loading" }
  | { type: "collections/success"; data: CollectionsData }
  | { type: "collections/error"; error: string }
  | { type: "transfers/loading" }
  | { type: "transfers/success"; data: TransferWithAccount[] }
  | { type: "transfers/error"; error: string }
  | { type: "review/loading" }
  | { type: "review/success"; data: ReviewTransfer[] }
  | { type: "review/error"; error: string }
  | { type: "retailer/loading"; identityId: string }
  | { type: "retailer/success"; identityId: string; data: RetailerDetailData }
  | { type: "retailer/error"; identityId: string; error: string };
