import { compileSchema, validate } from "./validator";
import type { LoginOrgInput, RegisterOrgInput } from "./authValidator.types";

const registerOrgCheck = compileSchema({
  $$strict: "remove",
  name: { type: "string", empty: false, trim: true },
  email: { type: "email", empty: false, normalize: true },
  password: { type: "string", min: 8 },
});

const loginOrgCheck = compileSchema({
  $$strict: "remove",
  email: { type: "email", empty: false, normalize: true },
  password: { type: "string", empty: false },
});

export function validateRegisterOrg(payload: unknown) {
  return validate<RegisterOrgInput>(registerOrgCheck, payload);
}

export function validateLoginOrg(payload: unknown) {
  return validate<LoginOrgInput>(loginOrgCheck, payload);
}
