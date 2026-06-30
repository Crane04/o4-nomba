import type {
  NombaApiResponse,
  NombaTokenData,
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
  const accountId = getRequiredEnv("NOMBA_ACCOUNT_ID");
  const baseUrl = process.env.NOMBA_BASE_URL_SANDBOX ?? "https://sandbox.nomba.com";

  const response = await fetch(`${baseUrl}/v1/accounts/virtual`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      accountId,
    },
    body: JSON.stringify({ accountRef, accountName, currency }),
  });

  const payload = (await response.json()) as NombaApiResponse<NombaVirtualAccount>;
  if (payload.code !== "00" || !payload.data) {
    throw new NombaApiError(
      `Nomba virtual account creation failed: ${payload.description ?? "Unknown error"}`
    );
  }

  return payload.data;
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
  const accountId = getRequiredEnv("NOMBA_ACCOUNT_ID");
  const clientId = getRequiredEnv("NOMBA_CLIENT_ID");
  const privateKey = getRequiredEnv("NOMBA_PRIVATE_KEY");
  const authUrl = process.env.NOMBA_AUTH_URL ?? "https://api.nomba.com";

  const response = await fetch(`${authUrl}/v1/auth/token/issue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accountId,
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

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new NombaApiError(`${name} is required`);
  }

  return value;
}
