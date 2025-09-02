import Model from "flarum/common/Model";
import User from "flarum/common/models/User";

export default class DepositRecord extends Model {
  // 属性
  userId = Model.attribute<number>("userId");
  platformId = Model.attribute<number>("platformId");
  amount = Model.attribute<number>("amount");
  depositTime = Model.attribute("depositTime", Model.transformDate);
  userMessage = Model.attribute<string>("userMessage");
  status = Model.attribute<string>("status");
  statusText = Model.attribute<string>("statusText");
  processedAt = Model.attribute("processedAt", Model.transformDate);
  processedBy = Model.attribute<number>("processedBy");
  adminNotes = Model.attribute<string>("adminNotes");
  createdAt = Model.attribute("createdAt", Model.transformDate);
  updatedAt = Model.attribute("updatedAt", Model.transformDate);
  formattedCreatedAt = Model.attribute<string>("formattedCreatedAt");
  formattedProcessedAt = Model.attribute<string>("formattedProcessedAt");
  isPending = Model.attribute<boolean>("isPending");
  isApproved = Model.attribute<boolean>("isApproved");
  isRejected = Model.attribute<boolean>("isRejected");

  // 关联
  user = Model.hasOne<User>("user");
  processedByUser = Model.hasOne<User>("processedByUser");
  platform = Model.hasOne("platform");

  // 辅助方法
  getStatusColor(): string {
    switch (this.status()) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "secondary";
    }
  }

  getStatusIcon(): string {
    switch (this.status()) {
      case "pending":
        return "fas fa-clock";
      case "approved":
        return "fas fa-check-circle";
      case "rejected":
        return "fas fa-times-circle";
      default:
        return "fas fa-question-circle";
    }
  }

  canEdit(currentUser?: User): boolean {
    if (!currentUser) return false;

    // 管理员可以编辑任何记录
    if (currentUser.isAdmin()) return true;

    // 用户只能编辑自己的待处理记录
    return this.userId().toString() === currentUser.id() && this.isPending();
  }

  canDelete(currentUser?: User): boolean {
    if (!currentUser) return false;

    // 只有管理员可以删除
    return currentUser.isAdmin() || false;
  }

  getFormattedAmount(): string {
    const amount = this.amount();
    return amount ? amount.toFixed(2) : "0.00";
  }

  getFormattedDepositTime(): string {
    const time = this.depositTime();
    return time
      ? time.toLocaleDateString() + " " + time.toLocaleTimeString()
      : "";
  }
}
