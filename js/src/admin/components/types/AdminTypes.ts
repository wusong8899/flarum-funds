export interface WithdrawalPlatform {
  id: number;
  attributes: {
    name: string;
    symbol?: string;
    minAmount?: number;
    maxAmount?: number;
    fee?: number;
    iconUrl?: string;
    iconClass?: string;
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
  minAmount: string;
  maxAmount: string;
  fee: string;
  iconUrl: string;
  iconClass: string;
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
  iconUrl?: string;
  iconClass?: string;
  warningText?: string;
  networkConfig?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepositTransaction {
  id: number;
  amount: number;
  fee: number;
  creditedAmount?: number;
  transactionHash?: string;
  fromAddress?: string;
  memo?: string;
  status: string;
  statusColor: string;
  confirmations: number;
  requiredConfirmations: number;
  hasEnoughConfirmations: boolean;
  canBeCompleted: boolean;
  explorerUrl?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  detectedAt?: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  user: User;
  platform: DepositPlatform;
  processedBy?: User;
}