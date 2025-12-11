import { createErrorResponse } from '../../errors/index.js';

export const CRMErrors = {
  // Client-specific errors
  CLIENT_EMAIL_REQUIRED: {
    errorId: 'CRM_CLIENT_EMAIL_REQUIRED',
    message: 'Client email is required',
    description: 'Email is required for client creation',
    statusCode: 400,
  },
  CLIENT_PHONE_INVALID: {
    errorId: 'CRM_CLIENT_PHONE_INVALID',
    message: 'Invalid phone number',
    description: 'The provided phone number format is invalid',
    statusCode: 400,
  },
  CLIENT_ALREADY_EXISTS: {
    errorId: 'CRM_CLIENT_ALREADY_EXISTS',
    message: 'Client already exists',
    description: 'A client with this email already exists in the tenant',
    statusCode: 409,
  },
  CLIENT_DELETE_WITH_APPOINTMENTS: {
    errorId: 'CRM_CLIENT_DELETE_WITH_APPOINTMENTS',
    message: 'Cannot delete client with appointments',
    description: 'Client has associated appointments and cannot be deleted',
    statusCode: 409,
  },

  // Appointment-specific errors
  APPOINTMENT_INVALID_DATES: {
    errorId: 'CRM_APPOINTMENT_INVALID_DATES',
    message: 'Invalid appointment dates',
    description: 'Start date must be before end date and in the future',
    statusCode: 400,
  },
  APPOINTMENT_OVERLAP: {
    errorId: 'CRM_APPOINTMENT_OVERLAP',
    message: 'Appointment time overlap',
    description: 'Another appointment exists at the same time',
    statusCode: 409,
  },
  APPOINTMENT_STATUS_INVALID: {
    errorId: 'CRM_APPOINTMENT_STATUS_INVALID',
    message: 'Invalid appointment status',
    description: 'The provided appointment status is not valid',
    statusCode: 400,
  },

  // Invoice-specific errors
  INVOICE_AMOUNT_INVALID: {
    errorId: 'CRM_INVOICE_AMOUNT_INVALID',
    message: 'Invalid invoice amount',
    description: 'Invoice amount must be positive',
    statusCode: 400,
  },
  INVOICE_PAYMENT_EXCEEDS_AMOUNT: {
    errorId: 'CRM_INVOICE_PAYMENT_EXCEEDS_AMOUNT',
    message: 'Payment exceeds invoice amount',
    description: 'Payment amount cannot exceed the remaining invoice amount',
    statusCode: 400,
  },
  INVOICE_ALREADY_PAID: {
    errorId: 'CRM_INVOICE_ALREADY_PAID',
    message: 'Invoice already paid',
    description: 'This invoice has already been fully paid',
    statusCode: 409,
  },
  INVOICE_CURRENCY_INVALID: {
    errorId: 'CRM_INVOICE_CURRENCY_INVALID',
    message: 'Invalid currency',
    description: 'The provided currency is not supported',
    statusCode: 400,
  },

  // General CRM errors
  EXPORT_FAILED: {
    errorId: 'CRM_EXPORT_FAILED',
    message: 'Export failed',
    description: 'Failed to export data in the requested format',
    statusCode: 500,
  },
  BULK_OPERATION_FAILED: {
    errorId: 'CRM_BULK_OPERATION_FAILED',
    message: 'Bulk operation failed',
    description: 'Some items in the bulk operation failed to process',
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

// Helper functions for CRM-specific errors
export function handleClientDuplicateError() {
  return createErrorResponse(CRMErrors.CLIENT_ALREADY_EXISTS);
}

export function handleAppointmentOverlapError() {
  return createErrorResponse(CRMErrors.APPOINTMENT_OVERLAP);
}

export function handleInvoicePaymentExceedsError(remaining: number) {
  return createErrorResponse(CRMErrors.INVOICE_PAYMENT_EXCEEDS_AMOUNT, { remaining });
}

export function handleInvalidDatesError() {
  return createErrorResponse(CRMErrors.APPOINTMENT_INVALID_DATES);
}

export function handleExportError(originalError: unknown) {
  return createErrorResponse(CRMErrors.EXPORT_FAILED, {
    originalError: originalError instanceof Error ? originalError.message : String(originalError),
  });
}
