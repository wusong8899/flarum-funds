import Model from 'flarum/common/Model';

export default class DepositRecord extends Model {
  // Fixed: id() should return string to match Flarum's base Model interface
  id = Model.attribute<string>('id');
  userId = Model.attribute<number>('userId');
  platformId = Model.attribute<number>('platformId');
  platformAccount = Model.attribute<string>('platformAccount');
  realName = Model.attribute<string>('realName');
  amount = Model.attribute<number>('amount');
  depositTime = Model.attribute<Date>('depositTime', Model.transformDate);
  screenshotUrl = Model.attribute<string>('screenshotUrl');
  userMessage = Model.attribute<string>('userMessage');
  status = Model.attribute<string>('status');
  processedAt = Model.attribute<Date>('processedAt', Model.transformDate);
  processedBy = Model.attribute<number>('processedBy');
  adminNotes = Model.attribute<string>('adminNotes');
  creditedAmount = Model.attribute<number>('creditedAmount');
  createdAt = Model.attribute<Date>('createdAt', Model.transformDate);
  updatedAt = Model.attribute<Date>('updatedAt', Model.transformDate);

  // Relationships
  user = Model.hasOne('user');
  platform = Model.hasOne('platform');
  processedByUser = Model.hasOne('processedByUser');

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
}