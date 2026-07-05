export interface NombaTokenData {
  access_token: string;
  expiresAt: string;
  refresh_token: string;
}

export interface NombaApiResponse<T> {
  code: string;
  description?: string;
  message?: string;
  status?: boolean;
  data?: T;
  errors?: unknown;
}

export interface NombaVirtualAccount {
  bankAccountNumber: string;
  bankAccountName: string;
  bankName: string;
  accountRef: string;
  accountHolderId: string;
  currency: string;
  bvn?: string;
  expired: boolean;
  createdAt: string;
}

export interface CreateNombaVirtualAccountRequest {
  accountRef: string;
  accountName: string;
  currency: string;
  accountHolderId: string;
}

export interface NombaTransferRecord {
  amount?: number | string;
  senderName?: string;
  ktaSenderName?: string;
  senderAccountName?: string;
  sourceAccountName?: string;
  senderAccountNumber?: string;
  ktaSenderAccountNumber?: string;
  sourceAccountNumber?: string;
  narration?: string;
  description?: string;
  reference?: string;
  transactionReference?: string;
  paymentVendorReference?: string;
  billingVendorReference?: string;
  id?: string;
  sessionId?: string;
  virtualAccountNumber?: string;
  recipientAccountNumber?: string;
  accountNumber?: string;
  destinationAccountNumber?: string;
  bankAccountNumber?: string;
  createdAt?: string;
  paidAt?: string;
  transactionDate?: string;
}
