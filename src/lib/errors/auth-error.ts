export class AuthError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }

  static USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS";
  static INVALID_CREDENTIALS = "INVALID_CREDENTIALS";
  static RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED";
  static INVALID_TOKEN = "INVALID_TOKEN";
  static ACCOUNT_LOCKED = "ACCOUNT_LOCKED";
  static PASSWORD_RESET_FAILED = "PASSWORD_RESET_FAILED";
}
