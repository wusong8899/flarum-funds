import app from 'flarum/common/app';
import DepositRecord from '../models/DepositRecord';
import DepositPlatform from '../models/DepositPlatform';
import DepositAddress from '../models/DepositAddress';
import { 
  DepositServiceInterface, 
  QueryOptions, 
  ServiceError, 
  ServiceErrorType
} from '../types/services';

/**
 * Service for managing deposit records and addresses with proper CRUD operations
 */
export default class DepositService implements DepositServiceInterface {
  private readonly recordModelType = 'deposit-records';
  private readonly platformModelType = 'deposit-platforms';
  private readonly addressModelType = 'deposit-addresses';

  /**
   * Find multiple deposit records
   */
  async find(options: QueryOptions = {}): Promise<any[]> {
    try {
      const queryParams: any = {
        include: options.include || 'user,platform',
        sort: options.sort || '-created_at',
        ...options
      };

      // Add pagination if specified
      if (options.page) {
        queryParams.page = options.page;
      }

      // Add filters if specified
      if (options.filter) {
        queryParams.filter = options.filter;
      }

      const results = await app.store.find(this.recordModelType, queryParams);
      return Array.isArray(results) ? results : [results];
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch deposit records');
    }
  }

  /**
   * Find a single deposit record by ID
   */
  async findById(id: string | number, options: QueryOptions = {}): Promise<any | null> {
    try {
      const queryParams: any = {
        include: options.include || 'user,platform'
      };

      const result = await app.store.find(this.recordModelType, String(id), queryParams);
      return result;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw this.handleError(error, `Failed to fetch deposit record ${id}`);
    }
  }

  /**
   * Create a new deposit record
   */
  async create(attributes: Record<string, any>): Promise<any> {
    try {
      // Validate required fields
      this.validateCreateAttributes(attributes);

      const record = app.store.createRecord(this.recordModelType);
      
      const savedRecord = await record.save(attributes);
      return savedRecord;
    } catch (error) {
      throw this.handleError(error, 'Failed to create deposit record');
    }
  }

  /**
   * Update an existing deposit record
   */
  async update(model: DepositRecord, attributes: Record<string, any>): Promise<DepositRecord> {
    try {
      if (!this.canModify(model)) {
        throw new ServiceError(
          'You do not have permission to modify this deposit record',
          ServiceErrorType.PERMISSION_DENIED
        );
      }

      const updatedModel = await model.save(attributes);
      return updatedModel as DepositRecord;
    } catch (error) {
      throw this.handleError(error, 'Failed to update deposit record');
    }
  }

  /**
   * Delete a deposit record
   */
  async delete(model: DepositRecord): Promise<void> {
    try {
      if (!this.canDelete(model)) {
        throw new ServiceError(
          'You do not have permission to delete this deposit record',
          ServiceErrorType.PERMISSION_DENIED
        );
      }

      await model.delete();
    } catch (error) {
      throw this.handleError(error, 'Failed to delete deposit record');
    }
  }

  /**
   * Generate deposit address for user - delegates to AddressService
   */
  async generateAddress(platformId: number): Promise<string> {
    try {
      // Import AddressService dynamically to avoid circular dependencies
      const { addressService } = await import('./AddressService') as any;
      return await addressService.generateAddress(platformId);
    } catch (error) {
      throw this.handleError(error, 'Failed to generate deposit address');
    }
  }

  /**
   * Get user's deposit history
   */
  async getUserHistory(userId?: number, options: QueryOptions = {}): Promise<DepositRecord[]> {
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
      sort: options.sort || '-created_at'
    };

    return await this.find(queryOptions);
  }

  /**
   * Create deposit record with transaction validation
   */
  async createRecord(data: {
    platformId: number;
    amount: number;
    transactionHash: string;
    note?: string;
  }): Promise<DepositRecord> {
    try {
      // Validate transaction hash format and platform
      await this.validateDepositRecord(data);

      const attributes = {
        platformId: data.platformId,
        amount: data.amount,
        transactionHash: data.transactionHash,
        note: data.note || '',
        status: 'pending'
      };

      return await this.create(attributes);
    } catch (error) {
      throw this.handleError(error, 'Failed to create deposit record');
    }
  }

  /**
   * Get pending deposits (admin only)
   */
  async getPendingDeposits(options: QueryOptions = {}): Promise<DepositRecord[]> {
    if (!app.session.user?.isAdmin()) {
      throw new ServiceError(
        'Admin permissions required',
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    const queryOptions = {
      ...options,
      filter: {
        status: 'pending',
        ...options.filter
      },
      include: options.include || 'user,platform',
      sort: options.sort || 'created_at'
    };

    return await this.find(queryOptions);
  }

  /**
   * Confirm a deposit (admin only)
   */
  async confirm(deposit: DepositRecord, confirmedAmount?: number): Promise<DepositRecord> {
    if (!app.session.user?.isAdmin()) {
      throw new ServiceError(
        'Admin permissions required',
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    const attributes: any = {
      status: 'confirmed'
    };

    if (confirmedAmount && confirmedAmount !== deposit.amount()) {
      attributes.confirmedAmount = confirmedAmount;
    }

    return await this.update(deposit, attributes);
  }

  /**
   * Reject a deposit (admin only)
   */
  async reject(deposit: DepositRecord, reason?: string): Promise<DepositRecord> {
    if (!app.session.user?.isAdmin()) {
      throw new ServiceError(
        'Admin permissions required',
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    const attributes: any = {
      status: 'rejected'
    };

    if (reason) {
      attributes.adminNote = reason;
    }

    return await this.update(deposit, attributes);
  }

  /**
   * Check if current user can modify a deposit record
   */
  canModify(model: DepositRecord): boolean {
    const currentUser = app.session.user;
    if (!currentUser) return false;

    // Admin can modify any record
    if (currentUser.isAdmin()) return true;

    // Users can only modify their own pending records
    return String((model as any).userId()) === String(currentUser.id()) && (model as any).status() === 'pending';
  }

  /**
   * Check if current user can create new deposit records
   */
  canCreate(): boolean {
    const currentUser = app.session.user;
    if (!currentUser) return false;
    const isGuest = (currentUser as any).isGuest();
    return !isGuest;
  }

  /**
   * Check if current user can delete a deposit record
   */
  canDelete(model: DepositRecord): boolean {
    const currentUser = app.session.user;
    if (!currentUser) return false;

    // Admin can delete any record
    if (currentUser.isAdmin()) return true;

    // Users can only delete their own pending records
    return String((model as any).userId()) === String(currentUser.id()) && (model as any).status() === 'pending';
  }

  /**
   * Get available deposit platforms
   */
  async getPlatforms(): Promise<any[]> {
    try {
      const platforms = await app.store.find(this.platformModelType, {
        sort: 'name'
      });
      
      return Array.isArray(platforms) ? platforms : [platforms];
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch deposit platforms');
    }
  }

  /**
   * Get platforms grouped by symbol
   */
  async getPlatformsBySymbol(): Promise<Record<string, DepositPlatform[]>> {
    const platforms = await this.getPlatforms();
    const grouped: Record<string, DepositPlatform[]> = {};

    for (const platform of platforms) {
      const symbol = platform.symbol();
      if (!grouped[symbol]) {
        grouped[symbol] = [];
      }
      grouped[symbol].push(platform);
    }

    return grouped;
  }

  /**
   * Get user's deposit addresses - delegates to AddressService
   */
  async getUserAddresses(userId?: number): Promise<DepositAddress[]> {
    try {
      // Import AddressService dynamically to avoid circular dependencies
      const { addressService } = await import('./AddressService') as any;
      return await addressService.getUserAddresses(userId);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch user deposit addresses');
    }
  }

  /**
   * Validate deposit record data
   */
  private async validateDepositRecord(data: any): Promise<void> {
    const { platformId, amount, transactionHash } = data;

    // Get platform details
    const platform = await app.store.find(this.platformModelType, platformId);
    if (!platform) {
      throw new ServiceError(
        'Invalid platform selected',
        ServiceErrorType.VALIDATION_ERROR
      );
    }

    // Check if platform is active
    if (!(platform as any).isActive()) {
      throw new ServiceError(
        'Selected platform is not available',
        ServiceErrorType.VALIDATION_ERROR
      );
    }

    // Validate amount limits
    const minAmount = (platform as any).minAmount();
    
    if (amount < minAmount) {
      throw new ServiceError(
        `Minimum deposit amount is ${minAmount}`,
        ServiceErrorType.VALIDATION_ERROR
      );
    }

    // Validate transaction hash format (basic validation)
    if (!transactionHash || transactionHash.length < 10) {
      throw new ServiceError(
        'Invalid transaction hash',
        ServiceErrorType.VALIDATION_ERROR
      );
    }

    // Check for duplicate transaction hash
    try {
      const existingRecords = await this.find({
        filter: { transactionHash: transactionHash }
      });

      if (existingRecords.length > 0) {
        throw new ServiceError(
          'Transaction hash already exists',
          ServiceErrorType.VALIDATION_ERROR
        );
      }
    } catch (error) {
      // If it's not a validation error, re-throw
      if (error instanceof ServiceError && error.type === ServiceErrorType.VALIDATION_ERROR) {
        throw error;
      }
    }
  }

  /**
   * Validate create attributes
   */
  private validateCreateAttributes(attributes: any): void {
    const required = ['platformId', 'amount', 'transactionHash'];
    
    for (const field of required) {
      if (!attributes[field]) {
        throw new ServiceError(
          `${field} is required`,
          ServiceErrorType.VALIDATION_ERROR
        );
      }
    }

    if (typeof attributes.amount !== 'number' || attributes.amount <= 0) {
      throw new ServiceError(
        'Amount must be a positive number',
        ServiceErrorType.VALIDATION_ERROR
      );
    }
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
export const depositService = new DepositService();