import Stream from 'flarum/common/utils/Stream';

// 简化的存款页面状态
export interface SimpleDepositPageState {
  transactions: any[]; // 存款记录历史显示
  loading: boolean;
  submitting: boolean;
  activeTab: Stream<'deposit' | 'history'>;
}

// 简化的存款表单数据
export interface SimpleDepositFormData {
  depositAddress: string;
  qrCodeUrl?: string;
  userMessage?: string;
}

// 存款表单状态
export interface SimpleDepositFormState {
  depositAddress: Stream<string>;
  qrCodeUrl: Stream<string>;
  userMessage: Stream<string>;
}

// 保持向后兼容的旧接口（将逐步移除）
export interface DepositFormData {
  userMessage: Stream<string>;
}