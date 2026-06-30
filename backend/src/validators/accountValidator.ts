import { compileSchema, validate } from "./validator.js";

export interface CreateAccountInput {
  identityId: string;
  bankName?: string;
}

const createAccountCheck = compileSchema({
  $$strict: "remove",
  identityId: { type: "string", empty: false, trim: true },
  bankName: { type: "string", empty: false, trim: true, optional: true },
});

export function validateCreateAccount(payload: unknown) {
  return validate<CreateAccountInput>(createAccountCheck, payload);
}
