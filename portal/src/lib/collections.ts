import { api, ExpectedPayment, Identity, Transfer, VirtualAccount } from "./api";

const BUSINESS_TYPE_BY_ID: Record<string, string> = {};

export function getBusinessType(identityId: string) {
  return BUSINESS_TYPE_BY_ID[identityId] ?? "Retailer";
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | null | undefined) {
  if (!date) return "No date";
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function isCollectedStatus(status: string) {
  const normalized = status.toLowerCase();
  return normalized === "matched" || normalized === "resolved";
}

export function transferDisplayStatus(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "matched" || normalized === "resolved") return "Matched";
  if (normalized === "under_review" || normalized === "review" || normalized === "pending_review") {
    return "Under Review";
  }
  return "Unmatched";
}

export function paymentStatus(invoiced: number, collected: number) {
  if (invoiced > 0 && collected >= invoiced) return "Cleared";
  if (collected > 0) return "Partial";
  return "Outstanding";
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

export async function loadCollectionsData(): Promise<CollectionsData> {
  const [identities, accounts, expectedPayments] = await Promise.all([
    api.getIdentities(),
    api.getAccounts(),
    api.getExpectedPayments(),
  ]);

  const transferGroups = await Promise.all(
    accounts.map(async (account) => {
      const transfers = await api.getAccountTransfers(account.id);
      return transfers.map((transfer) => ({ ...transfer, account }));
    })
  );

  return {
    identities,
    accounts,
    expectedPayments,
    transfers: transferGroups.flat(),
  };
}

export function invoiceTotalFor(identityId: string, expectedPayments: ExpectedPayment[]) {
  return expectedPayments
    .filter((payment) => payment.identityId === identityId)
    .reduce((sum, payment) => sum + payment.expectedAmount, 0);
}

export function collectedTotalFor(identityId: string, transfers: AccountTransfer[]) {
  return transfers
    .filter((transfer) => transfer.account.identityId === identityId && isCollectedStatus(transfer.status))
    .reduce((sum, transfer) => sum + transfer.amount, 0);
}
