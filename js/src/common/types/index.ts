/**
 * Shared type definitions for the Withdrawal extension
 */

/**
 * Withdrawal platform data structure
 */
export interface WithdrawalPlatformData {
  id: string | number;
  name: string;
  symbol: string;
  minAmount: number;
  maxAmount: number;
  fee: number;
  iconUrl?: string | null;
  iconClass?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Withdrawal request data structure
 */
export interface WithdrawalRequestData {
  id: string | number;
  amount: number;
  accountDetails: string;
  status: 'pending' | 'approved' | 'rejected';
  platformId: number;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User withdrawal data extension
 */
export interface UserWithdrawalData {
  money?: number;
  withdrawalRequests?: WithdrawalRequestData[];
}

/**
 * API response structures
 */
export interface ApiSuccessResponse<T = any> {
  data: T;
}

export interface ApiErrorResponse {
  errors: Array<{
    status: string;
    code: string;
    title: string;
    detail?: string;
  }>;
}

/**
 * Form validation errors
 */
export interface ValidationErrors {
  [field: string]: string[];
}

/**
 * Configuration constants
 */
export const WITHDRAWAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type WithdrawalStatus = typeof WITHDRAWAL_STATUS[keyof typeof WITHDRAWAL_STATUS];

/**
 * Default values
 */
export const DEFAULT_MIN_AMOUNT = 0.001;
export const DEFAULT_MAX_AMOUNT = 10;
export const DEFAULT_FEE = 0.0005;

/**
 * Helper type guards
 */
export function isWithdrawalPlatform(obj: any): obj is WithdrawalPlatformData {
  return obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'name' in obj &&
    'symbol' in obj &&
    'minAmount' in obj &&
    'maxAmount' in obj;
}

export function isWithdrawalRequest(obj: any): obj is WithdrawalRequestData {
  return obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'amount' in obj &&
    'accountDetails' in obj &&
    'status' in obj &&
    'platformId' in obj &&
    'userId' in obj;
}