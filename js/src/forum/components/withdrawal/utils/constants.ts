import type { StatusType, StatusClass } from '../types/interfaces';

/**
 * Withdrawal request status constants
 */
export const WITHDRAWAL_STATUS: Record<string, StatusType> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

/**
 * Status class mapping for UI styling
 */
export const STATUS_CLASS_MAP: Record<StatusType, StatusClass> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
} as const;

/**
 * Tab types
 */
export const TABS = {
  WITHDRAWAL: 'funds',
  HISTORY: 'history',
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  MIN_AMOUNT: 0.001,
  MAX_AMOUNT: 10,
  FEE: 0.0005,
  BALANCE_PRECISION: 8,
} as const;

/**
 * CSS class names
 */
export const CSS_CLASSES = {
  WITHDRAWAL_PAGE: 'WithdrawalPage',
  MODAL: 'WithdrawalPage-modal',
  HEADER: 'WithdrawalPage-header',
  TABS: 'WithdrawalPage-tabs',
  TAB: 'WithdrawalPage-tab',
  TAB_ACTIVE: 'active',
  CONTENT: 'WithdrawalPage-content',
  LOADING: 'WithdrawalPage-loading',
  EMPTY_STATE: 'WithdrawalPage-emptyState',
} as const;

/**
 * Icon names
 */
export const ICONS = {
  CLOSE: 'fas fa-times',
  COINS: 'fas fa-coins',
  HISTORY: 'fas fa-history',
  BITCOIN: 'fas fa-bitcoin',
  CHEVRON_DOWN: 'fas fa-chevron-down',
  PASTE: 'fas fa-paste',
  BOOKMARK: 'fas fa-bookmark',
} as const;