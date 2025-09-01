import { 
  ServiceError, 
  ServiceErrorType
} from '../types/services';

/**
 * Simplified service for getting deposit addresses from platform configuration
 */
export default class AddressService {


  /**
   * Handle service errors with proper typing
   */
  private handleError(error: any, defaultMessage: string): ServiceError {
    if (error instanceof ServiceError) {
      return error;
    }

    // Handle Flarum API errors
    if (error.response && error.response.errors) {
      const apiError = error.response.errors[0];
      return new ServiceError(
        apiError.detail || defaultMessage,
        ServiceErrorType.VALIDATION_ERROR,
        apiError.code,
        apiError
      );
    }

    // Handle network errors
    if (error.name === 'TypeError' || error.message?.includes('fetch')) {
      return new ServiceError(
        'Network error occurred',
        ServiceErrorType.NETWORK_ERROR
      );
    }

    // Default error handling
    return new ServiceError(
      error.message || defaultMessage,
      ServiceErrorType.SERVER_ERROR
    );
  }
}

// Export singleton instance
export const addressService = new AddressService();