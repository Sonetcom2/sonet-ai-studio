
const FLUTTERWAVE_TOKEN_URL =
  "https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token";

const FLUTTERWAVE_API_BASE =
  process.env.FLUTTERWAVE_ENVIRONMENT === "production"
    ? "https://f4bexperience.flutterwave.com"
    : "https://developersandbox-api.flutterwave.com";

type FlutterwaveTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

type FlutterwaveErrorResponse = {
  error?: string;
  error_description?: string;
  message?: string;
};

let cachedToken: {
  accessToken: string;
  expiresAt: number;
} | null = null;

/**
 * Get a Flutterwave V4 OAuth access token.
 *
 * V4 authentication uses:
 * CLIENT ID + CLIENT SECRET
 *
 * Tokens are cached server-side and refreshed
 * shortly before expiration.
 */
export async function getFlutterwaveAccessToken(): Promise<string> {
  const clientId = process.env.FLUTTERWAVE_CLIENT_ID;
  const clientSecret = process.env.FLUTTERWAVE_CLIENT_SECRET;

  if (!clientId) {
    throw new Error(
      "FLUTTERWAVE_CLIENT_ID is not configured."
    );
  }

  if (!clientSecret) {
    throw new Error(
      "FLUTTERWAVE_CLIENT_SECRET is not configured."
    );
  }

  const now = Date.now();

  if (
    cachedToken &&
    cachedToken.expiresAt > now + 30_000
  ) {
    return cachedToken.accessToken;
  }

  const body = new URLSearchParams();

  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);
  body.set("grant_type", "client_credentials");

  const response = await fetch(
    FLUTTERWAVE_TOKEN_URL,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    }
  );

  const contentType =
    response.headers.get("content-type") || "";

  const rawBody = await response.text();

  let data:
    | FlutterwaveTokenResponse
    | FlutterwaveErrorResponse;

  if (contentType.includes("application/json")) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      throw new Error(
        "Flutterwave authentication returned invalid JSON."
      );
    }
  } else {
    throw new Error(
      `Flutterwave authentication returned a non-JSON response (${response.status}).`
    );
  }

  if (
    !response.ok ||
    !("access_token" in data) ||
    !data.access_token
  ) {
    const errorData =
      data as FlutterwaveErrorResponse;

    const message =
      errorData.error_description ||
      errorData.message ||
      errorData.error ||
      "Unable to authenticate with Flutterwave.";

    throw new Error(message);
  }

  const expiresIn =
    Number(data.expires_in) || 600;

  cachedToken = {
    accessToken: data.access_token,
    expiresAt:
      now + expiresIn * 1000,
  };

  return data.access_token;
}

/**
 * Make an authenticated Flutterwave V4 API request.
 */
export async function flutterwaveRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken =
    await getFlutterwaveAccessToken();

  const headers = new Headers(
    options.headers
  );

  headers.set(
    "Authorization",
    `Bearer ${accessToken}`
  );

  headers.set(
    "Content-Type",
    "application/json"
  );

  const url =
    `${FLUTTERWAVE_API_BASE}${path}`;

  console.log(
    "Flutterwave V4 request:",
    {
      url,
      method: options.method || "GET",
    }
  );

  const response = await fetch(
    url,
    {
      ...options,
      headers,
      cache: "no-store",
    }
  );

  const contentType =
    response.headers.get("content-type") || "";

  const rawBody = await response.text();

  console.log(
    "Flutterwave V4 response:",
    {
      status: response.status,
      statusText: response.statusText,
      contentType,
      body: rawBody.slice(0, 2000),
    }
  );

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Flutterwave returned a non-JSON response (${response.status} ${response.statusText}).`
    );
  }

  let data: unknown;

  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new Error(
      "Flutterwave returned invalid JSON."
    );
  }

  if (!response.ok) {
    const errorData =
      data as FlutterwaveErrorResponse;

    console.error(
      "Flutterwave V4 API error:",
      response.status,
      data
    );

    throw new Error(
      errorData?.message ||
        errorData?.error_description ||
        errorData?.error ||
        "Flutterwave API request failed."
    );
  }

  return data as T;
}

/**
 * Returns the currently configured Flutterwave V4 API base URL.
 */
export function getFlutterwaveApiBase(): string {
  return FLUTTERWAVE_API_BASE;
}

/**
 * Clear the cached OAuth token.
 */
export function clearFlutterwaveTokenCache(): void {
  cachedToken = null;
}