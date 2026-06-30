export interface TransferInput {
  amount: number;
  senderName: string;
  receivedAt: Date;
}

export interface ExpectedPaymentCandidate {
  id: string;
  expectedAmount: number;
  label: string;
  dueDate: Date | null;
  identityCurrentName: string;
  identityKnownNames: string[];
  priorSenderNames: string[];
}

export interface ScoredMatch {
  expectedPaymentId: string;
  confidenceScore: number;
  amountScore: number;
  nameScore: number;
  timingScore: number;
  historyScore: number;
  reasoning: string;
}
