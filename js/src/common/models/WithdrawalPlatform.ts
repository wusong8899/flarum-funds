import Model from "flarum/common/Model";
import { ServiceError, ServiceErrorType } from "../types/services";
import { validateWithdrawalPlatform } from "../utils/PlatformValidation";
import { IconRepresentation } from "./CurrencyIcon";
import app from "flarum/common/app";

/**
 * WithdrawalPlatform model for Flarum
 *
 * This model represents a funds platform that users can use
 * to withdraw their virtual currency with enhanced CRUD capabilities.
 */
export default class WithdrawalPlatform extends Model {
  // Basic attributes
  name = Model.attribute<string>("name");
  symbol = Model.attribute<string>("symbol");
  network = Model.attribute<string | null>("network");
  displayName = Model.attribute<string>("displayName");
  minAmount = Model.attribute<number>("minAmount");
  maxAmount = Model.attribute<number>("maxAmount");
  fee = Model.attribute<number>("fee");

  // Three-tier icon system - computed properties
  currencyIconUrl = Model.attribute<string>("currencyIconUrl");
  currencyIconClass = Model.attribute<string>("currencyIconClass");
  currencyUnicodeSymbol = Model.attribute<string>("currencyUnicodeSymbol");
  networkIconUrl = Model.attribute<string>("networkIconUrl");
  networkIconClass = Model.attribute<string>("networkIconClass");
  platformSpecificIconUrl = Model.attribute<string>("platformSpecificIconUrl");
  platformSpecificIconClass = Model.attribute<string>(
    "platformSpecificIconClass"
  );

  // Override fields for admin configuration
  currencyIconOverrideUrl = Model.attribute<string>("currencyIconOverrideUrl");
  currencyIconOverrideClass = Model.attribute<string>(
    "currencyIconOverrideClass"
  );
  networkIconOverrideUrl = Model.attribute<string>("networkIconOverrideUrl");
  networkIconOverrideClass = Model.attribute<string>(
    "networkIconOverrideClass"
  );

  // Status
  isActive = Model.attribute<boolean>("isActive");

  // Timestamps
  createdAt = Model.attribute("createdAt", Model.transformDate);
  updatedAt = Model.attribute("updatedAt", Model.transformDate);

  // Icon representations from serializer
  bestIcon = Model.attribute<IconRepresentation>("bestIcon");
  currencyIcon = Model.attribute<IconRepresentation>("currencyIcon");
  networkIcon = Model.attribute<IconRepresentation>("networkIcon");

  // Computed properties
  apiEndpoint() {
    const id = this.id();
    return id ? `/funds-platforms/${id}` : "/funds-platforms";
  }

  // Helper methods
  getDisplayName(): string {
    return this.displayName() || this.name();
  }

  isValidAmount(amount: number): boolean {
    const min = this.minAmount();
    const max = this.maxAmount();
    return amount >= min && amount <= max;
  }

  getTotalCost(amount: number): number {
    return amount + this.fee();
  }

  // Enhanced CRUD methods

  /**
   * Save this platform with enhanced validation
   */
  async save(attributes?: Record<string, any>): Promise<WithdrawalPlatform> {
    // Validate before saving if attributes provided
    if (attributes) {
      this.validateAttributes(attributes);
    }

    try {
      const result = await super.save(attributes);
      return result as WithdrawalPlatform;
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
        "You do not have permission to delete this platform",
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    // Check if platform is in use
    if (await this.isInUse()) {
      throw new ServiceError(
        "Cannot delete platform that has pending funds requests",
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
  async toggleStatus(): Promise<WithdrawalPlatform> {
    if (!this.canModify()) {
      throw new ServiceError(
        "You do not have permission to modify this platform",
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    return await this.save({
      isActive: !this.isActive(),
    });
  }

  /**
   * Clone this platform for creating a similar one
   */
  clone(): WithdrawalPlatform {
    const cloned = app.store.createRecord(
      "funds-platforms"
    ) as WithdrawalPlatform;

    // Copy relevant attributes but not id/timestamps
    cloned.pushAttributes({
      name: this.name() + " (Copy)",
      symbol: this.symbol(),
      network: this.network(),
      minAmount: this.minAmount(),
      maxAmount: this.maxAmount(),
      fee: this.fee(),
      // Copy three-tier icon fields
      currencyIconOverrideUrl: this.currencyIconOverrideUrl(),
      currencyIconOverrideClass: this.currencyIconOverrideClass(),
      networkIconOverrideUrl: this.networkIconOverrideUrl(),
      networkIconOverrideClass: this.networkIconOverrideClass(),
      isActive: false, // Clone as inactive by default
    });

    return cloned;
  }

  // Validation methods

  /**
   * Validate amount against platform limits
   */
  validateAmount(amount: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof amount !== "number" || amount <= 0) {
      errors.push("Amount must be a positive number");
      return { valid: false, errors };
    }

    if (amount < this.minAmount()) {
      errors.push(
        `Amount must be at least ${this.minAmount()} ${this.symbol()}`
      );
    }

    if (this.maxAmount() && amount > this.maxAmount()) {
      errors.push(`Amount cannot exceed ${this.maxAmount()} ${this.symbol()}`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Check if user has sufficient balance for funds
   */
  validateUserBalance(
    amount: number,
    userBalance: number
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const totalCost = this.getTotalCost(amount);

    if (userBalance < totalCost) {
      const feeText =
        this.fee() > 0 ? ` (including ${this.fee()} ${this.symbol()} fee)` : "";
      errors.push(
        `Insufficient balance. Required: ${totalCost} ${this.symbol()}${feeText}, Available: ${userBalance} ${this.symbol()}`
      );
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
      const requests = await app.store.find("funds-requests", {
        filter: { platform: this.id(), status: "pending" },
      });

      const requestsArray = Array.isArray(requests) ? requests : [requests];
      return requestsArray.length > 0;
    } catch {
      // If we can't check, assume it's in use to be safe
      return true;
    }
  }

  /**
   * Get formatted fee display
   */
  getFormattedFee(): string {
    const fee = this.fee();
    if (fee === 0) {
      return "Free";
    }
    return `${fee} ${this.symbol()}`;
  }

  /**
   * Get formatted limits display
   */
  getFormattedLimits(): string {
    const min = this.minAmount();
    const max = this.maxAmount();
    const symbol = this.symbol();

    if (max) {
      return `${min} - ${max} ${symbol}`;
    }
    return `Min: ${min} ${symbol}`;
  }

  // Private validation methods

  /**
   * Validate attributes before saving
   */
  private validateAttributes(attributes: Record<string, any>): void {
    validateWithdrawalPlatform(attributes, this.minAmount());
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
        apiError.detail || "Failed to save funds platform",
        ServiceErrorType.VALIDATION_ERROR,
        apiError.code,
        apiError
      );
    }

    return new ServiceError(
      error.message || "Failed to save funds platform",
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
        "You do not have permission to delete this platform",
        ServiceErrorType.PERMISSION_DENIED
      );
    }

    return new ServiceError(
      error.message || "Failed to delete funds platform",
      ServiceErrorType.SERVER_ERROR
    );
  }
}
