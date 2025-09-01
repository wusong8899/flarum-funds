import Stream from 'flarum/common/utils/Stream';

// 存款页面状态
export interface DepositPageState {
  transactions: any[]; // 存款记录历史显示
  loading: boolean;
  submitting: boolean;
  activeTab: Stream<'deposit' | 'history'>;
}

// 存款表单数据
export interface DepositFormData {
  depositAddress: string;
  qrCodeUrl?: string;
  userMessage?: string;
}

// 存款表单状态
export interface DepositFormState {
  depositAddress: Stream<string>;
  qrCodeUrl: Stream<string>;
  userMessage: Stream<string>;
}