/**
 * Standardized API Response Codes
 * Follows Bunny Cove / DaSSO standard conventions.
 */
export const ResponseCodes = {
  // General Success & Errors
  SUCCESS: 'success',
  SERVER_ERROR: 'server_error',
  VALIDATION_ERROR: 'validation_error',
  NOT_FOUND: 'not_found',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',

  // Authentication & SSO Codes
  AUTH_SUCCESSFUL: 'auth_successful',
  AUTH_REQUIRED: 'auth_required',
  INVALID_TOKEN: 'invalid_token',
  TOKEN_EXPIRED: 'token_expired',
  SESSION_INVALIDATED: 'session_invalidated',

  // User & DB Sync Operations
  USER_SYNC_SUCCESSFUL: 'user_sync_successful',
  USER_NOT_FOUND: 'user_not_found',
  DB_OVERRIDE_SUCCESSFUL: 'db_override_successful',
  PERMISSION_DENIED: 'permission_denied',
} as const;

export type ResponseCode = (typeof ResponseCodes)[keyof typeof ResponseCodes];

