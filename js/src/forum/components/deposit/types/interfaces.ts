import Stream from 'flarum/common/utils/Stream';
import DepositPlatform from '../../../../common/models/DepositPlatform';

export interface DepositPageState {
  platforms: DepositPlatform[];
  transactions: any[]; // Deposit records for history display
  loading: boolean;
  activeTab: Stream<'deposit' | 'history'>;
}

export interface DepositFormData {
  selectedPlatform: Stream<DepositPlatform | null>;
  userMessage: Stream<string>;
}

export interface DepositAddressData {
  address: string;
  addressTag?: string;
  platform: DepositPlatform;
  loading: boolean;
}