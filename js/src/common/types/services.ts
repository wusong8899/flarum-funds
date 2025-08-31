import Model from 'flarum/common/Model';

/**
 * Standard pagination parameters for Flarum API requests
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  page?: {
    limit?: number;
    offset?: number;
  };
}

/**
 * Standard filter options for API requests
 */
export interface FilterOptions {
  [key: string]: any;
}

/**
 * Standard sort options for API requests
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Standard query options for finding records
 */
export interface QueryOptions {
  include?: string | string[];
  filter?: FilterOptions;
  sort?: string | SortOptions | SortOptions[];
  page?: PaginationOptions;
}

/**
 * Service response wrapper for better error handling
 */
export interface ServiceResponse<T> {
  data: T;
  meta?: {
    total?: number;
    count?: number;
    hasMore?: boolean;
  };
  errors?: Array<{
    detail: string;
    source?: any;
  }>;
}

/**
 * Base service interface that all services should implement
 */
export interface BaseService<TModel extends Model> {
  /**
   * Find multiple records
   */
  find(options?: QueryOptions): Promise<TModel[]>;

  /**
   * Find a single record by ID
   */
  findById(id: string | number, options?: QueryOptions): Promise<TModel | null>;

  /**
   * Create a new record
   */
  create(attributes: Record<string, any>): Promise<TModel>;

  /**
   * Update an existing record
   */
  update(model: TModel, attributes: Record<string, any>): Promise<TModel>;

  /**
   * Delete a record
   */
  delete(model: TModel): Promise<void>;

  /**
   * Check if a record can be modified by current user
   */
  canModify(model: TModel): boolean;

  /**
   * Check if current user can create new records
   */
  canCreate(): boolean;

  /**
   * Check if current user can delete a record
   */
  canDelete(model: TModel): boolean;
}

/**
 * Withdrawal-specific service interface
 */
export interface WithdrawalServiceInterface extends BaseService<any> {
  /**
   * Submit a withdrawal request
   */
  submitRequest(data: {
    platformId: number;
    amount: number;
    accountDetails: string;
    message?: string;
  }): Promise<any>;

  /**
   * Get user's withdrawal history
   */
  getUserHistory(userId?: number, options?: QueryOptions): Promise<any[]>;

  /**
   * Get pending requests (admin only)
   */
  getPendingRequests(options?: QueryOptions): Promise<any[]>;

  /**
   * Approve a withdrawal request (admin only)
   */
  approve(request: any, message?: string): Promise<any>;

  /**
   * Reject a withdrawal request (admin only)
   */
  reject(request: any, reason?: string): Promise<any>;

  /**
   * Cancel a pending request (user only)
   */
  cancel(request: any): Promise<any>;
}

/**
 * Deposit-specific service interface
 */
export interface DepositServiceInterface extends BaseService<any> {
  /**
   * Generate deposit address for user
   */
  generateAddress(platformId: number): Promise<string>;

  /**
   * Get user's deposit history
   */
  getUserHistory(userId?: number, options?: QueryOptions): Promise<any[]>;

  /**
   * Create deposit record
   */
  createRecord(data: {
    platformId: number;
    amount: number;
    transactionHash: string;
    note?: string;
  }): Promise<any>;

  /**
   * Get pending deposits (admin only)
   */
  getPendingDeposits(options?: QueryOptions): Promise<any[]>;

  /**
   * Confirm a deposit (admin only)
   */
  confirm(deposit: any, confirmedAmount?: number): Promise<any>;
}

/**
 * Platform service interface for both withdrawal and deposit platforms
 */
export interface PlatformServiceInterface extends BaseService<any> {
  /**
   * Get active platforms only
   */
  getActive(type: 'withdrawal' | 'deposit', options?: QueryOptions): Promise<any[]>;

  /**
   * Toggle platform status (admin only)
   */
  toggleStatus(platform: any): Promise<any>;

  /**
   * Update platform configuration (admin only)
   */
  updateConfig(platform: any, config: Record<string, any>): Promise<any>;

  /**
   * Get platforms by symbol
   */
  getBySymbol(symbol: string, type: 'withdrawal' | 'deposit'): Promise<any[]>;
}

/**
 * Settings service interface for managing Flarum admin settings
 */
export interface SettingsServiceInterface {
  getSetting(key: string, defaultValue?: any): Promise<any>;
  saveSetting(key: string, value: any): Promise<void>;
  saveSettings(settings: Record<string, any>): Promise<void>;
  deleteSetting(key: string): Promise<void>;
  getSettingsWithPrefix(prefix: string): Promise<Record<string, any>>;
  canManageSettings(): boolean;
  getExtensionSetting(extension: string, key: string, defaultValue?: any): Promise<any>;
  saveExtensionSetting(extension: string, key: string, value: any): Promise<void>;
  getWithdrawalSetting(key: string, defaultValue?: any): Promise<any>;
  saveWithdrawalSetting(key: string, value: any): Promise<void>;
  getAllWithdrawalSettings(): Promise<Record<string, any>>;
}

/**
 * Address service interface for managing deposit addresses
 */
export interface AddressServiceInterface {
  generateAddress(platformId: number, userId?: number): Promise<string>;
  canGenerateAddress(): boolean;
}

/**
 * Cache service for managing local data storage
 */
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key?: string; // Custom cache key
  refresh?: boolean; // Force refresh from server
}

/**
 * Common service configuration
 */
export interface ServiceConfig {
  apiUrl?: string;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  defaultPageSize?: number;
}

/**
 * Service error types
 */
export enum ServiceErrorType {
  NETWORK_ERROR = 'network_error',
  PERMISSION_DENIED = 'permission_denied',
  VALIDATION_ERROR = 'validation_error',
  NOT_FOUND = 'not_found',
  SERVER_ERROR = 'server_error',
  TIMEOUT = 'timeout'
}

/**
 * Service error class
 */
export class ServiceError extends Error {
  public type: ServiceErrorType;
  public code?: string;
  public details?: any;

  constructor(
    message: string, 
    type: ServiceErrorType = ServiceErrorType.SERVER_ERROR, 
    code?: string, 
    details?: any
  ) {
    super(message);
    this.name = 'ServiceError';
    this.type = type;
    this.code = code;
    this.details = details;
  }
}