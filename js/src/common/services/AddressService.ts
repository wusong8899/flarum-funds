import app from 'flarum/common/app';
import DepositPlatform from '../models/DepositPlatform';
import { 
  AddressServiceInterface, 
  ServiceError, 
  ServiceErrorType
} from '../types/services';

/**
 * Simplified service for getting deposit addresses from platform configuration
 */
export default class AddressService implements AddressServiceInterface {

  /**
   * Get deposit address for platform (from platform configuration)
   */
  async generateAddress(platformId: number, _userId?: number): Promise<string> {
    try {
      const currentUser = app.session.user;
      if (!currentUser) {
        throw new ServiceError(
          'User not authenticated',
          ServiceErrorType.PERMISSION_DENIED
        );
      }

      // Get platform details
      const platform = await app.store.find('deposit-platforms', platformId) as unknown as DepositPlatform;
      if (!platform) {
        throw new ServiceError(
          'Invalid platform selected',
          ServiceErrorType.VALIDATION_ERROR
        );
      }

      if (!platform.isActive()) {
        throw new ServiceError(
          'Platform is not currently active',
          ServiceErrorType.VALIDATION_ERROR
        );
      }

      // Since platforms have pre-configured addresses, just return the platform's address
      if (!platform.address()) {
        throw new ServiceError(
          'Platform does not have a configured deposit address',
          ServiceErrorType.VALIDATION_ERROR
        );
      }

      return platform.address();

    } catch (error) {
      throw this.handleError(error, 'Failed to get deposit address');
    }
  }

  /**
   * Check if current user can generate addresses
   */
  canGenerateAddress(): boolean {
    const currentUser = app.session.user;
    return currentUser && !currentUser.isGuest();
  }

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