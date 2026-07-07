import type {
  AccountTransfer,
  CollectionsData,
  Identity,
  IdentityEvent,
  ReviewTransfer,
  Transfer,
  TransferWithAccount,
  VirtualAccount,
} from "../lib/types";

export const aminaIdentity: Identity = {
  id: "identity-1",
  currentName: "Amina Stores",
  kycTier: 2,
  status: "active",
};

export const belloIdentity: Identity = {
  id: "identity-2",
  currentName: "Bello Mart",
  kycTier: 1,
  status: "active",
};

export const aminaAccount: VirtualAccount = {
  id: "account-1",
  accountNumber: "1234567890",
  bankName: "Nomba",
  status: "active",
  identityId: aminaIdentity.id,
  identity: aminaIdentity,
};

export const belloAccount: VirtualAccount = {
  id: "account-2",
  accountNumber: "0987654321",
  bankName: "Nomba",
  status: "active",
  identityId: belloIdentity.id,
  identity: belloIdentity,
};

export const collectionTransfer: AccountTransfer = {
  id: "transfer-1",
  virtualAccountId: aminaAccount.id,
  amount: 40000,
  senderName: "Amina Stores",
  reference: "ref-1",
  receivedAt: "2026-01-05T09:30:00.000Z",
  status: "matched",
  account: aminaAccount,
};

export const underReviewTransfer: TransferWithAccount = {
  id: "transfer-2",
  virtualAccountId: belloAccount.id,
  amount: 25000,
  senderName: "Bello Limited",
  reference: "BEL-2026",
  receivedAt: "2026-01-06T10:45:00.000Z",
  status: "under_review",
  virtualAccount: belloAccount,
};

export const matchedTransfer: TransferWithAccount = {
  id: "transfer-3",
  virtualAccountId: aminaAccount.id,
  amount: 40000,
  senderName: "Amina Stores",
  reference: "AMI-2026",
  receivedAt: "2026-01-05T09:30:00.000Z",
  status: "matched",
  virtualAccount: aminaAccount,
};

export const collectionsData: CollectionsData = {
  identities: [aminaIdentity, belloIdentity],
  accounts: [aminaAccount, belloAccount],
  expectedPayments: [
    {
      id: "expected-1",
      identityId: aminaIdentity.id,
      expectedAmount: 100000,
      label: "January invoice",
      dueDate: null,
      status: "pending",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "expected-2",
      identityId: belloIdentity.id,
      expectedAmount: 50000,
      label: "February invoice",
      dueDate: null,
      status: "pending",
      createdAt: "2026-02-01T00:00:00.000Z",
    },
  ],
  transfers: [collectionTransfer],
};

export const retailerTransfers: Transfer[] = [
  {
    id: "transfer-4",
    virtualAccountId: aminaAccount.id,
    amount: 40000,
    senderName: "Amina Stores",
    reference: "retailer-ref",
    receivedAt: "2026-01-05T09:30:00.000Z",
    status: "matched",
  },
];

export const retailerHistory: IdentityEvent[] = [
  {
    id: "history-1",
    type: "created",
    previousValue: null,
    newValue: JSON.stringify({ name: "Amina Stores", kycTier: 2 }),
    reason: null,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

export const reviewTransfer: ReviewTransfer = {
  id: "review-transfer-1",
  virtualAccountId: belloAccount.id,
  amount: 50000,
  senderName: "Bello Ltd",
  reference: "review-ref",
  receivedAt: "2026-01-07T08:00:00.000Z",
  status: "under_review",
  matches: [
    {
      id: "match-1",
      expectedPaymentId: "expected-2",
      confidenceScore: 0.84,
      amountScore: 0.9,
      nameScore: 0.8,
      timingScore: 0.7,
      historyScore: 0.6,
      reasoning: "Amount and retailer name are close enough for review.",
      decision: "review",
      expectedPayment: {
        label: "February invoice",
        expectedAmount: 50000,
        identity: { currentName: "Bello Mart" },
      },
    },
  ],
};
