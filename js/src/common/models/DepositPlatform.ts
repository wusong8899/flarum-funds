import Model from "flarum/common/Model";
import { ServiceError, ServiceErrorType } from "../types/services";
import { validateDepositPlatform } from "../utils/PlatformValidation";
import { IconRepresentation } from "./CurrencyIcon";
import app from "flarum/common/app";

/**
 * DepositPlatform model for Flarum
 *
 * Uses the unified platform structure defined in PlatformStructure.ts
 */
export default class DepositPlatform extends Model {
  name = Model.attribute<string>("name");
  symbol = Model.attribute<string>("symbol");
  network = Model.attribute<string>("network");
  networkTypeId = Model.attribute<number>("networkTypeId");
  displayName = Model.attribute<string>("displayName");
  minAmount = Model.attribute<number>("minAmount");
  maxAmount = Model.attribute<number>("maxAmount");
  fee = Model.attribute<number>("fee");
  address = Model.attribute<string>("address");
  qrCodeImageUrl = Model.attribute<string>("qrCodeImageUrl");
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
  warningText = Model.attribute<string>("warningText");
  networkConfig = Model.attribute<any>("networkConfig");
  isActive = Model.attribute<boolean>("isActive");
  createdAt = Model.attribute<Date>("createdAt", (attr: unknown) =>
    Model.transformDate(attr as string)
  );
  updatedAt = Model.attribute<Date>("updatedAt", (attr: unknown) =>
    Model.transformDate(attr as string)
  );

  // Relationships
  networkType = Model.hasOne("networkType");

  // Icon representations from serializer
  bestIcon = Model.attribute<IconRepresentation>("bestIcon");
  currencyIcon = Model.attribute<IconRepresentation>("currencyIcon");
  networkIcon = Model.attribute<IconRepresentation>("networkIcon");

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
    return amount >= min && (!max || amount <= max);
  }

  getTotalCost(amount: number): number {
    return amount + (this.fee() || 0);
  }

  // Enhanced CRUD methods

  /**
   * Save this platform with enhanced validation
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
        "Cannot delete platform that has pending deposit records",
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
  clone(): DepositPlatform {
    const cloned = app.store.createRecord(
      "deposit-platforms"
    ) as DepositPlatform;

    // Copy relevant attributes but not id/timestamps
    cloned.pushAttributes({
      name: this.name() + " (Copy)",
      symbol: this.symbol(),
      network: this.network(),
      networkTypeId: this.networkTypeId(),
      minAmount: this.minAmount(),
      maxAmount: this.maxAmount(),
      fee: this.fee(),
      address: this.address(),
      qrCodeImageUrl: this.qrCodeImageUrl(),
      currencyIconUrl: this.currencyIconUrl(),
      currencyIconClass: this.currencyIconClass(),
      warningText: this.warningText(),
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
    return !!(currentUser && currentUser.isAdmin());
  }

  /**
   * Check if current user can delete this platform
   */
  canDelete(): boolean {
    const currentUser = app.session.user;
    return !!(currentUser && currentUser.isAdmin());
  }

  /**
   * Check if current user can view this platform
   */
  canView(): boolean {
    // All authenticated users can view active platforms
    if (this.isActive()) return true;

    // Only admins can view inactive platforms
    const currentUser = app.session.user;
    return !!(currentUser && currentUser.isAdmin());
  }

  // Utility methods

  /**
   * Check if this platform is currently in use
   */
  async isInUse(): Promise<boolean> {
    try {
      const id = this.id();
      if (!id) {
        return false;
      }
      const records = await app.store.find("deposit-records", {
        filter: { platform: id.toString(), status: "pending" },
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
      return "Free";
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
    if (address && typeof address === "string") {
      return address;
    }

    throw new ServiceError(
      "No deposit address configured for this platform",
      ServiceErrorType.VALIDATION_ERROR
    );
  }

  // Private validation methods

  /**
   * Validate attributes before saving
   */
  private validateAttributes(attributes: Record<string, any>): void {
    validateDepositPlatform(attributes, this.minAmount() || undefined);
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
        apiError.detail || "Failed to save deposit platform",
        ServiceErrorType.VALIDATION_ERROR,
        apiError.code,
        apiError
      );
    }

    return new ServiceError(
      error.message || "Failed to save deposit platform",
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
      error.message || "Failed to delete deposit platform",
      ServiceErrorType.SERVER_ERROR
    );
  }
}
