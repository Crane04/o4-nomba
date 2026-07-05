import type {
  NombaApiResponse,
  CreateNombaVirtualAccountRequest,
  NombaTokenData,
  NombaTransferRecord,
  NombaVirtualAccount,
} from "./nombaClient.types";

export class NombaApiError extends Error {
  statusCode = 502;
}

let cachedToken: { accessToken: string; expiresAtMs: number } | null = null;

export async function createVirtualAccount(
  accountRef: string,
  accountName: string,
  currency = "NGN"
): Promise<NombaVirtualAccount> {
  const token = await getAccessToken();
  const parentAccountId = getParentAccountId();
  const subAccountId = getRequiredEnv("NOMBA_SUB_ACCOUNT_ID");
  const baseUrl = getNombaBaseUrl();
  const body: CreateNombaVirtualAccountRequest = {
    accountRef,
    accountName: normalizeAccountName(accountName),
    currency,
    accountHolderId: subAccountId,
  };
  const virtualAccountUrl = `${baseUrl}/v1/accounts/virtual`;

  console.info("[nomba] creating_virtual_account", {
    endpoint: "/v1/accounts/virtual",
    accountRef,
    currency,
  });

  const response = await fetch(virtualAccountUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      accountId: parentAccountId,
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as NombaApiResponse<NombaVirtualAccount>;
  if (payload.code !== "00" || !payload.data) {
    throw new NombaApiError(`Nomba virtual account creation failed: ${formatNombaError(payload)}`);
  }

  return payload.data;
}

export async function listVirtualAccountTransfers(accountNumber: string): Promise<NombaTransferRecord[]> {
  const token = await getAccessToken();
  const parentAccountId = getParentAccountId();
  const baseUrl = getNombaBaseUrl();
  const transferPath = getTransferListPath(accountNumber);

  console.info("[nomba] listing_recent_transfers", {
    endpoint: transferPath.replace(encodeURIComponent(accountNumber), ":accountNumber"),
    accountNumber,
  });

  const response = await fetch(`${baseUrl}${transferPath}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      accountId: parentAccountId,
    },
  });

  const payload = (await response.json()) as NombaApiResponse<unknown>;
  if (payload.code !== "00" || !payload.data) {
    throw new NombaApiError(`Nomba transfer sync failed: ${formatNombaError(payload)}`);
  }

  return extractTransferRecords(payload.data);
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAtMs - Date.now() > 60_000) {
    return cachedToken.accessToken;
  }

  const token = await issueAccessToken();
  cachedToken = token;
  return token.accessToken;
}

async function issueAccessToken() {
  const parentAccountId = getParentAccountId();
  const clientId = getRequiredEnv("NOMBA_CLIENT_ID");
  const privateKey = getRequiredEnv("NOMBA_PRIVATE_KEY");
  const authUrl = process.env.NOMBA_AUTH_URL ?? "https://api.nomba.com";

  const response = await fetch(`${authUrl}/v1/auth/token/issue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accountId: parentAccountId,
    },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: privateKey,
    }),
  });

  const payload = (await response.json()) as NombaApiResponse<NombaTokenData>;
  if (payload.code !== "00" || !payload.data) {
    throw new NombaApiError(`Nomba token issue failed: ${payload.description ?? "Unknown error"}`);
  }

  return {
    accessToken: payload.data.access_token,
    expiresAtMs: new Date(payload.data.expiresAt).getTime(),
  };
}

function getParentAccountId(): string {
  return process.env.NOMBA_PARENT_ACCOUNT_ID ?? getRequiredEnv("NOMBA_ACCOUNT_ID");
}

function getNombaBaseUrl(): string {
  return process.env.NOMBA_BASE_URL ?? process.env.NOMBA_BASE_URL_SANDBOX ?? "https://sandbox.nomba.com";
}

function getTransferListPath(accountNumber: string): string {
  const configuredPath =
    process.env.NOMBA_TRANSFERS_PATH ?? "/v1/transactions/virtual?virtual_account={accountNumber}";

  return configuredPath.replace("{accountNumber}", encodeURIComponent(accountNumber));
}

function normalizeAccountName(accountName: string): string {
  const normalized = accountName
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || "OhFour Customer";
}

function formatNombaError(payload: NombaApiResponse<unknown>): string {
  const base = payload.description ?? payload.message ?? "Unknown error";
  if (!payload.errors) return base;

  return `${base} (${JSON.stringify(payload.errors)})`;
}

function extractTransferRecords(data: unknown): NombaTransferRecord[] {
  if (Array.isArray(data)) return data as NombaTransferRecord[];
  if (!data || typeof data !== "object") return [];

  const record = data as Record<string, unknown>;
  const candidates = [record.transactions, record.transfers, record.items, record.content, record.results];
  const list = candidates.find(Array.isArray);

  return (list ?? []) as NombaTransferRecord[];
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new NombaApiError(`${name} is required`);
  }

  return value;
}
