import { compileSchema, validate } from "./validator.js";

export interface CreateExpectedPaymentInput {
  identityId: string;
  expectedAmount: number;
  label: string;
  dueDate?: string;
}

export interface ListExpectedPaymentsQuery {
  status?: string;
}

const createExpectedPaymentCheck = compileSchema({
  $$strict: "remove",
  identityId: { type: "string", empty: false, trim: true },
  expectedAmount: { type: "number", positive: true },
  label: { type: "string", empty: false, trim: true },
  dueDate: { type: "string", empty: false, trim: true, optional: true },
});

const listExpectedPaymentsCheck = compileSchema({
  $$strict: "remove",
  status: { type: "string", empty: false, trim: true, optional: true },
});

export function validateCreateExpectedPayment(payload: unknown) {
  return validate<CreateExpectedPaymentInput>(createExpectedPaymentCheck, payload);
}

export function validateListExpectedPayments(payload: unknown) {
  return validate<ListExpectedPaymentsQuery>(listExpectedPaymentsCheck, payload);
}
