/**
 * Flarum API error interface for proper error handling
 */
export interface FlarumApiError {
  response?: {
    status?: number;
    errors?: Array<{
      detail?: string;
      code?: string;
    }>;
  };
  responseText?: string;
  status?: number;
}

/**
 * Helper function to extract error message from Flarum API error
 */
export function extractErrorMessage(error: any, fallback = 'An error occurred'): string {
  if (!error) return fallback;

  // Check for JSON:API error format
  if (error.response && error.response.errors && Array.isArray(error.response.errors)) {
    const firstError = error.response.errors[0];
    if (firstError && firstError.detail) {
      return firstError.detail;
    }
  }

  // Check for HTML error responses (PHP Fatal Errors)
  if (error.responseText) {
    if (error.responseText.includes('<b>Fatal error</b>') || error.responseText.includes('<!DOCTYPE')) {
      return 'Server error occurred. Please try again later.';
    }
    
    // Try to parse JSON response
    try {
      const response = JSON.parse(error.responseText);
      if (response.errors && Array.isArray(response.errors)) {
        return response.errors[0].detail || fallback;
      }
    } catch {
      // Not valid JSON, return server error message
      return 'Server error occurred. Please try again later.';
    }
  }

  return fallback;
}

/**
 * Type guard to check if error is a Flarum API error
 */
export function isFlarumApiError(error: any): error is FlarumApiError {
  return error && (
    (error.response && error.response.errors) ||
    error.responseText ||
    error.status
  );
}

/**
 * Type assertion helper for API responses
 * This is a temporary solution until better typing is available
 */
export function assertApiPayload(response: unknown): any {
  // In a production environment, you would add runtime validation here
  return response as any;
}