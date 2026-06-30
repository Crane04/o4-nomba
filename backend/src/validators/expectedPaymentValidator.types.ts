export interface CreateExpectedPaymentInput {
  identityId: string;
  expectedAmount: number;
  label: string;
  dueDate?: string;
}

export interface ListExpectedPaymentsQuery {
  status?: string;
}
