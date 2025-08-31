export interface WithdrawalPlatform {
  id: number;
  attributes: {
    name: string;
    symbol?: string;
    network?: string;
    displayName?: string;
    minAmount?: number;
    maxAmount?: number;
    fee?: number;
    // Three-tier icon system
    currencyIconUrl?: string;
    currencyIconClass?: string;
    currencyUnicodeSymbol?: string;
    networkIconUrl?: string;
    networkIconClass?: string;
    platformSpecificIconUrl?: string;
    platformSpecificIconClass?: string;
    // Override fields
    currencyIconOverrideUrl?: string;
    currencyIconOverrideClass?: string;
    networkIconOverrideUrl?: string;
    networkIconOverrideClass?: string;
    isActive?: boolean;
    createdAt?: string;
    created_at?: string;
  };
}

export interface WithdrawalRequest {
  id: number;
  attributes: {
    amount: number;
    accountDetails?: string;
    account_details?: string;
    status: string;
    createdAt?: string;
    created_at?: string;
  };
  relationships?: {
    user?: {
      data: { id: number };
    };
    platform?: {
      data: { id: number };
    };
  };
}

export interface User {
  id: number;
  attributes: {
    displayName: string;
  };
}

export interface PlatformFormData {
  name: string;
  symbol: string;
  network: string;
  minAmount: string;
  maxAmount: string;
  fee: string;
  // Three-tier icon system
  currencyIconOverrideUrl: string;
  currencyIconOverrideClass: string;
  networkIconOverrideUrl: string;
  networkIconOverrideClass: string;
}

// Deposit-related interfaces
export interface DepositPlatform {
  id: number;
  name: string;
  symbol: string;
  network: string;
  displayName: string;
  minAmount: number;
  maxAmount?: number;
  address?: string;
  qrCodeImageUrl?: string;
  // Three-tier icon system
  currencyIconUrl?: string;
  currencyIconClass?: string;
  currencyUnicodeSymbol?: string;
  networkIconUrl?: string;
  networkIconClass?: string;
  platformSpecificIconUrl?: string;
  platformSpecificIconClass?: string;
  // Override fields
  currencyIconOverrideUrl?: string;
  currencyIconOverrideClass?: string;
  networkIconOverrideUrl?: string;
  networkIconOverrideClass?: string;
  warningText?: string;
  networkConfig?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

