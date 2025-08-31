import app from 'flarum/common/app';
import DepositAddress from '../models/DepositAddress';
import DepositPlatform from '../models/DepositPlatform';
import { 
  AddressServiceInterface, 
  QueryOptions, 
  ServiceError, 
  ServiceErrorType
} from '../types/services';

/**
 * Service for managing deposit addresses with Flarum Store integration
 */
export default class AddressService implements AddressServiceInterface {
  private readonly addressModelType = 'deposit-addresses';
  private readonly platformModelType = 'deposit-platforms';

  /**
   * Generate or retrieve deposit address for user and platform
   */
  async generateAddress(platformId: number, userId?: number): Promise<string> {
    try {
      const targetUserId = userId || app.session.user?.id();
      
      if (!targetUserId) {
        throw new ServiceError(
          'User not authenticated',
          ServiceErrorType.PERMISSION_DENIED
        );
      }

      // Check if platform exists and is active
      const platform = await app.store.find(this.platformModelType, platformId) as unknown as DepositPlatform;
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

      // Try to find existing active address for this user/platform
      const existingAddresses = await this.getUserAddresses(targetUserId);
      const existingAddress = existingAddresses.find((addr: DepositAddress) => 
        addr.platform().id() === platformId && addr.isActive()
      );

      if (existingAddress) {
        // Update last used timestamp
        await this.updateLastUsed(existingAddress);
        return existingAddress.fullAddress() || existingAddress.address();
      }

      // Generate new address
      return await this.createNewAddress(platform, targetUserId);

    } catch (error) {
      throw this.handleError(error, 'Failed to generate deposit address');
    }
  }

  /**
   * Get all deposit addresses for a user
   */
  async getUserAddresses(userId?: number, options: QueryOptions = {}): Promise<DepositAddress[]> {
    try {
      const targetUserId = userId || app.session.user?.id();
      
      if (!targetUserId) {
        throw new ServiceError(
          'User not authenticated',
          ServiceErrorType.PERMISSION_DENIED
        );
      }

      const queryOptions = {
        ...options,
        filter: {
          user: targetUserId,
          ...options.filter
        },
        include: options.include || 'platform',
        sort: options.sort || '-createdAt'
      };

      const addresses = await app.store.find(this.addressModelType, queryOptions);
      return Array.isArray(addresses) ? addresses : [addresses];

    } catch (error) {
      throw this.handleError(error, 'Failed to get user addresses');
    }
  }

  /**
   * Get specific address for platform and user
   */
  async getAddressForPlatform(platformId: number, userId?: number): Promise<DepositAddress | null> {
    try {
      const addresses = await this.getUserAddresses(userId, {
        filter: { platform: platformId, isActive: true }
      });
      
      return addresses.length > 0 ? addresses[0] : null;

    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw this.handleError(error, `Failed to get address for platform ${platformId}`);
    }
  }

  /**
   * Refresh/regenerate address for platform
   */
  async refreshAddress(platformId: number, userId?: number): Promise<string> {
    try {
      const targetUserId = userId || app.session.user?.id();
      
      if (!targetUserId) {
        throw new ServiceError(
          'User not authenticated',
          ServiceErrorType.PERMISSION_DENIED
        );
      }

      // Deactivate existing address
      const existingAddress = await this.getAddressForPlatform(platformId, targetUserId);
      if (existingAddress) {
        await this.deactivateAddress(parseInt(existingAddress.id()));
      }

      // Generate new address
      return await this.generateAddress(platformId, targetUserId);

    } catch (error) {
      throw this.handleError(error, 'Failed to refresh deposit address');
    }
  }

  /**
   * Deactivate a deposit address
   */
  async deactivateAddress(addressId: number): Promise<void> {
    try {
      const address = await app.store.find(this.addressModelType, addressId) as DepositAddress;
      if (!address) {
        throw new ServiceError(
          'Address not found',
          ServiceErrorType.VALIDATION_ERROR
        );
      }

      if (!this.canViewAddress(address)) {
        throw new ServiceError(
          'You do not have permission to deactivate this address',
          ServiceErrorType.PERMISSION_DENIED
        );
      }

      await address.save({ isActive: false });

    } catch (error) {
      throw this.handleError(error, 'Failed to deactivate address');
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
   * Check if current user can view an address
   */
  canViewAddress(address: DepositAddress): boolean {
    const currentUser = app.session.user;
    if (!currentUser) return false;

    // Admin can view all addresses
    if (currentUser.isAdmin()) return true;

    // Users can only view their own addresses
    return address.user()?.id() === currentUser.id();
  }

  /**
   * Create new deposit address
   */
  private async createNewAddress(platform: DepositPlatform, userId: number): Promise<string> {
    try {
      // Use platform's address generation method
      const address = platform.generateDepositAddress(userId);
      
      // Create address record in the store
      const depositAddress = app.store.createRecord(this.addressModelType) as DepositAddress;
      
      const addressData = {
        userId: userId,
        platformId: platform.id(),
        address: address,
        fullAddress: address, // For now, same as address
        isActive: true,
        lastUsedAt: new Date()
      };

      const savedAddress = await depositAddress.save(addressData);
      return (savedAddress as DepositAddress).fullAddress() || address;

    } catch (error) {
      throw this.handleError(error, 'Failed to create new address');
    }
  }

  /**
   * Update last used timestamp for address
   */
  private async updateLastUsed(address: DepositAddress): Promise<void> {
    try {
      await address.save({ lastUsedAt: new Date() });
    } catch (error) {
      // Don't fail the whole operation if timestamp update fails
      console.warn('Failed to update address last used timestamp:', error);
    }
  }

  /**
   * Get all addresses with platform information
   */
  async getAddressesWithPlatforms(userId?: number): Promise<Array<{
    address: DepositAddress;
    platform: DepositPlatform;
  }>> {
    try {
      const addresses = await this.getUserAddresses(userId, {
        include: 'platform',
        filter: { isActive: true }
      });

      return addresses.map(address => ({
        address,
        platform: address.platform()
      })).filter(item => item.platform); // Filter out addresses without platforms

    } catch (error) {
      throw this.handleError(error, 'Failed to get addresses with platform information');
    }
  }

  /**
   * Get active addresses count for user
   */
  async getActiveAddressCount(userId?: number): Promise<number> {
    try {
      const addresses = await this.getUserAddresses(userId, {
        filter: { isActive: true }
      });
      
      return addresses.length;

    } catch (error) {
      throw this.handleError(error, 'Failed to get active address count');
    }
  }

  /**
   * Validate address format (basic validation)
   */
  validateAddressFormat(address: string, platform: DepositPlatform): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!address || typeof address !== 'string') {
      errors.push('Address must be a valid string');
      return { valid: false, errors };
    }


    // Add platform-specific validations
    const symbol = platform.symbol()?.toLowerCase();
    if (symbol === 'btc' && !address.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)) {
      errors.push('Invalid Bitcoin address format');
    } else if (symbol === 'eth' && !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      errors.push('Invalid Ethereum address format');
    }

    return { valid: errors.length === 0, errors };
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

  /**
   * Check if error is a not found error
   */
  private isNotFoundError(error: any): boolean {
    return error.status === 404 || 
           error.response?.status === 404 ||
           error.message?.includes('not found');
  }
}

// Export singleton instance
export const addressService = new AddressService();