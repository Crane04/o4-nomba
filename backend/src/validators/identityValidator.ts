import { compileSchema, validate } from "./validator.js";

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

const createIdentityCheck = compileSchema({
  $$strict: "remove",
  name: { type: "string", empty: false, trim: true },
  kycTier: { type: "number", integer: true, min: 1, max: 3, optional: true },
});

const renameIdentityCheck = compileSchema({
  $$strict: "remove",
  newName: { type: "string", empty: false, trim: true },
  reason: { type: "string", empty: false, trim: true, optional: true },
});

const changeKycTierCheck = compileSchema({
  $$strict: "remove",
  newTier: { type: "number", integer: true, min: 1, max: 3 },
  reason: { type: "string", empty: false, trim: true, optional: true },
});

const closeIdentityCheck = compileSchema({
  $$strict: "remove",
  reason: { type: "string", empty: false, trim: true, optional: true },
});

export function validateCreateIdentity(payload: unknown) {
  return validate<CreateIdentityInput>(createIdentityCheck, payload);
}

export function validateRenameIdentity(payload: unknown) {
  return validate<RenameIdentityInput>(renameIdentityCheck, payload);
}

export function validateChangeKycTier(payload: unknown) {
  return validate<ChangeKycTierInput>(changeKycTierCheck, payload);
}

export function validateCloseIdentity(payload: unknown) {
  return validate<CloseIdentityInput>(closeIdentityCheck, payload);
}
