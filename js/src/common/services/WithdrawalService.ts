import app from 'flarum/common/app';
import WithdrawalRequest from '../models/WithdrawalRequest';
import WithdrawalPlatform from '../models/WithdrawalPlatform';
import { 
  WithdrawalServiceInterface, 
  QueryOptions, 
  ServiceError, 
  ServiceErrorType
} from '../types/services';

/**
 * Service for managing funds requests with proper CRUD operations
 */
export default class WithdrawalService implements WithdrawalServiceInterface {
  private readonly modelType = 'funds-requests';
  private readonly platformModelType = 'funds-platforms';

  /**
   * Find multiple funds requests
   */
  async find(options: QueryOptions = {}): Promise<WithdrawalRequest[]> {
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

      const results = await app.store.find(this.modelType, queryParams);
      return Array.isArray(results) ? results : [results];
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch funds requests');
    }
  }

  /**
   * Find a single funds request by ID
   */
  async findById(id: string | number, options: QueryOptions = {}): Promise<WithdrawalRequest | null> {
    try {
      const queryParams: any = {
        include: options.include || 'user,platform'
      };

      const result = await app.store.find(this.modelType, String(id), queryParams);
      return result as unknown as WithdrawalRequest;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw this.handleError(error, `Failed to fetch funds request ${id}`);
    }
  }

  /**
   * Create a new funds request
   */
  async create(attributes: Record<string, any>): Promise<WithdrawalRequest> {
    try {
      // Validate required fields
      this.validateCreateAttributes(attributes);

      const request = app.store.createRecord(this.modelType) as WithdrawalRequest;
      
      const savedRequest = await request.save(attributes);
      return savedRequest as WithdrawalRequest;
    } catch (error) {
      throw this.handleError(error, 'Failed to create funds request');
    }
  }

  /**
   * Update an existing funds request
   */
  async update(model: WithdrawalRequest, attributes: Record<string, any>): Promise<WithdrawalRequest> {
    try {
      if (!this.canModify(model)) {
        throw new ServiceError(
          'You do not have permission to modify this funds request',
          ServiceErrorType.PERMISSION_DENIED
        );
      }

      const updatedModel = await model.save(attributes);
      return updatedModel as WithdrawalRequest;
    } catch (error) {
      throw this.handleError(error, 'Failed to update funds request');
    }
  }

  /**
   * Delete a funds request
   */
  async delete(model: WithdrawalRequest): Promise<void> {
    try {
      if (!this.canDelete(model)) {
        throw new ServiceError(
          'You do not have permission to delete this funds request',
          ServiceErrorType.PERMISSION_DENIED
        );
      }

      await model.delete();
    } catch (error) {
      throw this.handleError(error, 'Failed to delete funds request');
    }
  }

  /**
   * Submit a new funds request with validation
   */
  async submitRequest(data: {
    platformId: number;
    amount: number;
    accountDetails: string;
    message?: string;
  }): Promise<WithdrawalRequest> {
    try {
      // Validate user balance and platform limits
      await this.validateWithdrawalRequest(data);

      const attributes = {
        platformId: data.platformId,
        amount: data.amount,
        accountDetails: data.accountDetails,
        message: data.message || '',
        status: 'pending'
      };

      return await this.create(attributes);
    } catch (error) {
      throw this.handleError(error, 'Failed to submit funds request');
    }
  }

  /**
   * Get user's funds history
   */
  async getUserHistory(userId?: number, options: QueryOptions = {}): Promise<WithdrawalRequest[]> {
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
   * Get pending requests (admin only)
   */
  async getPendingRequests(options: QueryOptions = {}): Promise<WithdrawalRequest[]> {
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
   * Approve a funds request (admin only)
   */
  async approve(request: WithdrawalRequest, message?: string): Promise<WithdrawalRequest> {
    if (!app.session.user?.isAdmin()) {
      throw new ServiceError(
        'Admin permissions required',
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    if (!request.isPending()) {
      throw new ServiceError(
        'Only pending requests can be approved',
        ServiceErrorType.VALIDATION_ERROR
      );
    }

    const attributes: any = {
      status: 'approved'
    };

    if (message) {
      attributes.adminNote = message;
    }

    return await this.update(request, attributes);
  }

  /**
   * Reject a funds request (admin only)
   */
  async reject(request: WithdrawalRequest, reason?: string): Promise<WithdrawalRequest> {
    if (!app.session.user?.isAdmin()) {
      throw new ServiceError(
        'Admin permissions required',
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    if (!request.isPending()) {
      throw new ServiceError(
        'Only pending requests can be rejected',
        ServiceErrorType.VALIDATION_ERROR
      );
    }

    const attributes: any = {
      status: 'rejected'
    };

    if (reason) {
      attributes.adminNote = reason;
    }

    return await this.update(request, attributes);
  }

  /**
   * Cancel a pending request (user only)
   */
  async cancel(request: WithdrawalRequest): Promise<any> {
    if (!request.canBeModified()) {
      throw new ServiceError(
        'This request cannot be cancelled',
        ServiceErrorType.VALIDATION_ERROR
      );
    }

    const currentUser = app.session.user;
    if (!currentUser || (String(request.userId()) !== currentUser.id() && !currentUser.isAdmin())) {
      throw new ServiceError(
        'You can only cancel your own requests',
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    return await this.delete(request);
  }

  /**
   * Check if current user can modify a funds request
   */
  canModify(model: WithdrawalRequest): boolean {
    const currentUser = app.session.user;
    if (!currentUser) return false;

    // Admin can modify any request
    if (currentUser.isAdmin()) return true;

    // Users can only modify their own pending requests
    return String(model.userId()) === currentUser.id() && model.canBeModified();
  }

  /**
   * Check if current user can create new funds requests
   */
  canCreate(): boolean {
    const currentUser = app.session.user;
    return !!currentUser;
  }

  /**
   * Check if current user can delete a funds request
   */
  canDelete(model: WithdrawalRequest): boolean {
    const currentUser = app.session.user;
    if (!currentUser) return false;

    // Admin can delete any request
    if (currentUser.isAdmin()) return true;

    // Users can only delete their own pending requests
    return String(model.userId()) === currentUser.id() && model.canBeModified();
  }

  /**
   * Get available funds platforms
   */
  async getPlatforms(): Promise<WithdrawalPlatform[]> {
    try {
      const platforms = await app.store.find(this.platformModelType, {
        isActive: true,
        sort: 'name'
      });
      
      return Array.isArray(platforms) ? platforms : [platforms];
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch funds platforms');
    }
  }

  /**
   * Validate funds request data
   */
  private async validateWithdrawalRequest(data: any): Promise<void> {
    const { platformId, amount } = data;

    // Get platform details
    const platform = await app.store.find(this.platformModelType, String(platformId)) as unknown as WithdrawalPlatform;
    if (!platform) {
      throw new ServiceError(
        'Invalid platform selected',
        ServiceErrorType.VALIDATION_ERROR
      );
    }

    // Check if platform is active
    if (!platform.isActive?.()) {
      throw new ServiceError(
        'Selected platform is not available',
        ServiceErrorType.VALIDATION_ERROR
      );
    }

    // Validate amount limits
    const minAmount = platform.minAmount?.() || 0;
    const maxAmount = platform.maxAmount?.();
    
    if (amount < minAmount) {
      throw new ServiceError(
        `Minimum funds amount is ${minAmount}`,
        ServiceErrorType.VALIDATION_ERROR
      );
    }

    if (maxAmount && amount > maxAmount) {
      throw new ServiceError(
        `Maximum funds amount is ${maxAmount}`,
        ServiceErrorType.VALIDATION_ERROR
      );
    }

    // Check user balance
    const currentUser = app.session.user;
    if (currentUser) {
      const userBalance = parseFloat(currentUser.attribute('money') || '0');
      const fee = platform.fee?.() || 0;
      const totalRequired = amount + fee;

      if (userBalance < totalRequired) {
        throw new ServiceError(
          `Insufficient balance. Required: ${totalRequired}, Available: ${userBalance}`,
          ServiceErrorType.VALIDATION_ERROR
        );
      }
    }
  }

  /**
   * Validate create attributes
   */
  private validateCreateAttributes(attributes: any): void {
    const required = ['platformId', 'amount', 'accountDetails'];
    
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
export const withdrawalService = new WithdrawalService();