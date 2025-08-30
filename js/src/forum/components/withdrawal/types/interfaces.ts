import Stream from 'flarum/common/utils/Stream';
import WithdrawalPlatform from '../../../../common/models/WithdrawalPlatform';
import WithdrawalRequest from '../../../../common/models/WithdrawalRequest';

export interface WithdrawalFormData {
  amount: Stream<string>;
  selectedPlatform: Stream<WithdrawalPlatform | null>;
  accountDetails: Stream<string>;
  message: Stream<string>;
  saveAddress: Stream<boolean>;
}

export interface WithdrawalPageState {
  platforms: WithdrawalPlatform[];
  requests: WithdrawalRequest[];
  loading: boolean;
  submitting: boolean;
  loadingBalance: boolean;
  userBalance: number;
  activeTab: Stream<'withdrawal' | 'history'>;
}

export type StatusType = 'pending' | 'approved' | 'rejected';
export type StatusClass = 'warning' | 'success' | 'danger';