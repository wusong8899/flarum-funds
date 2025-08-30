import app from 'flarum/common/app';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  firstErrorMessage?: string;
}

/**
 * 通用表单验证工具
 * 统一提款和存款平台表单的验证逻辑
 */
export class FormValidator {
  private errors: ValidationError[] = [];

  /**
   * 验证必填字段
   */
  required(value: any, fieldName: string, displayName?: string): this {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      this.errors.push({
        field: fieldName,
        message: `${displayName || fieldName} is required`
      });
    }
    return this;
  }

  /**
   * 验证最小长度
   */
  minLength(value: string, minLength: number, fieldName: string, displayName?: string): this {
    if (value && value.length < minLength) {
      this.errors.push({
        field: fieldName,
        message: `${displayName || fieldName} must be at least ${minLength} characters`
      });
    }
    return this;
  }

  /**
   * 验证数字范围
   */
  numberRange(value: string | number, min?: number, max?: number, fieldName?: string, displayName?: string): this {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      this.errors.push({
        field: fieldName || 'number',
        message: `${displayName || 'Value'} must be a valid number`
      });
      return this;
    }

    if (min !== undefined && numValue < min) {
      this.errors.push({
        field: fieldName || 'number',
        message: `${displayName || 'Value'} must be at least ${min}`
      });
    }

    if (max !== undefined && numValue > max) {
      this.errors.push({
        field: fieldName || 'number',
        message: `${displayName || 'Value'} must be at most ${max}`
      });
    }

    return this;
  }

  /**
   * 验证URL格式
   */
  url(value: string, fieldName: string, displayName?: string): this {
    if (value && value.trim()) {
      try {
        const _url = new URL(value);
        // URL is valid, no action needed
        void _url; // Explicit void to indicate we don't need the result
      } catch {
        this.errors.push({
          field: fieldName,
          message: `${displayName || fieldName} must be a valid URL`
        });
      }
    }
    return this;
  }

  /**
   * 自定义验证规则
   */
  custom(condition: boolean, fieldName: string, message: string): this {
    if (!condition) {
      this.errors.push({
        field: fieldName,
        message
      });
    }
    return this;
  }

  /**
   * 获取验证结果
   */
  getResult(): ValidationResult {
    const isValid = this.errors.length === 0;
    return {
      isValid,
      errors: this.errors,
      firstErrorMessage: this.errors.length > 0 ? this.errors[0].message : undefined
    };
  }

  /**
   * 重置验证状态
   */
  reset(): this {
    this.errors = [];
    return this;
  }
}

/**
 * 提款平台表单验证
 */
export function validateWithdrawalPlatform(data: {
  name: string;
  symbol: string;
  network?: string;
  minAmount: string;
  maxAmount: string;
  fee: string;
  iconUrl?: string;
}): ValidationResult {
  const validator = new FormValidator();

  validator
    .required(data.name, 'name', 'Platform Name')
    .required(data.symbol, 'symbol', 'Currency Symbol')
    .minLength(data.symbol, 1, 'symbol', 'Currency Symbol')
    .numberRange(data.minAmount, 0, undefined, 'minAmount', 'Minimum Amount')
    .numberRange(data.fee, 0, undefined, 'fee', 'Fee');

  if (data.maxAmount) {
    validator.numberRange(data.maxAmount, parseFloat(data.minAmount) || 0, undefined, 'maxAmount', 'Maximum Amount');
  }

  if (data.iconUrl) {
    validator.url(data.iconUrl, 'iconUrl', 'Icon URL');
  }

  return validator.getResult();
}

/**
 * 存款平台表单验证
 */
export function validateDepositPlatform(data: {
  name: string;
  symbol: string;
  network?: string;
  address: string;
  minAmount: string;
  maxAmount: string;
  qrCodeImageUrl?: string;
  iconUrl?: string;
}): ValidationResult {
  const validator = new FormValidator();

  validator
    .required(data.name, 'name', 'Platform Name')
    .required(data.symbol, 'symbol', 'Currency Symbol')
    .required(data.address, 'address', 'Deposit Address')
    .minLength(data.symbol, 1, 'symbol', 'Currency Symbol')
    .minLength(data.address, 10, 'address', 'Deposit Address');

  if (data.minAmount) {
    validator.numberRange(data.minAmount, 0, undefined, 'minAmount', 'Minimum Amount');
  }

  if (data.maxAmount) {
    const minAmountNum = parseFloat(data.minAmount) || 0;
    validator.numberRange(data.maxAmount, minAmountNum, undefined, 'maxAmount', 'Maximum Amount');
  }

  if (data.qrCodeImageUrl) {
    validator.url(data.qrCodeImageUrl, 'qrCodeImageUrl', 'QR Code Image URL');
  }

  if (data.iconUrl) {
    validator.url(data.iconUrl, 'iconUrl', 'Icon URL');
  }

  return validator.getResult();
}

/**
 * 显示验证错误警告
 */
export function showValidationErrors(result: ValidationResult): void {
  if (!result.isValid && result.firstErrorMessage) {
    app.alerts.show(
      { type: 'error', dismissible: true },
      result.firstErrorMessage
    );
  }
}

