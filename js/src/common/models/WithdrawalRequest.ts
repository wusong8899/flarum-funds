import Model from 'flarum/common/Model';
import User from 'flarum/common/models/User';
import WithdrawalPlatform from './WithdrawalPlatform';
import { WithdrawalStatus, WITHDRAWAL_STATUS } from '../types';
import app from 'flarum/common/app';
/**
 * WithdrawalRequest model for Flarum
 * 
 * This model represents a user's withdrawal request.
 */
export default class WithdrawalRequest extends Model {
  // Basic attributes
  amount = Model.attribute<number>('amount');
  accountDetails = Model.attribute<string>('accountDetails');
  message = Model.attribute<string>('message');
  status = Model.attribute<WithdrawalStatus>('status');
  
  // Foreign keys
  platformId = Model.attribute<number>('platformId');
  userId = Model.attribute<number>('userId');
  
  // Timestamps
  createdAt = Model.attribute('createdAt', Model.transformDate);
  updatedAt = Model.attribute('updatedAt', Model.transformDate);
  
  // Relationships
  user = Model.hasOne<User>('user');
  platform = Model.hasOne<WithdrawalPlatform>('platform');
  
  // Computed properties
  apiEndpoint() {
    return `/withdrawal-requests/${this.id()}`;
  }
  
  // Status helpers
  isPending(): boolean {
    return this.status() === WITHDRAWAL_STATUS.PENDING;
  }
  
  isApproved(): boolean {
    return this.status() === WITHDRAWAL_STATUS.APPROVED;
  }
  
  isRejected(): boolean {
    return this.status() === WITHDRAWAL_STATUS.REJECTED;
  }
  
  canBeModified(): boolean {
    return this.isPending();
  }
  
  // Display helpers
  statusLabel(): string {
    const status = this.status();
    return app.translator.trans(`withdrawal.forum.status.${status}`).toString();
  }
  
  statusColor(): string {
    const status = this.status();
    switch (status) {
      case WITHDRAWAL_STATUS.APPROVED:
        return 'success';
      case WITHDRAWAL_STATUS.REJECTED:
        return 'danger';
      case WITHDRAWAL_STATUS.PENDING:
      default:
        return 'warning';
    }
  }
}