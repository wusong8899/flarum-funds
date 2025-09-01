import app from "flarum/common/app";
import {
  ServiceError,
  ServiceErrorType,
  SettingsServiceInterface,
} from "../types/services";

/**
 * Service for managing Flarum admin settings
 * Provides type-safe settings operations with proper error handling
 */
export default class SettingsService implements SettingsServiceInterface {
  private readonly settingsEndpoint = "/settings";

  /**
   * Get a setting value
   */
  async getSetting(key: string, defaultValue?: any): Promise<any> {
    try {
      // First try to get from forum attributes (cached)
      if (app.forum) {
        const cachedValue = app.forum.attribute(key);
        if (cachedValue !== undefined && cachedValue !== null) {
          return cachedValue;
        }
      }

      // If not cached or forum not available, return default
      return defaultValue;
    } catch (error) {
      throw this.handleError(error, `Failed to get setting: ${key}`);
    }
  }

  /**
   * Save a setting value
   */
  async saveSetting(key: string, value: any): Promise<void> {
    try {
      // Validate inputs
      if (!key || typeof key !== "string") {
        throw new ServiceError(
          "Setting key must be a non-empty string",
          ServiceErrorType.VALIDATION_ERROR
        );
      }

      // Prepare the value for storage
      const storageValue = this.prepareValueForStorage(value);

      // Make the API request using Flarum's store mechanism
      const settings = app.store.createRecord("settings");
      await settings.save({ [key]: storageValue });

      // Update the forum attribute immediately for UI consistency
      if (app.forum) {
        app.forum.pushAttributes({ [key]: value });
      }
    } catch (error) {
      throw this.handleError(error, `Failed to save setting: ${key}`);
    }
  }

  /**
   * Save multiple settings at once
   */
  async saveSettings(settings: Record<string, any>): Promise<void> {
    try {
      // Validate inputs
      if (!settings || typeof settings !== "object") {
        throw new ServiceError(
          "Settings must be an object",
          ServiceErrorType.VALIDATION_ERROR
        );
      }

      // Prepare all values for storage
      const preparedSettings: Record<string, any> = {};
      const forumAttributes: Record<string, any> = {};

      for (const [key, value] of Object.entries(settings)) {
        if (!key || typeof key !== "string") {
          throw new ServiceError(
            `Setting key '${key}' must be a non-empty string`,
            ServiceErrorType.VALIDATION_ERROR
          );
        }
        preparedSettings[key] = this.prepareValueForStorage(value);
        forumAttributes[key] = value;
      }

      // Make the API request
      const settingsRecord = app.store.createRecord("settings");
      await settingsRecord.save(preparedSettings);

      // Update forum attributes
      if (app.forum) {
        app.forum.pushAttributes(forumAttributes);
      }
    } catch (error) {
      throw this.handleError(error, "Failed to save multiple settings");
    }
  }

  /**
   * Delete a setting
   */
  async deleteSetting(key: string): Promise<void> {
    try {
      if (!key || typeof key !== "string") {
        throw new ServiceError(
          "Setting key must be a non-empty string",
          ServiceErrorType.VALIDATION_ERROR
        );
      }

      // Set to null to delete the setting
      await this.saveSetting(key, null);
    } catch (error) {
      throw this.handleError(error, `Failed to delete setting: ${key}`);
    }
  }

  /**
   * Get all settings with a prefix
   */
  async getSettingsWithPrefix(prefix: string): Promise<Record<string, any>> {
    try {
      if (!prefix || typeof prefix !== "string") {
        throw new ServiceError(
          "Prefix must be a non-empty string",
          ServiceErrorType.VALIDATION_ERROR
        );
      }

      const settings: Record<string, any> = {};

      if (app.forum) {
        const attributes = app.forum.data.attributes ?? {};
        for (const [key, value] of Object.entries(attributes)) {
          if (key.startsWith(prefix)) {
            settings[key] = value;
          }
        }
      }

      return settings;
    } catch (error) {
      throw this.handleError(
        error,
        `Failed to get settings with prefix: ${prefix}`
      );
    }
  }

  /**
   * Check if current user can manage settings
   */
  canManageSettings(): boolean {
    const currentUser = app.session.user;
    return !!(currentUser && currentUser.isAdmin());
  }

  /**
   * Get extension-specific setting with proper namespace
   */
  async getExtensionSetting(
    extension: string,
    key: string,
    defaultValue?: any
  ): Promise<any> {
    const fullKey = `${extension}.${key}`;
    return await this.getSetting(fullKey, defaultValue);
  }

  /**
   * Save extension-specific setting with proper namespace
   */
  async saveExtensionSetting(
    extension: string,
    key: string,
    value: any
  ): Promise<void> {
    const fullKey = `${extension}.${key}`;
    return await this.saveSetting(fullKey, value);
  }

  /**
   * Get funds extension settings
   */
  async getWithdrawalSetting(key: string, defaultValue?: any): Promise<any> {
    return await this.getExtensionSetting(
      "wusong8899-funds",
      key,
      defaultValue
    );
  }

  /**
   * Save funds extension setting
   */
  async saveWithdrawalSetting(key: string, value: any): Promise<void> {
    return await this.saveExtensionSetting("wusong8899-funds", key, value);
  }

  /**
   * Get all funds extension settings
   */
  async getAllWithdrawalSettings(): Promise<Record<string, any>> {
    return await this.getSettingsWithPrefix("wusong8899-funds.");
  }

  /**
   * Prepare value for storage (handle objects, arrays, booleans)
   */
  private prepareValueForStorage(value: any): string {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "boolean") {
      return value ? "1" : "0";
    }

    if (typeof value === "number") {
      return String(value);
    }

    // Objects and arrays get JSON stringified
    return JSON.stringify(value);
  }

  /**
   * Handle service errors with proper typing
   */
  private handleError(error: any, defaultMessage: string): ServiceError {
    if (error instanceof ServiceError) {
      return error;
    }

    // Handle permission errors
    if (error.status === 403 || error.response?.status === 403) {
      return new ServiceError(
        "Admin permissions required to manage settings",
        ServiceErrorType.PERMISSION_DENIED
      );
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
    if (error.name === "TypeError" || error.message?.includes("fetch")) {
      return new ServiceError(
        "Network error occurred while managing settings",
        ServiceErrorType.NETWORK_ERROR
      );
    }

    // Default error handling
    return new ServiceError(
      error.message || defaultMessage,
      ServiceErrorType.SERVER_ERROR
    );
  }
}

// Export singleton instance
export const settingsService = new SettingsService();
