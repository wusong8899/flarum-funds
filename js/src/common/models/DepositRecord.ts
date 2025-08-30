import Model from 'flarum/common/Model';
import User from 'flarum/common/models/User';
import DepositPlatform from './DepositPlatform';
import { ServiceError, ServiceErrorType } from '../types/services';
import app from 'flarum/common/app';

export default class DepositRecord extends Model {
  // Fixed: id() should return string to match Flarum's base Model interface
  id = Model.attribute<string>('id');
  userId = Model.attribute<number>('userId');
  platformId = Model.attribute<number>('platformId');
  platformAccount = Model.attribute<string>('platformAccount');
  realName = Model.attribute<string>('realName');
  amount = Model.attribute<number>('amount');
  depositTime = Model.attribute('depositTime', Model.transformDate);
  screenshotUrl = Model.attribute<string>('screenshotUrl');
  userMessage = Model.attribute<string>('userMessage');
  status = Model.attribute<string>('status');
  processedAt = Model.attribute('processedAt', Model.transformDate);
  processedBy = Model.attribute<number>('processedBy');
  adminNotes = Model.attribute<string>('adminNotes');
  creditedAmount = Model.attribute<number>('creditedAmount');
  createdAt = Model.attribute('createdAt', Model.transformDate);
  updatedAt = Model.attribute('updatedAt', Model.transformDate);

  // Relationships
  user = Model.hasOne<User>('user');
  platform = Model.hasOne<DepositPlatform>('platform');
  processedByUser = Model.hasOne<User>('processedByUser');

  // Status constants
  static STATUS_PENDING = 'pending';
  static STATUS_APPROVED = 'approved';
  static STATUS_REJECTED = 'rejected';

  // Status check methods
  isPending(): boolean {
    return this.status() === DepositRecord.STATUS_PENDING;
  }

  isApproved(): boolean {
    return this.status() === DepositRecord.STATUS_APPROVED;
  }

  isRejected(): boolean {
    return this.status() === DepositRecord.STATUS_REJECTED;
  }

  getStatusColor(): string {
    switch (this.status()) {
      case DepositRecord.STATUS_PENDING:
        return 'warning';
      case DepositRecord.STATUS_APPROVED:
        return 'success';
      case DepositRecord.STATUS_REJECTED:
        return 'error';
      default:
        return 'secondary';
    }
  }

  // Display helpers
  getStatusLabel(): string {
    const status = this.status();
    return app.translator.trans(`withdrawal.forum.deposit.status.${status}`).toString();
  }

  canBeModified(): boolean {
    return this.isPending();
  }

  // Enhanced CRUD methods

  /**
   * Save this deposit record with enhanced validation
   */
  async save(attributes?: Record<string, any>): Promise<DepositRecord> {
    // Validate before saving if attributes provided
    if (attributes) {
      this.validateAttributes(attributes);
    }

    try {
      const result = await super.save(attributes);
      return result as DepositRecord;
    } catch (error) {
      throw this.handleSaveError(error);
    }
  }

  /**
   * Delete this deposit record with permission check
   */
  async delete(): Promise<void> {
    if (!this.canDelete()) {
      throw new ServiceError(
        'You do not have permission to delete this deposit record',
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    if (!this.canBeModified()) {
      throw new ServiceError(
        'This record cannot be deleted as it has already been processed',
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
   * Clone this record for resubmission
   */
  clone(): DepositRecord {
    const cloned = app.store.createRecord('deposit-records') as DepositRecord;
    
    // Copy relevant attributes but not status/timestamps
    cloned.pushAttributes({
      platformId: this.platformId(),
      amount: this.amount(),
      platformAccount: this.platformAccount(),
      realName: this.realName(),
      userMessage: this.userMessage(),
      screenshotUrl: this.screenshotUrl()
    });

    return cloned;
  }

  /**
   * Get formatted amount string
   */
  getFormattedAmount(): string {
    const platform = this.platform();
    const symbol = platform ? platform.symbol() : '';
    return `${this.amount()} ${symbol}`.trim();
  }

  /**
   * Get credited amount or original amount
   */
  getFinalAmount(): number {
    return this.creditedAmount() || this.amount();
  }

  /**
   * Get formatted credited amount
   */
  getFormattedFinalAmount(): string {
    const platform = this.platform();
    const symbol = platform ? platform.symbol() : '';
    const amount = this.getFinalAmount();
    
    if (this.creditedAmount() && this.creditedAmount() !== this.amount()) {
      return `${amount} ${symbol} (credited: ${this.creditedAmount()})`.trim();
    }
    
    return `${amount} ${symbol}`.trim();
  }

  // Permission methods

  /**
   * Check if current user can modify this record
   */
  canModify(): boolean {
    const currentUser = app.session.user;
    if (!currentUser) return false;

    // Admin can modify any record
    if (currentUser.isAdmin()) return true;

    // Users can only modify their own pending records
    return this.userId() === currentUser.id() && this.canBeModified();
  }

  /**
   * Check if current user can delete this record
   */
  canDelete(): boolean {
    const currentUser = app.session.user;
    if (!currentUser) return false;

    // Admin can delete any record
    if (currentUser.isAdmin()) return true;

    // Users can only delete their own pending records
    return this.userId() === currentUser.id() && this.canBeModified();
  }

  /**
   * Check if current user can view this record's details
   */
  canView(): boolean {
    const currentUser = app.session.user;
    if (!currentUser) return false;

    // Admin can view any record
    if (currentUser.isAdmin()) return true;

    // Users can only view their own records
    return this.userId() === currentUser.id();
  }

  /**
   * Check if current user can approve/reject this record
   */
  canProcess(): boolean {
    const currentUser = app.session.user;
    return currentUser && currentUser.isAdmin() && this.isPending();
  }

  // Workflow methods

  /**
   * Approve this deposit record
   */
  async approve(creditedAmount?: number, adminNotes?: string): Promise<DepositRecord> {
    if (!this.canProcess()) {
      throw new ServiceError(
        'You do not have permission to approve this deposit',
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    const attributes: any = {
      status: DepositRecord.STATUS_APPROVED,
      processedAt: new Date(),
      processedBy: app.session.user?.id()
    };

    if (creditedAmount !== undefined) {
      attributes.creditedAmount = creditedAmount;
    }

    if (adminNotes) {
      attributes.adminNotes = adminNotes;
    }

    return await this.save(attributes);
  }

  /**
   * Reject this deposit record
   */
  async reject(reason?: string): Promise<DepositRecord> {
    if (!this.canProcess()) {
      throw new ServiceError(
        'You do not have permission to reject this deposit',
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    const attributes: any = {
      status: DepositRecord.STATUS_REJECTED,
      processedAt: new Date(),
      processedBy: app.session.user?.id()
    };

    if (reason) {
      attributes.adminNotes = reason;
    }

    return await this.save(attributes);
  }

  // Validation methods

  /**
   * Validate attributes before saving
   */
  private validateAttributes(attributes: Record<string, any>): void {
    const errors: string[] = [];

    if (attributes.amount !== undefined) {
      if (typeof attributes.amount !== 'number' || attributes.amount <= 0) {
        errors.push('Amount must be a positive number');
      }
    }

    if (attributes.platformAccount !== undefined) {
      if (!attributes.platformAccount || typeof attributes.platformAccount !== 'string') {
        errors.push('Platform account is required');
      }
    }

    if (attributes.realName !== undefined) {
      if (!attributes.realName || typeof attributes.realName !== 'string') {
        errors.push('Real name is required');
      } else if (attributes.realName.trim().length < 2) {
        errors.push('Real name must be at least 2 characters long');
      }
    }

    if (attributes.platformId !== undefined) {
      if (!attributes.platformId || typeof attributes.platformId !== 'number') {
        errors.push('Platform selection is required');
      }
    }

    if (attributes.creditedAmount !== undefined) {
      if (typeof attributes.creditedAmount !== 'number' || attributes.creditedAmount < 0) {
        errors.push('Credited amount must be a non-negative number');
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
        apiError.detail || 'Failed to save deposit record',
        ServiceErrorType.VALIDATION_ERROR,
        apiError.code,
        apiError
      );
    }

    return new ServiceError(
      error.message || 'Failed to save deposit record',
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
        'You do not have permission to delete this record',
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    return new ServiceError(
      error.message || 'Failed to delete deposit record',
      ServiceErrorType.SERVER_ERROR
    );
  }
}