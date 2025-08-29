export interface WithdrawalPlatform {
  id: number;
  attributes: {
    name: string;
    symbol: string;
    minAmount: number;
    maxAmount: number;
    fee: number;
    iconUrl?: string;
    iconClass?: string;
  };
}

export interface WithdrawalRequest {
  id: number;
  attributes: {
    amount: number;
    accountDetails: string;
    message?: string;
    status: string;
    createdAt: string;
  };
  relationships: {
    platform: {
      data: { id: number };
    };
  };
}

export interface WithdrawalFormData {
  amount: string;
  selectedPlatform: WithdrawalPlatform | null;
  accountDetails: string;
  message: string;
  saveAddress: boolean;
}

export interface WithdrawalPageState {
  platforms: WithdrawalPlatform[];
  requests: WithdrawalRequest[];
  loading: boolean;
  submitting: boolean;
  loadingBalance: boolean;
  userBalance: number;
  showDropdown: boolean;
  activeTab: 'withdrawal' | 'history';
}

export type StatusType = 'pending' | 'approved' | 'rejected';
export type StatusClass = 'warning' | 'success' | 'danger';