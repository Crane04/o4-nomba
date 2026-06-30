import { compileSchema, validate } from "./validator.js";

export interface ResolveMatchInput {
  resolvedBy: string;
}

const resolveMatchCheck = compileSchema({
  $$strict: "remove",
  resolvedBy: { type: "string", empty: false, trim: true },
});

export function validateResolveMatch(payload: unknown) {
  return validate<ResolveMatchInput>(resolveMatchCheck, payload);
}
