import Stream from 'flarum/common/utils/Stream';
import DepositPlatform from '../../../common/models/DepositPlatform';
import DepositAddress from '../../../common/models/DepositAddress';
import DepositTransaction from '../../../common/models/DepositTransaction';

export interface DepositPageState {
  platforms: DepositPlatform[];
  transactions: DepositTransaction[];
  loading: boolean;
  activeTab: Stream<'deposit' | 'history'>;
}

export interface DepositFormData {
  selectedPlatform: Stream<DepositPlatform | null>;
}

export interface DepositAddressData {
  address: string;
  addressTag?: string;
  qrCodeData: string;
  platform: DepositPlatform;
  loading: boolean;
}