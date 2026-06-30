import { compileSchema, validate } from "./validator";
import type { ResolveMatchInput } from "./reconciliationValidator.types";

const resolveMatchCheck = compileSchema({
  $$strict: "remove",
  resolvedBy: { type: "string", empty: false, trim: true },
});

export function validateResolveMatch(payload: unknown) {
  return validate<ResolveMatchInput>(resolveMatchCheck, payload);
}
