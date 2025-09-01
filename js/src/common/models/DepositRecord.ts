import Model from 'flarum/common/Model';
import User from 'flarum/common/models/User';

export default class SimpleDepositRecord extends Model {
  // 属性
  userId = Model.attribute<number>('userId');
  depositAddress = Model.attribute<string>('depositAddress');
  qrCodeUrl = Model.attribute<string>('qrCodeUrl');
  userMessage = Model.attribute<string>('userMessage');
  status = Model.attribute<string>('status');
  statusText = Model.attribute<string>('statusText');
  processedAt = Model.attribute('processedAt', Model.transformDate);
  processedBy = Model.attribute<number>('processedBy');
  adminNotes = Model.attribute<string>('adminNotes');
  createdAt = Model.attribute('createdAt', Model.transformDate);
  updatedAt = Model.attribute('updatedAt', Model.transformDate);
  formattedCreatedAt = Model.attribute<string>('formattedCreatedAt');
  formattedProcessedAt = Model.attribute<string>('formattedProcessedAt');
  isPending = Model.attribute<boolean>('isPending');
  isApproved = Model.attribute<boolean>('isApproved');
  isRejected = Model.attribute<boolean>('isRejected');

  // 关联
  user = Model.hasOne<User>('user');
  processedByUser = Model.hasOne<User>('processedByUser');

  // 辅助方法
  getStatusColor(): string {
    switch (this.status()) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusIcon(): string {
    switch (this.status()) {
      case 'pending':
        return 'fas fa-clock';
      case 'approved':
        return 'fas fa-check-circle';
      case 'rejected':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-question-circle';
    }
  }

  canEdit(currentUser?: User): boolean {
    if (!currentUser) return false;
    
    // 管理员可以编辑任何记录
    if (currentUser.isAdmin()) return true;
    
    // 用户只能编辑自己的待处理记录
    return this.userId() === currentUser.id() && this.isPending();
  }

  canDelete(currentUser?: User): boolean {
    if (!currentUser) return false;
    
    // 只有管理员可以删除
    return currentUser.isAdmin();
  }

  getDisplayAddress(): string {
    const address = this.depositAddress();
    if (address && address.length > 20) {
      return `${address.substring(0, 10)}...${address.substring(address.length - 10)}`;
    }
    return address || '';
  }

  hasQrCode(): boolean {
    const qrUrl = this.qrCodeUrl();
    return qrUrl !== null && qrUrl !== undefined && qrUrl.trim() !== '';
  }
}