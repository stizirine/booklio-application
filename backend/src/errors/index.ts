export interface ApiError {
  errorId: string;
  message: string;
  description: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export interface ErrorResponse {
  error: {
    errorId: string;
    message: string;
    description: string;
    details?: Record<string, unknown>;
  };
}

// Common errors used across all modules
export const CommonErrors = {
  // Validation errors (400)
  VALIDATION_FAILED: {
    errorId: 'VALIDATION_FAILED',
    message: 'Validation failed',
    description: 'The request data does not meet the required validation criteria',
    statusCode: 400,
  },
  INVALID_REQUEST: {
    errorId: 'INVALID_REQUEST',
    message: 'Invalid request',
    description: 'The request format or parameters are invalid',
    statusCode: 400,
  },
  MISSING_REQUIRED_FIELD: {
    errorId: 'MISSING_REQUIRED_FIELD',
    message: 'Missing required field',
    description: 'A required field is missing from the request',
    statusCode: 400,
  },

  // Authentication errors (401)
  UNAUTHORIZED: {
    errorId: 'UNAUTHORIZED',
    message: 'Unauthorized',
    description: 'Authentication is required to access this resource',
    statusCode: 401,
  },
  INVALID_CREDENTIALS: {
    errorId: 'INVALID_CREDENTIALS',
    message: 'Invalid credentials',
    description: 'The provided credentials are invalid',
    statusCode: 401,
  },
  TOKEN_EXPIRED: {
    errorId: 'TOKEN_EXPIRED',
    message: 'Token expired',
    description: 'The authentication token has expired',
    statusCode: 401,
  },

  // Authorization errors (403)
  FORBIDDEN: {
    errorId: 'FORBIDDEN',
    message: 'Forbidden',
    description: 'You do not have permission to access this resource',
    statusCode: 403,
  },
  MODULE_FORBIDDEN: {
    errorId: 'MODULE_FORBIDDEN',
    message: 'Module access forbidden',
    description: 'Your tenant does not have access to this module',
    statusCode: 403,
  },

  // Not found errors (404)
  NOT_FOUND: {
    errorId: 'NOT_FOUND',
    message: 'Resource not found',
    description: 'The requested resource does not exist',
    statusCode: 404,
  },
  USER_NOT_FOUND: {
    errorId: 'USER_NOT_FOUND',
    message: 'User not found',
    description: 'The requested user does not exist',
    statusCode: 404,
  },
  CLIENT_NOT_FOUND: {
    errorId: 'CLIENT_NOT_FOUND',
    message: 'Client not found',
    description: 'The requested client does not exist',
    statusCode: 404,
  },
  APPOINTMENT_NOT_FOUND: {
    errorId: 'APPOINTMENT_NOT_FOUND',
    message: 'Appointment not found',
    description: 'The requested appointment does not exist',
    statusCode: 404,
  },
  INVOICE_NOT_FOUND: {
    errorId: 'INVOICE_NOT_FOUND',
    message: 'Invoice not found',
    description: 'The requested invoice does not exist',
    statusCode: 404,
  },
  TENANT_NOT_FOUND: {
    errorId: 'TENANT_NOT_FOUND',
    message: 'Tenant not found',
    description: 'The requested tenant does not exist',
    statusCode: 404,
  },

  // Conflict errors (409)
  DUPLICATE_EMAIL: {
    errorId: 'DUPLICATE_EMAIL',
    message: 'Email already exists',
    description: 'An account with this email already exists',
    statusCode: 409,
  },
  DUPLICATE_RESOURCE: {
    errorId: 'DUPLICATE_RESOURCE',
    message: 'Resource already exists',
    description: 'A resource with the same data already exists',
    statusCode: 409,
  },
  CONFLICT: {
    errorId: 'CONFLICT',
    message: 'Conflict',
    description: 'The request conflicts with the current state of the resource',
    statusCode: 409,
  },

  // Server errors (500)
  DATABASE_ERROR: {
    errorId: 'DATABASE_ERROR',
    message: 'Database operation failed',
    description: 'An error occurred while performing the database operation',
    statusCode: 500,
  },
  INTERNAL_ERROR: {
    errorId: 'INTERNAL_ERROR',
    message: 'Internal server error',
    description: 'An unexpected error occurred on the server',
    statusCode: 500,
  },
  EXTERNAL_SERVICE_ERROR: {
    errorId: 'EXTERNAL_SERVICE_ERROR',
    message: 'External service error',
    description: 'An error occurred while communicating with an external service',
    statusCode: 500,
  },
} as const;

// Utility functions
export function createErrorResponse(
  error: ApiError,
  details?: Record<string, unknown>
): ErrorResponse {
  return {
    error: {
      errorId: error.errorId,
      message: error.message,
      description: error.description,
      ...(details && { details }),
    },
  };
}

export function handleValidationError(validationError: { flatten: () => unknown }) {
  return createErrorResponse(CommonErrors.VALIDATION_FAILED, {
    validation: validationError.flatten(),
  });
}

export function handleNotFoundError(resource: string = 'resource') {
  const errorMap: Record<string, ApiError> = {
    user: CommonErrors.USER_NOT_FOUND,
    client: CommonErrors.CLIENT_NOT_FOUND,
    appointment: CommonErrors.APPOINTMENT_NOT_FOUND,
    invoice: CommonErrors.INVOICE_NOT_FOUND,
    tenant: CommonErrors.TENANT_NOT_FOUND,
  };

  const error = errorMap[resource] || CommonErrors.NOT_FOUND;
  return createErrorResponse(error);
}

export function handleDatabaseError(originalError: unknown) {
  return createErrorResponse(CommonErrors.DATABASE_ERROR, {
    originalError: originalError instanceof Error ? originalError.message : String(originalError),
  });
}

export function handleDuplicateError(field: string) {
  if (field === 'email') {
    return createErrorResponse(CommonErrors.DUPLICATE_EMAIL);
  }
  return createErrorResponse(CommonErrors.DUPLICATE_RESOURCE, { field });
}

export function handleUnauthorizedError() {
  return createErrorResponse(CommonErrors.UNAUTHORIZED);
}

export function handleForbiddenError() {
  return createErrorResponse(CommonErrors.FORBIDDEN);
}

export function handleModuleForbiddenError() {
  return createErrorResponse(CommonErrors.MODULE_FORBIDDEN);
}
