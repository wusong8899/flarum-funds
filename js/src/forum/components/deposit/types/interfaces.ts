import Stream from 'flarum/common/utils/Stream';

// 存款页面状态
export interface DepositPageState {
  transactions: any[]; // 存款记录历史显示
  platforms: any[]; // Available deposit platforms
  loading: boolean;
  submitting: boolean;
  activeTab: Stream<'deposit' | 'history'>;
}

// 存款表单数据
export interface DepositFormData {
  depositAddress: string;
  qrCodeUrl?: string;
  userMessage?: string;
  selectedPlatform: any; // Selected platform for deposit
}

// 存款地址数据
export interface DepositAddressData {
  address: string;
  platform: any;
  qrCodeUrl?: string;
  loading?: boolean;
}

// 存款表单状态
export interface DepositFormState {
  depositAddress: Stream<string>;
  qrCodeUrl: Stream<string>;
  userMessage: Stream<string>;
}