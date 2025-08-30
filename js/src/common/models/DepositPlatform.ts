import Model from 'flarum/common/Model';
import { ServiceError, ServiceErrorType } from '../types/services';
import app from 'flarum/common/app';

export default class DepositPlatform extends Model {
  name = Model.attribute<string>('name');
  symbol = Model.attribute<string>('symbol');
  network = Model.attribute<string>('network');
  networkTypeId = Model.attribute('networkTypeId');
  displayName = Model.attribute<string>('displayName');
  minAmount = Model.attribute('minAmount');
  maxAmount = Model.attribute('maxAmount');
  fee = Model.attribute('fee');
  address = Model.attribute('address');
  qrCodeImageUrl = Model.attribute<string>('qrCodeImageUrl');
  iconUrl = Model.attribute<string>('iconUrl');
  iconClass = Model.attribute<string>('iconClass');
  warningText = Model.attribute<string>('warningText');
  networkConfig = Model.attribute('networkConfig');
  isActive = Model.attribute('isActive');
  createdAt = Model.attribute('createdAt', Model.transformDate);
  updatedAt = Model.attribute('updatedAt', Model.transformDate);

  // Relationships
  networkType = Model.hasOne('networkType');

  // Helper methods
  getDisplayName(): string {
    return this.displayName() || this.name();
  }

  getFullDisplayName(): string {
    const name = this.getDisplayName();
    const network = this.network();
    return network ? `${name} (${network})` : name;
  }

  isValidAmount(amount: number): boolean {
    const min = this.minAmount() || 0;
    const max = this.maxAmount();
    return amount >= min && (max === null || amount <= max);
  }

  getTotalCost(amount: number): number {
    return amount + (this.fee() || 0);
  }

  // Enhanced CRUD methods

  /**
   * Save this platform with enhanced validation
   */
  async save(attributes?: Record<string, any>): Promise<DepositPlatform> {
    // Validate before saving if attributes provided
    if (attributes) {
      this.validateAttributes(attributes);
    }

    try {
      const result = await super.save(attributes);
      return result as DepositPlatform;
    } catch (error) {
      throw this.handleSaveError(error);
    }
  }

  /**
   * Delete this platform with permission check
   */
  async delete(): Promise<void> {
    if (!this.canDelete()) {
      throw new ServiceError(
        'You do not have permission to delete this platform',
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    // Check if platform is in use
    if (await this.isInUse()) {
      throw new ServiceError(
        'Cannot delete platform that has pending deposit records',
        ServiceErrorType.VALIDATION_ERROR
      );
    }

    try {
      await super.delete();
    } catch (error) {
      throw this.handleDeleteError(error);
    }
  }

  /**
   * Toggle platform status
   */
  async toggleStatus(): Promise<DepositPlatform> {
    if (!this.canModify()) {
      throw new ServiceError(
        'You do not have permission to modify this platform',
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    return await this.save({
      isActive: !this.isActive()
    });
  }

  /**
   * Clone this platform for creating a similar one
   */
  clone(): DepositPlatform {
    const cloned = app.store.createRecord('deposit-platforms') as DepositPlatform;
    
    // Copy relevant attributes but not id/timestamps
    cloned.pushAttributes({
      name: this.name() + ' (Copy)',
      symbol: this.symbol(),
      network: this.network(),
      networkTypeId: this.networkTypeId(),
      minAmount: this.minAmount(),
      maxAmount: this.maxAmount(),
      fee: this.fee(),
      address: this.address(),
      qrCodeImageUrl: this.qrCodeImageUrl(),
      iconUrl: this.iconUrl(),
      iconClass: this.iconClass(),
      warningText: this.warningText(),
      isActive: false // Clone as inactive by default
    });

    return cloned;
  }

  // Validation methods

  /**
   * Validate amount against platform limits
   */
  validateAmount(amount: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof amount !== 'number' || amount <= 0) {
      errors.push('Amount must be a positive number');
      return { valid: false, errors };
    }

    const min = this.minAmount() || 0;
    if (amount < min) {
      errors.push(`Amount must be at least ${min} ${this.symbol()}`);
    }

    const max = this.maxAmount();
    if (max && amount > max) {
      errors.push(`Amount cannot exceed ${max} ${this.symbol()}`);
    }

    return { valid: errors.length === 0, errors };
  }

  // Permission methods

  /**
   * Check if current user can modify this platform
   */
  canModify(): boolean {
    const currentUser = app.session.user;
    return currentUser && currentUser.isAdmin();
  }

  /**
   * Check if current user can delete this platform
   */
  canDelete(): boolean {
    const currentUser = app.session.user;
    return currentUser && currentUser.isAdmin();
  }

  /**
   * Check if current user can view this platform
   */
  canView(): boolean {
    // All authenticated users can view active platforms
    if (this.isActive()) return true;
    
    // Only admins can view inactive platforms
    const currentUser = app.session.user;
    return currentUser && currentUser.isAdmin();
  }

  // Utility methods

  /**
   * Check if this platform is currently in use
   */
  async isInUse(): Promise<boolean> {
    try {
      const records = await app.store.find('deposit-records', {
        filter: { platform: this.id(), status: 'pending' }
      });
      
      const recordsArray = Array.isArray(records) ? records : [records];
      return recordsArray.length > 0;
    } catch {
      // If we can't check, assume it's in use to be safe
      return true;
    }
  }

  /**
   * Get formatted fee display
   */
  getFormattedFee(): string {
    const fee = this.fee() || 0;
    if (fee === 0) {
      return 'Free';
    }
    return `${fee} ${this.symbol()}`;
  }

  /**
   * Get formatted limits display
   */
  getFormattedLimits(): string {
    const min = this.minAmount() || 0;
    const max = this.maxAmount();
    const symbol = this.symbol();

    if (max) {
      return `${min} - ${max} ${symbol}`;
    }
    return `Min: ${min} ${symbol}`;
  }

  /**
   * Generate deposit address for user
   */
  generateDepositAddress(_userId?: number): string {
    const address = this.address();
    
    // For now, we return the static address
    // In the future, this could be enhanced to support dynamic address generation
    if (address) {
      return address;
    }
    
    throw new ServiceError(
      'No deposit address configured for this platform',
      ServiceErrorType.VALIDATION_ERROR
    );
  }

  // Private validation methods

  /**
   * Validate attributes before saving
   */
  private validateAttributes(attributes: Record<string, any>): void {
    const errors: string[] = [];

    if (attributes.name !== undefined) {
      if (!attributes.name || typeof attributes.name !== 'string') {
        errors.push('Platform name is required');
      } else if (attributes.name.trim().length < 2) {
        errors.push('Platform name must be at least 2 characters long');
      }
    }

    if (attributes.symbol !== undefined) {
      if (!attributes.symbol || typeof attributes.symbol !== 'string') {
        errors.push('Symbol is required');
      } else if (attributes.symbol.trim().length < 2) {
        errors.push('Symbol must be at least 2 characters long');
      }
    }

    if (attributes.network !== undefined) {
      if (!attributes.network || typeof attributes.network !== 'string') {
        errors.push('Network is required');
      }
    }

    if (attributes.address !== undefined) {
      if (!attributes.address || typeof attributes.address !== 'string') {
        errors.push('Deposit address is required');
      } else if (attributes.address.trim().length < 10) {
        errors.push('Deposit address must be at least 10 characters long');
      }
    }

    if (attributes.minAmount !== undefined) {
      if (typeof attributes.minAmount !== 'number' || attributes.minAmount < 0) {
        errors.push('Minimum amount must be a non-negative number');
      }
    }

    if (attributes.maxAmount !== undefined && attributes.maxAmount !== null) {
      if (typeof attributes.maxAmount !== 'number' || attributes.maxAmount < 0) {
        errors.push('Maximum amount must be a non-negative number');
      }
      
      const minAmount = attributes.minAmount || this.minAmount() || 0;
      if (attributes.maxAmount < minAmount) {
        errors.push('Maximum amount must be greater than or equal to minimum amount');
      }
    }

    if (attributes.fee !== undefined && attributes.fee !== null) {
      if (typeof attributes.fee !== 'number' || attributes.fee < 0) {
        errors.push('Fee must be a non-negative number');
      }
    }

    if (errors.length > 0) {
      throw new ServiceError(
        errors.join(', '),
        ServiceErrorType.VALIDATION_ERROR
      );
    }
  }

  /**
   * Handle save errors with proper typing
   */
  private handleSaveError(error: any): ServiceError {
    if (error instanceof ServiceError) {
      return error;
    }

    // Handle Flarum API validation errors
    if (error.response && error.response.errors) {
      const apiError = error.response.errors[0];
      return new ServiceError(
        apiError.detail || 'Failed to save deposit platform',
        ServiceErrorType.VALIDATION_ERROR,
        apiError.code,
        apiError
      );
    }

    return new ServiceError(
      error.message || 'Failed to save deposit platform',
      ServiceErrorType.SERVER_ERROR
    );
  }

  /**
   * Handle delete errors with proper typing
   */
  private handleDeleteError(error: any): ServiceError {
    if (error instanceof ServiceError) {
      return error;
    }

    // Handle permission errors
    if (error.status === 403 || error.response?.status === 403) {
      return new ServiceError(
        'You do not have permission to delete this platform',
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    return new ServiceError(
      error.message || 'Failed to delete deposit platform',
      ServiceErrorType.SERVER_ERROR
    );
  }
}