export interface CreateIdentityInput {
  name: string;
  kycTier?: number;
}

export interface RenameIdentityInput {
  newName: string;
  reason?: string;
}

export interface ChangeKycTierInput {
  newTier: number;
  reason?: string;
}

export interface CloseIdentityInput {
  reason?: string;
}
