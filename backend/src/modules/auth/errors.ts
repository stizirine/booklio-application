import { createErrorResponse } from '../../errors/index.js';

export const AuthErrors = {
  // Registration errors
  REGISTRATION_DISABLED: {
    errorId: 'AUTH_REGISTRATION_DISABLED',
    message: 'Registration disabled',
    description: 'User registration is currently disabled',
    statusCode: 403,
  },
  EMAIL_ALREADY_EXISTS: {
    errorId: 'AUTH_EMAIL_ALREADY_EXISTS',
    message: 'Email already exists',
    description: 'An account with this email already exists',
    statusCode: 409,
  },
  PASSWORD_TOO_WEAK: {
    errorId: 'AUTH_PASSWORD_TOO_WEAK',
    message: 'Password too weak',
    description: 'The password does not meet the security requirements',
    statusCode: 400,
  },
  INVALID_EMAIL_FORMAT: {
    errorId: 'AUTH_INVALID_EMAIL_FORMAT',
    message: 'Invalid email format',
    description: 'The provided email format is invalid',
    statusCode: 400,
  },

  // Login errors
  INVALID_CREDENTIALS: {
    errorId: 'AUTH_INVALID_CREDENTIALS',
    message: 'Invalid credentials',
    description: 'The provided email or password is incorrect',
    statusCode: 401,
  },
  ACCOUNT_LOCKED: {
    errorId: 'AUTH_ACCOUNT_LOCKED',
    message: 'Account locked',
    description: 'The account has been locked due to too many failed login attempts',
    statusCode: 423,
  },
  ACCOUNT_DISABLED: {
    errorId: 'AUTH_ACCOUNT_DISABLED',
    message: 'Account disabled',
    description: 'The account has been disabled by an administrator',
    statusCode: 403,
  },
  EMAIL_NOT_VERIFIED: {
    errorId: 'AUTH_EMAIL_NOT_VERIFIED',
    message: 'Email not verified',
    description: 'Please verify your email address before logging in',
    statusCode: 403,
  },

  // Token errors
  TOKEN_INVALID: {
    errorId: 'AUTH_TOKEN_INVALID',
    message: 'Invalid token',
    description: 'The provided token is invalid or malformed',
    statusCode: 401,
  },
  TOKEN_EXPIRED: {
    errorId: 'AUTH_TOKEN_EXPIRED',
    message: 'Token expired',
    description: 'The authentication token has expired',
    statusCode: 401,
  },
  REFRESH_TOKEN_INVALID: {
    errorId: 'AUTH_REFRESH_TOKEN_INVALID',
    message: 'Invalid refresh token',
    description: 'The provided refresh token is invalid',
    statusCode: 401,
  },
  REFRESH_TOKEN_EXPIRED: {
    errorId: 'AUTH_REFRESH_TOKEN_EXPIRED',
    message: 'Refresh token expired',
    description: 'The refresh token has expired',
    statusCode: 401,
  },

  // Session errors
  SESSION_NOT_FOUND: {
    errorId: 'AUTH_SESSION_NOT_FOUND',
    message: 'Session not found',
    description: 'The requested session does not exist',
    statusCode: 404,
  },
  SESSION_EXPIRED: {
    errorId: 'AUTH_SESSION_EXPIRED',
    message: 'Session expired',
    description: 'The user session has expired',
    statusCode: 401,
  },

  // Password reset errors
  PASSWORD_RESET_TOKEN_INVALID: {
    errorId: 'AUTH_PASSWORD_RESET_TOKEN_INVALID',
    message: 'Invalid password reset token',
    description: 'The password reset token is invalid or expired',
    statusCode: 400,
  },
  PASSWORD_RESET_EXPIRED: {
    errorId: 'AUTH_PASSWORD_RESET_EXPIRED',
    message: 'Password reset expired',
    description: 'The password reset link has expired',
    statusCode: 400,
  },
  PASSWORD_SAME_AS_CURRENT: {
    errorId: 'AUTH_PASSWORD_SAME_AS_CURRENT',
    message: 'Password same as current',
    description: 'The new password must be different from the current password',
    statusCode: 400,
  },

  // Tenant errors
  TENANT_ACCESS_DENIED: {
    errorId: 'AUTH_TENANT_ACCESS_DENIED',
    message: 'Tenant access denied',
    description: 'You do not have access to this tenant',
    statusCode: 403,
  },
  TENANT_NOT_ACTIVE: {
    errorId: 'AUTH_TENANT_NOT_ACTIVE',
    message: 'Tenant not active',
    description: 'The requested tenant is not active',
    statusCode: 403,
  },

  // Rate limiting
  TOO_MANY_ATTEMPTS: {
    errorId: 'AUTH_TOO_MANY_ATTEMPTS',
    message: 'Too many attempts',
    description: 'Too many failed attempts. Please try again later',
    statusCode: 429,
  },
  RATE_LIMIT_EXCEEDED: {
    errorId: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Rate limit exceeded',
    description: 'Too many requests. Please try again later',
    statusCode: 429,
  },
} as const;

// Helper functions for Auth-specific errors
export function handleAuthDuplicateError() {
  return createErrorResponse(AuthErrors.EMAIL_ALREADY_EXISTS);
}

export function handleAuthInvalidCredentialsError() {
  return createErrorResponse(AuthErrors.INVALID_CREDENTIALS);
}

export function handleAuthTokenInvalidError() {
  return createErrorResponse(AuthErrors.TOKEN_EXPIRED);
}

export function handleRefreshTokenInvalidError() {
  return createErrorResponse(AuthErrors.REFRESH_TOKEN_INVALID);
}

export function handleAccountLockedError(lockoutUntil?: Date) {
  return createErrorResponse(AuthErrors.ACCOUNT_LOCKED, {
    lockoutUntil: lockoutUntil?.toISOString(),
  });
}

export function handlePasswordTooWeakError(requirements: string[]) {
  return createErrorResponse(AuthErrors.PASSWORD_TOO_WEAK, {
    requirements,
  });
}

export function handleTenantAccessDeniedError() {
  return createErrorResponse(AuthErrors.TENANT_ACCESS_DENIED);
}

export function handleTooManyAttemptsError(retryAfter?: number) {
  return createErrorResponse(AuthErrors.TOO_MANY_ATTEMPTS, {
    retryAfter,
  });
}

// Re-export common error handling functions
export {
  createErrorResponse,
  handleValidationError,
  handleNotFoundError,
  handleDatabaseError,
} from '../../errors/index.js';
