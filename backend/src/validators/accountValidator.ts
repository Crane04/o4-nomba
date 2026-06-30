import { compileSchema, validate } from "./validator";
import type { CreateAccountInput } from "./accountValidator.types";

const createAccountCheck = compileSchema({
  $$strict: "remove",
  identityId: { type: "string", empty: false, trim: true },
  bankName: { type: "string", empty: false, trim: true, optional: true },
});

export function validateCreateAccount(payload: unknown) {
  return validate<CreateAccountInput>(createAccountCheck, payload);
}
