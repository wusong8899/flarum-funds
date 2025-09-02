export interface WithdrawalPlatform {
  id(): number;
  name(): string;
  symbol(): string;
  network(): string;
  displayName(): string;
  minAmount(): number;
  maxAmount(): number;
  fee(): number;
  platformIconUrl(): string;
  platformIconClass(): string;
  isActive(): boolean;
  createdAt(): string;
  attributes: {
    name: string;
    symbol?: string;
    network?: string;
    displayName?: string;
    minAmount?: number;
    maxAmount?: number;
    fee?: number;
    // Simplified platform icon system
    platformIconUrl?: string;
    platformIconClass?: string;
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
  isActive?: boolean;
  // Simplified platform icon system
  platformIconUrl: string;
  platformIconClass: string;
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
  fee?: number;
  address?: string;
  qrCodeImageUrl?: string;
  // Simplified platform icon system
  platformIconUrl?: string;
  platformIconClass?: string;
  warningText?: string;
  networkConfig?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
