import Model from "flarum/common/Model";
import User from "flarum/common/models/User";
import WithdrawalPlatform from "./WithdrawalPlatform";
import { WithdrawalStatus, WITHDRAWAL_STATUS } from "../types";
import { ServiceError, ServiceErrorType } from "../types/services";
import app from "flarum/common/app";

/**
 * WithdrawalRequest model for Flarum
 *
 * This model represents a user's funds request with enhanced CRUD capabilities.
 */
export default class WithdrawalRequest extends Model {
  // Basic attributes
  amount = Model.attribute<number>("amount");
  accountDetails = Model.attribute<string>("accountDetails");
  message = Model.attribute<string>("message");
  status = Model.attribute<WithdrawalStatus>("status");

  // Foreign keys
  platformId = Model.attribute<number>("platformId");
  userId = Model.attribute<number>("userId");

  // Timestamps
  createdAt = Model.attribute<Date>("createdAt", (attr: unknown) =>
    Model.transformDate(attr as string)
  );
  updatedAt = Model.attribute<Date>("updatedAt", (attr: unknown) =>
    Model.transformDate(attr as string)
  );

  // Relationships
  user = Model.hasOne<User>("user");
  platform = Model.hasOne<WithdrawalPlatform>("platform");

  // Computed properties
  apiEndpoint() {
    const id = this.id();
    return id ? `/withdrawal-requests/${id}` : "/withdrawal-requests";
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
    return app.translator.trans(`funds.forum.status.${status}`).toString();
  }

  statusColor(): string {
    const status = this.status();
    switch (status) {
      case WITHDRAWAL_STATUS.APPROVED:
        return "success";
      case WITHDRAWAL_STATUS.REJECTED:
        return "danger";
      case WITHDRAWAL_STATUS.PENDING:
      default:
        return "warning";
    }
  }

  // Enhanced CRUD methods

  /**
   * Save this funds request with enhanced validation
   */
  async save(attributes?: Record<string, any>): Promise<any> {
    // Validate before saving if attributes provided
    if (attributes) {
      this.validateAttributes(attributes);
    }

    try {
      const result = await super.save(attributes || {});
      return result;
    } catch (error) {
      throw this.handleSaveError(error);
    }
  }

  /**
   * Delete this funds request with permission check
   */
  async delete(): Promise<void> {
    if (!this.canDelete()) {
      throw new ServiceError(
        "You do not have permission to delete this request",
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    // Only check if request can be modified for non-admin users
    const currentUser = app.session.user;
    if (currentUser && !currentUser.isAdmin() && !this.canBeModified()) {
      throw new ServiceError(
        "This request cannot be deleted as it has already been processed",
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
   * Clone this request for resubmission
   */
  clone(): WithdrawalRequest {
    const cloned = app.store.createRecord(
      "withdrawal-requests"
    ) as WithdrawalRequest;

    // Copy relevant attributes but not status/timestamps
    cloned.pushAttributes({
      platformId: this.platformId(),
      amount: this.amount(),
      accountDetails: this.accountDetails(),
      message: this.message(),
    });

    return cloned;
  }

  /**
   * Get total cost including fees
   */
  getTotalCost(): number {
    const platform = this.platform();
    const fee = platform ? platform.fee() || 0 : 0;
    return this.amount() + fee;
  }

  /**
   * Get formatted amount string
   */
  getFormattedAmount(): string {
    const platform = this.platform();
    const symbol = platform ? platform.symbol() : "";
    return `${this.amount()} ${symbol}`.trim();
  }

  /**
   * Get formatted total cost string including fees
   */
  getFormattedTotalCost(): string {
    const platform = this.platform();
    const symbol = platform ? platform.symbol() : "";
    const fee = platform ? platform.fee() || 0 : 0;

    if (fee > 0) {
      return `${this.amount()} + ${fee} (fee) = ${this.getTotalCost()} ${symbol}`.trim();
    }

    return this.getFormattedAmount();
  }

  // Permission methods

  /**
   * Check if current user can modify this request
   */
  canModify(): boolean {
    const currentUser = app.session.user;
    if (!currentUser) return false;

    // Admin can modify any request
    if (currentUser.isAdmin()) return true;

    // Users can only modify their own pending requests
    return String(this.userId()) === currentUser.id() && this.canBeModified();
  }

  /**
   * Check if current user can delete this request
   */
  canDelete(): boolean {
    const currentUser = app.session.user;
    if (!currentUser) return false;

    // Admin can delete any request
    if (currentUser.isAdmin()) return true;

    // Users can only delete their own pending requests
    return String(this.userId()) === currentUser.id() && this.canBeModified();
  }

  /**
   * Check if current user can view this request's details
   */
  canView(): boolean {
    const currentUser = app.session.user;
    if (!currentUser) return false;

    // Admin can view any request
    if (currentUser.isAdmin()) return true;

    // Users can only view their own requests
    return String(this.userId()) === currentUser.id();
  }

  // Validation methods

  /**
   * Validate attributes before saving
   */
  private validateAttributes(attributes: Record<string, any>): void {
    const errors: string[] = [];

    if (attributes.amount !== undefined) {
      if (typeof attributes.amount !== "number" || attributes.amount <= 0) {
        errors.push("Amount must be a positive number");
      }
    }

    if (attributes.accountDetails !== undefined) {
      if (
        !attributes.accountDetails ||
        typeof attributes.accountDetails !== "string"
      ) {
        errors.push("Account details are required");
      }
    }

    if (attributes.platformId !== undefined) {
      if (!attributes.platformId || typeof attributes.platformId !== "number") {
        errors.push("Platform selection is required");
      }
    }

    if (errors.length > 0) {
      throw new ServiceError(
        errors.join(", "),
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
        apiError.detail || "Failed to save funds request",
        ServiceErrorType.VALIDATION_ERROR,
        apiError.code,
        apiError
      );
    }

    return new ServiceError(
      error.message || "Failed to save funds request",
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
        "You do not have permission to delete this request",
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    return new ServiceError(
      error.message || "Failed to delete funds request",
      ServiceErrorType.SERVER_ERROR
    );
  }
}
