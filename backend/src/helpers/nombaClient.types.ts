export interface NombaTokenData {
  access_token: string;
  expiresAt: string;
  refresh_token: string;
}

export interface NombaApiResponse<T> {
  code: string;
  description?: string;
  status?: boolean;
  data?: T;
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
