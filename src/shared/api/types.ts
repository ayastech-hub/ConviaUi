export type ApiErrorBody = {
  code?: string;
  message?: string;
  [key: string]: unknown;
};

export class ApiError extends Error {
  status: number;
  code: string;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message || body.code || `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code || `http_${status}`;
    this.body = body;
  }
}

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  userId: string;
  username?: string;
  displayName?: string | null;
  preferredCurrency?: string | null;
  country?: string | null;
};

export type RegisterResponse = SessionTokens & {
  evmAddress: string;
  solanaAddress: string;
  bitcoinAddress: string;
  tronAddress: string;
};

export type LoginResponse = SessionTokens & {
  isNewDevice?: boolean;
};
