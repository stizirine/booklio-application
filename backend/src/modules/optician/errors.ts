import { createErrorResponse } from '../../errors/index.js';

export const OpticianErrors = {
  // Validation errors (400)
  VALIDATION_FAILED: {
    errorId: 'OPTICIAN_VALIDATION_FAILED',
    message: 'Validation failed',
    description: 'The request data does not meet the required validation criteria',
    statusCode: 400,
  },
  INVALID_EYE_VALUES: {
    errorId: 'OPTICIAN_INVALID_EYE_VALUES',
    message: 'Invalid eye measurement values',
    description: 'The provided eye measurement values are outside the allowed ranges',
    statusCode: 400,
  },
  INVALID_DATE_RANGE: {
    errorId: 'OPTICIAN_INVALID_DATE_RANGE',
    message: 'Invalid date range',
    description: 'The provided date values are invalid or in the wrong order',
    statusCode: 400,
  },

  // Not found errors (404)
  MEASUREMENT_NOT_FOUND: {
    errorId: 'OPTICIAN_MEASUREMENT_NOT_FOUND',
    message: 'Eye measurement not found',
    description: 'The requested eye measurement does not exist or has been deleted',
    statusCode: 404,
  },
  CLIENT_NOT_FOUND: {
    errorId: 'OPTICIAN_CLIENT_NOT_FOUND',
    message: 'Client not found',
    description: 'The specified client does not exist in the system',
    statusCode: 404,
  },
  PRESCRIPTION_NOT_FOUND: {
    errorId: 'OPTICIAN_PRESCRIPTION_NOT_FOUND',
    message: 'Prescription not found',
    description: 'The requested optical prescription does not exist or has been deleted',
    statusCode: 404,
  },

  // Conflict errors (409)
  DUPLICATE_MEASUREMENT: {
    errorId: 'OPTICIAN_DUPLICATE_MEASUREMENT',
    message: 'Duplicate measurement',
    description: 'A measurement with the same data already exists for this client',
    statusCode: 409,
  },

  // Server errors (500)
  DATABASE_ERROR: {
    errorId: 'OPTICIAN_DATABASE_ERROR',
    message: 'Database operation failed',
    description: 'An error occurred while performing the database operation',
    statusCode: 500,
  },
  UNKNOWN_ERROR: {
    errorId: 'OPTICIAN_UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    description: 'An unexpected error occurred while processing the request',
    statusCode: 500,
  },
} as const;

// Re-export common functions for convenience
export {
  createErrorResponse,
  handleDatabaseError,
  handleNotFoundError,
  handleValidationError,
} from '../../errors/index.js';

export function handleOpticianValidationError(validationError: { flatten: () => unknown }) {
  return createErrorResponse(OpticianErrors.VALIDATION_FAILED, {
    validation: validationError.flatten(),
  });
}

export function handleMeasurementNotFoundError() {
  return createErrorResponse(OpticianErrors.MEASUREMENT_NOT_FOUND);
}

export function handleOpticianDatabaseError(originalError: unknown) {
  return createErrorResponse(OpticianErrors.DATABASE_ERROR, {
    originalError: originalError instanceof Error ? originalError.message : String(originalError),
  });
}
