import { createContext, ReactNode, useCallback, useContext, useMemo, useReducer } from "react";
import { api } from "./api";
import { loadCollectionsData } from "./collections";
import type {
  CreateInvoiceInput,
  PortalDataAction,
  PortalDataContextValue,
  PortalDataState,
  RetailerDetailData,
} from "./types";

const emptyRetailerDetail: RetailerDetailData = {
  identity: null,
  account: null,
  expectedPayments: [],
  transfers: [],
  history: [],
};

const initialState: PortalDataState = {
  collections: { data: null, loading: true, error: "" },
  transfers: { data: [], loading: true, error: "" },
  reviewQueue: { data: [], loading: true, error: "" },
  retailerDetails: {},
};

const PortalDataContext = createContext<PortalDataContextValue | null>(null);

function reducer(state: PortalDataState, action: PortalDataAction): PortalDataState {
  switch (action.type) {
    case "collections/loading":
      return { ...state, collections: { ...state.collections, loading: true, error: "" } };
    case "collections/success":
      return { ...state, collections: { data: action.data, loading: false, error: "" } };
    case "collections/error":
      return { ...state, collections: { ...state.collections, loading: false, error: action.error } };
    case "transfers/loading":
      return { ...state, transfers: { ...state.transfers, loading: true, error: "" } };
    case "transfers/success":
      return { ...state, transfers: { data: action.data, loading: false, error: "" } };
    case "transfers/error":
      return { ...state, transfers: { ...state.transfers, loading: false, error: action.error } };
    case "review/loading":
      return { ...state, reviewQueue: { ...state.reviewQueue, loading: true, error: "" } };
    case "review/success":
      return { ...state, reviewQueue: { data: action.data, loading: false, error: "" } };
    case "review/error":
      return { ...state, reviewQueue: { ...state.reviewQueue, loading: false, error: action.error } };
    case "retailer/loading": {
      const current = state.retailerDetails[action.identityId] ?? { data: emptyRetailerDetail, loading: false, error: "" };
      return {
        ...state,
        retailerDetails: {
          ...state.retailerDetails,
          [action.identityId]: { ...current, loading: true, error: "" },
        },
      };
    }
    case "retailer/success":
      return {
        ...state,
        retailerDetails: {
          ...state.retailerDetails,
          [action.identityId]: { data: action.data, loading: false, error: "" },
        },
      };
    case "retailer/error": {
      const current = state.retailerDetails[action.identityId] ?? { data: emptyRetailerDetail, loading: false, error: "" };
      return {
        ...state,
        retailerDetails: {
          ...state.retailerDetails,
          [action.identityId]: { ...current, loading: false, error: action.error },
        },
      };
    }
    default:
      return state;
  }
}

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

async function fetchRetailerDetail(identityId: string): Promise<RetailerDetailData> {
  const [identity, accounts] = await Promise.all([api.getIdentity(identityId), api.getAccounts()]);
  const account = identity.virtualAccounts?.[0] ?? accounts.find((candidate) => candidate.identityId === identityId) ?? null;
  const accountTransfers = account ? await api.getAccountTransfers(account.id) : [];
  const [allExpectedPayments, history] = await Promise.all([
    api.getExpectedPayments(),
    api.getIdentityHistory(identityId),
  ]);

  return {
    identity,
    account,
    expectedPayments: allExpectedPayments.filter((payment) => payment.identityId === identityId),
    transfers: accountTransfers,
    history,
  };
}

export function PortalDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadCollections = useCallback(async () => {
    dispatch({ type: "collections/loading" });

    try {
      dispatch({ type: "collections/success", data: await loadCollectionsData() });
    } catch (err) {
      dispatch({ type: "collections/error", error: errorMessage(err, "Could not load collection data") });
    }
  }, []);

  const loadTransfers = useCallback(async () => {
    dispatch({ type: "transfers/loading" });

    try {
      dispatch({ type: "transfers/success", data: await api.getTransfers() });
    } catch (err) {
      dispatch({ type: "transfers/error", error: errorMessage(err, "Could not load transfers") });
    }
  }, []);

  const loadReviewQueue = useCallback(async () => {
    dispatch({ type: "review/loading" });

    try {
      dispatch({ type: "review/success", data: await api.getReviewQueue() });
    } catch (err) {
      dispatch({ type: "review/error", error: errorMessage(err, "Could not load flagged payments") });
    }
  }, []);

  const loadRetailerDetail = useCallback(async (identityId: string) => {
    dispatch({ type: "retailer/loading", identityId });

    try {
      dispatch({ type: "retailer/success", identityId, data: await fetchRetailerDetail(identityId) });
    } catch (err) {
      dispatch({ type: "retailer/error", identityId, error: errorMessage(err, "Could not load retailer profile") });
    }
  }, []);

  const createRetailer = useCallback(
    async (name: string, kycTier: number) => {
      const identity = await api.createIdentity(name, kycTier);
      await api.createAccount(identity.id);
      await loadCollections();
      return identity;
    },
    [loadCollections]
  );

  const createInvoice = useCallback(
    async (input: CreateInvoiceInput) => {
      await api.createExpectedPayment(input);
      await Promise.all([loadCollections(), loadRetailerDetail(input.identityId)]);
    },
    [loadCollections, loadRetailerDetail]
  );

  const resolveCandidate = useCallback(
    async (matchId: string, resolvedBy: string) => {
      await api.resolveMatch(matchId, resolvedBy);
      await Promise.all([loadReviewQueue(), loadCollections(), loadTransfers()]);
    },
    [loadCollections, loadReviewQueue, loadTransfers]
  );

  const rejectCandidate = useCallback(
    async (matchId: string, resolvedBy: string) => {
      await api.rejectMatch(matchId, resolvedBy);
      await Promise.all([loadReviewQueue(), loadCollections(), loadTransfers()]);
    },
    [loadCollections, loadReviewQueue, loadTransfers]
  );

  const value = useMemo<PortalDataContextValue>(
    () => ({
      ...state,
      loadCollections,
      loadTransfers,
      loadReviewQueue,
      loadRetailerDetail,
      createRetailer,
      createInvoice,
      resolveCandidate,
      rejectCandidate,
    }),
    [
      state,
      loadCollections,
      loadTransfers,
      loadReviewQueue,
      loadRetailerDetail,
      createRetailer,
      createInvoice,
      resolveCandidate,
      rejectCandidate,
    ]
  );

  return <PortalDataContext.Provider value={value}>{children}</PortalDataContext.Provider>;
}

export function usePortalData() {
  const context = useContext(PortalDataContext);
  if (!context) throw new Error("usePortalData must be used inside PortalDataProvider");
  return context;
}

export function useRetailerDetail(identityId: string | undefined) {
  const { retailerDetails } = usePortalData();
  return identityId ? retailerDetails[identityId] ?? { data: emptyRetailerDetail, loading: false, error: "" } : null;
}
