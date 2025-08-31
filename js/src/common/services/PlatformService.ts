import app from 'flarum/common/app';
import { 
  PlatformServiceInterface, 
  QueryOptions, 
  ServiceError, 
  ServiceErrorType 
} from '../types/services';

/**
 * Service for managing both withdrawal and deposit platforms
 */
export default class PlatformService implements PlatformServiceInterface {
  private readonly withdrawalModelType = 'withdrawal-platforms';
  private readonly depositModelType = 'deposit-platforms';

  /**
   * Find multiple platforms of specified type
   */
  async find(type: 'withdrawal' | 'deposit', options: QueryOptions = {}): Promise<any[]> {
    const modelType = type === 'withdrawal' ? this.withdrawalModelType : this.depositModelType;
    
    try {
      const queryParams: any = {
        sort: options.sort || 'name',
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

      // Include relationships if specified
      if (options.include) {
        queryParams.include = options.include;
      }

      const results = await app.store.find(modelType, queryParams);
      return Array.isArray(results) ? results : [results];
    } catch (error) {
      throw this.handleError(error, `Failed to fetch ${type} platforms`);
    }
  }

  /**
   * Find a single platform by ID
   */
  async findById(
    type: 'withdrawal' | 'deposit', 
    id: string | number, 
    options: QueryOptions = {}
  ): Promise<any | null> {
    const modelType = type === 'withdrawal' ? this.withdrawalModelType : this.depositModelType;
    
    try {
      const queryParams: any = {};
      
      // Include relationships if specified
      if (options.include) {
        queryParams.include = options.include;
      }

      const result = await app.store.find(modelType, id, queryParams);
      return result;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw this.handleError(error, `Failed to fetch ${type} platform ${id}`);
    }
  }

  /**
   * Create a new platform
   */
  async create(type: 'withdrawal' | 'deposit', attributes: Record<string, any>): Promise<any> {
    const modelType = type === 'withdrawal' ? this.withdrawalModelType : this.depositModelType;
    
    try {
      // Validate required fields based on platform type
      this.validateCreateAttributes(type, attributes);

      const platform = app.store.createRecord(modelType);
      
      const savedPlatform = await platform.save(attributes);
      return savedPlatform;
    } catch (error) {
      throw this.handleError(error, `Failed to create ${type} platform`);
    }
  }

  /**
   * Update an existing platform
   */
  async update(platform: any, attributes: Record<string, any>): Promise<any> {
    try {
      if (!this.canModify(platform)) {
        throw new ServiceError(
          'You do not have permission to modify this platform',
          ServiceErrorType.PERMISSION_DENIED
        );
      }

      const updatedPlatform = await platform.save(attributes);
      return updatedPlatform;
    } catch (error) {
      throw this.handleError(error, 'Failed to update platform');
    }
  }

  /**
   * Delete a platform
   */
  async delete(platform: any): Promise<void> {
    try {
      if (!this.canDelete(platform)) {
        throw new ServiceError(
          'You do not have permission to delete this platform',
          ServiceErrorType.PERMISSION_DENIED
        );
      }

      await platform.delete();
    } catch (error) {
      throw this.handleError(error, 'Failed to delete platform');
    }
  }

  /**
   * Get active platforms only
   */
  async getActive(type: 'withdrawal' | 'deposit', options: QueryOptions = {}): Promise<any[]> {
    const queryOptions = {
      ...options,
      filter: {
        isActive: true,
        ...options.filter
      }
    };

    return await this.find(type, queryOptions);
  }

  /**
   * Toggle platform status (admin only)
   */
  async toggleStatus(platform: any): Promise<any> {
    if (!app.session.user?.isAdmin()) {
      throw new ServiceError(
        'Admin permissions required',
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    const currentStatus = platform.isActive();
    return await this.update(platform, { isActive: !currentStatus });
  }

  /**
   * Update platform configuration (admin only)
   */
  async updateConfig(platform: any, config: Record<string, any>): Promise<any> {
    if (!app.session.user?.isAdmin()) {
      throw new ServiceError(
        'Admin permissions required',
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    return await this.update(platform, config);
  }

  /**
   * Get platforms by symbol
   */
  async getBySymbol(symbol: string, type: 'withdrawal' | 'deposit'): Promise<any[]> {
    return await this.find(type, {
      filter: { symbol: symbol },
      sort: 'name'
    });
  }

  /**
   * Validate platform limits for an amount
   */
  validateAmount(platform: any, amount: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof amount !== 'number' || amount <= 0) {
      errors.push('Amount must be a positive number');
      return { valid: false, errors };
    }

    const minAmount = platform.minAmount ? platform.minAmount() : 0;
    const maxAmount = platform.maxAmount ? platform.maxAmount() : null;

    if (amount < minAmount) {
      errors.push(`Amount must be at least ${minAmount}`);
    }

    if (maxAmount && amount > maxAmount) {
      errors.push(`Amount cannot exceed ${maxAmount}`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get platform statistics (admin only)
   */
  async getPlatformStats(type: 'withdrawal' | 'deposit', platformId: number): Promise<any> {
    if (!app.session.user?.isAdmin()) {
      throw new ServiceError(
        'Admin permissions required',
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    const requestType = type === 'withdrawal' ? 'withdrawal-requests' : 'deposit-records';
    
    try {
      // Get all requests/records for this platform
      const records = await app.store.find(requestType, {
        filter: { platform: platformId },
        include: 'platform'
      });

      const recordArray = Array.isArray(records) ? records : [records];

      // Calculate statistics
      const stats = {
        total: recordArray.length,
        pending: recordArray.filter(r => r.status() === 'pending').length,
        approved: recordArray.filter(r => r.status() === 'approved' || r.status() === 'confirmed').length,
        rejected: recordArray.filter(r => r.status() === 'rejected').length,
        totalAmount: recordArray.reduce((sum, r) => sum + (r.amount() || 0), 0)
      };

      return stats;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch platform statistics');
    }
  }

  /**
   * Get platforms grouped by symbol
   */
  async getPlatformsBySymbolGrouped(type: 'withdrawal' | 'deposit'): Promise<Record<string, any[]>> {
    const platforms = await this.getActive(type);
    const grouped: Record<string, any[]> = {};

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
   * Sort platforms by criteria
   */
  async getSortedPlatforms(
    type: 'withdrawal' | 'deposit', 
    sortBy: 'name' | 'symbol' | 'createdAt' | 'fee' = 'name',
    direction: 'asc' | 'desc' = 'asc'
  ): Promise<any[]> {
    const sortString = direction === 'desc' ? `-${sortBy}` : sortBy;
    
    return await this.getActive(type, {
      sort: sortString
    });
  }

  /**
   * Check if current user can modify platforms
   */
  canModify(_platform: any): boolean {
    const currentUser = app.session.user;
    return currentUser && currentUser.isAdmin();
  }

  /**
   * Check if current user can create new platforms
   */
  canCreate(): boolean {
    const currentUser = app.session.user;
    return currentUser && currentUser.isAdmin();
  }

  /**
   * Check if current user can delete platforms
   */
  canDelete(_platform: any): boolean {
    const currentUser = app.session.user;
    return currentUser && currentUser.isAdmin();
  }

  /**
   * Validate create attributes based on platform type
   */
  private validateCreateAttributes(type: 'withdrawal' | 'deposit', attributes: any): void {
    const commonRequired = ['name', 'symbol', 'minAmount'];
    
    // Only common fields are required (removed address requirement)
    const required = commonRequired;

    for (const field of required) {
      if (!attributes[field]) {
        throw new ServiceError(
          `${field} is required for ${type} platforms`,
          ServiceErrorType.VALIDATION_ERROR
        );
      }
    }

    if (typeof attributes.minAmount !== 'number' || attributes.minAmount < 0) {
      throw new ServiceError(
        'minAmount must be a non-negative number',
        ServiceErrorType.VALIDATION_ERROR
      );
    }

    if (attributes.maxAmount !== undefined) {
      if (typeof attributes.maxAmount !== 'number' || attributes.maxAmount < attributes.minAmount) {
        throw new ServiceError(
          'maxAmount must be a number greater than or equal to minAmount',
          ServiceErrorType.VALIDATION_ERROR
        );
      }
    }

    if (attributes.fee !== undefined) {
      if (typeof attributes.fee !== 'number' || attributes.fee < 0) {
        throw new ServiceError(
          'fee must be a non-negative number',
          ServiceErrorType.VALIDATION_ERROR
        );
      }
    }

    // Validate symbol format (basic validation)
    if (typeof attributes.symbol !== 'string' || !attributes.symbol.trim()) {
      throw new ServiceError(
        'Symbol is required',
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
export const platformService = new PlatformService();