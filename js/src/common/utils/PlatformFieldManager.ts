/**
 * 平台字段管理工具
 * 
 * 提供统一的平台字段管理功能，包括验证、格式化、默认值等
 */

import {
  Platform,
  PlatformType,
  getRequiredFields,
  getOptionalFields,
  validateRequiredFields,
  createDefaultPlatformData,
  FIELD_DISPLAY_NAMES,
  FIELD_VALIDATION_RULES
} from "../types/PlatformStructure";

/**
 * 字段验证结果接口
 */
export interface FieldValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

/**
 * 字段格式化选项
 */
export interface FormatOptions {
  includeOptional?: boolean;
  excludeSystem?: boolean;
  groupByCategory?: boolean;
}

/**
 * 平台字段管理工具类
 */
export class PlatformFieldManager {
  /**
   * 验证平台数据的所有字段
   */
  static validatePlatformData(data: Partial<Platform>, platformType: PlatformType): FieldValidationResult {
    const errors: Record<string, string[]> = {};
    const warnings: Record<string, string[]> = {};

    // 验证必要字段
    const requiredValidation = validateRequiredFields(data, platformType);
    if (!requiredValidation.valid) {
      requiredValidation.missingFields.forEach(field => {
        errors[field] = [`${FIELD_DISPLAY_NAMES[field as keyof typeof FIELD_DISPLAY_NAMES]} 是必要字段`];
      });
    }

    // 验证字段格式和约束
    Object.entries(data).forEach(([fieldName, value]) => {
      const fieldErrors = PlatformFieldManager.validateField(fieldName, value, platformType);
      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
      }

      const fieldWarnings = PlatformFieldManager.getFieldWarnings(fieldName, value, platformType);
      if (fieldWarnings.length > 0) {
        warnings[fieldName] = fieldWarnings;
      }
    });

    return {
      valid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证单个字段
   */
  static validateField(fieldName: string, value: any, _platformType: PlatformType): string[] {
    const errors: string[] = [];
    const rules = FIELD_VALIDATION_RULES[fieldName as keyof typeof FIELD_VALIDATION_RULES];
    
    if (!rules) return errors;

    const fieldDisplayName = FIELD_DISPLAY_NAMES[fieldName as keyof typeof FIELD_DISPLAY_NAMES] || fieldName;

    // 必要字段检查
    if (rules.required && (value === null || value === undefined || value === '')) {
      errors.push(`${fieldDisplayName} 不能为空`);
      return errors; // 如果必要字段为空，不继续其他验证
    }

    // 跳过空值的其他验证
    if (value === null || value === undefined || value === '') {
      return errors;
    }

    // 字符串长度验证
    if (typeof value === 'string') {
      if (rules.minLength !== undefined && value.length < rules.minLength) {
        errors.push(`${fieldDisplayName} 长度不能少于 ${rules.minLength} 个字符`);
      }
      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        errors.push(`${fieldDisplayName} 长度不能超过 ${rules.maxLength} 个字符`);
      }
    }

    // 数字范围验证
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${fieldDisplayName} 不能小于 ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${fieldDisplayName} 不能大于 ${rules.max}`);
      }
    }

    // 特殊字段验证
    switch (fieldName) {
      case 'symbol':
        if (typeof value === 'string' && !/^[A-Z0-9]{1,10}$/.test(value)) {
          errors.push('货币符号只能包含大写字母和数字，长度1-10位');
        }
        break;
        
      case 'network':
        if (typeof value === 'string' && value && !/^[A-Z0-9]+$/.test(value)) {
          errors.push('网络类型只能包含大写字母和数字');
        }
        break;

      case 'address':
        if (typeof value === 'string' && value && value.length < 10) {
          errors.push('地址长度至少10个字符');
        }
        break;

      case 'qrCodeImageUrl':
        if (typeof value === 'string' && value && !PlatformFieldManager.isValidUrl(value)) {
          errors.push('请输入有效的URL地址');
        }
        break;
    }

    return errors;
  }

  /**
   * 获取字段警告
   */
  static getFieldWarnings(fieldName: string, value: any, platformType: PlatformType): string[] {
    const warnings: string[] = [];

    // 存款平台特殊警告
    if (platformType === 'deposit') {
      if (fieldName === 'address' && typeof value === 'string' && value) {
        if (value.length > 100) {
          warnings.push('地址较长，请确认正确性');
        }
      }

      if (fieldName === 'fee' && typeof value === 'number' && value > 0) {
        warnings.push('存款平台通常不收取手续费');
      }
    }

    // 提现平台特殊警告
    if (platformType === 'withdrawal') {
      if (fieldName === 'maxAmount' && !value) {
        warnings.push('建议设置最大提现金额以控制风险');
      }
    }

    return warnings;
  }

  /**
   * 格式化字段数据用于显示
   */
  static formatFieldsForDisplay(data: Partial<Platform>, platformType: PlatformType, options: FormatOptions = {}): Record<string, any> {
    const formatted: Record<string, any> = {};
    const requiredFields = getRequiredFields(platformType);
    const optionalFields = getOptionalFields(platformType);

    // 处理必要字段
    requiredFields.forEach(field => {
      if (field in data) {
        formatted[field] = PlatformFieldManager.formatFieldValue(field, data[field as keyof Platform]);
      }
    });

    // 处理可选字段
    if (options.includeOptional !== false) {
      optionalFields.forEach(field => {
        if (field in data && data[field as keyof Platform] !== null && data[field as keyof Platform] !== undefined) {
          formatted[field] = PlatformFieldManager.formatFieldValue(field, data[field as keyof Platform]);
        }
      });
    }

    // 排除系统字段
    if (options.excludeSystem) {
      delete formatted.id;
      delete formatted.createdAt;
      delete formatted.updatedAt;
    }

    return formatted;
  }

  /**
   * 格式化单个字段值
   */
  static formatFieldValue(fieldName: string, value: any): any {
    if (value === null || value === undefined) return null;

    switch (fieldName) {
      case 'minAmount':
      case 'maxAmount':
      case 'fee':
        return typeof value === 'number' ? value.toFixed(8) : value;
        
      case 'isActive':
        return value ? '启用' : '禁用';
        
      case 'createdAt':
      case 'updatedAt':
        return value instanceof Date ? value.toLocaleString() : value;
        
      default:
        return value;
    }
  }

  /**
   * 创建字段编辑表单的配置
   */
  static getFieldConfig(platformType: PlatformType): Record<string, any> {
    const config: Record<string, any> = {};
    const requiredFields = getRequiredFields(platformType);
    const optionalFields = getOptionalFields(platformType);

    [...requiredFields, ...optionalFields].forEach(field => {
      config[field] = {
        label: FIELD_DISPLAY_NAMES[field as keyof typeof FIELD_DISPLAY_NAMES] || field,
        required: requiredFields.includes(field),
        validation: FIELD_VALIDATION_RULES[field as keyof typeof FIELD_VALIDATION_RULES],
        ...PlatformFieldManager.getFieldInputConfig(field)
      };
    });

    return config;
  }

  /**
   * 获取字段输入配置
   */
  static getFieldInputConfig(fieldName: string): Record<string, any> {
    switch (fieldName) {
      case 'name':
        return {
          type: 'text',
          placeholder: '例如：币安交易所',
          maxLength: 255
        };
        
      case 'symbol':
        return {
          type: 'text',
          placeholder: '例如：USDT, BTC',
          maxLength: 50,
          transform: 'uppercase'
        };
        
      case 'network':
        return {
          type: 'text',
          placeholder: '例如：TRC20, ERC20',
          maxLength: 50,
          transform: 'uppercase'
        };
        
      case 'minAmount':
      case 'maxAmount':
      case 'fee':
        return {
          type: 'number',
          min: 0,
          step: 0.00000001
        };
        
      case 'address':
        return {
          type: 'text',
          placeholder: '收款地址',
          maxLength: 500
        };
        
      case 'qrCodeImageUrl':
        return {
          type: 'url',
          placeholder: 'https://example.com/qr.png',
          maxLength: 500
        };
        
      case 'warningText':
        return {
          type: 'textarea',
          placeholder: '重要提示信息',
          maxLength: 1000
        };
        
      case 'isActive':
        return {
          type: 'boolean',
          default: true
        };
        
      default:
        return {
          type: 'text'
        };
    }
  }

  /**
   * 清理和标准化平台数据
   */
  static sanitizePlatformData(data: Record<string, any>, platformType: PlatformType): Partial<Platform> {
    const sanitized: Record<string, any> = {};
    const allFields = [...getRequiredFields(platformType), ...getOptionalFields(platformType)];

    allFields.forEach(field => {
      if (field in data) {
        sanitized[field] = PlatformFieldManager.sanitizeFieldValue(field, data[field]);
      }
    });

    return sanitized as Partial<Platform>;
  }

  /**
   * 清理单个字段值
   */
  static sanitizeFieldValue(fieldName: string, value: any): any {
    if (value === null || value === undefined || value === '') return null;

    switch (fieldName) {
      case 'name':
      case 'address':
      case 'warningText':
        return typeof value === 'string' ? value.trim() : value;
        
      case 'symbol':
      case 'network':
        return typeof value === 'string' ? value.trim().toUpperCase() : value;
        
      case 'minAmount':
      case 'maxAmount':
      case 'fee':
        const num = parseFloat(value);
        return isNaN(num) ? null : Math.max(0, num);
        
      case 'isActive':
        return Boolean(value);
        
      default:
        return value;
    }
  }

  /**
   * 比较两个平台数据的差异
   */
  static compareData(oldData: Partial<Platform>, newData: Partial<Platform>): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    allKeys.forEach(key => {
      const oldValue = oldData[key as keyof Platform];
      const newValue = newData[key as keyof Platform];
      
      if (oldValue !== newValue) {
        changes[key] = { old: oldValue, new: newValue };
      }
    });

    return changes;
  }

  /**
   * 验证URL格式
   */
  static isValidUrl(string: string): boolean {
    try {
      const url = new URL(string);
      return Boolean(url);
    } catch {
      return false;
    }
  }
}

/**
 * 便捷函数：创建新的平台数据
 */
export function createNewPlatform(platformType: PlatformType, initialData: Partial<Platform> = {}): Partial<Platform> {
  const defaultData = createDefaultPlatformData(platformType);
  return { ...defaultData, ...initialData };
}

/**
 * 便捷函数：验证平台数据
 */
export function validatePlatform(data: Partial<Platform>, platformType: PlatformType): FieldValidationResult {
  return PlatformFieldManager.validatePlatformData(data, platformType);
}

/**
 * 便捷函数：获取字段显示名称
 */
export function getFieldDisplayName(fieldName: string): string {
  return FIELD_DISPLAY_NAMES[fieldName as keyof typeof FIELD_DISPLAY_NAMES] || fieldName;
}

/**
 * 便捷函数：格式化平台数据用于表单
 */
export function formatForForm(data: Partial<Platform>, platformType: PlatformType): Record<string, any> {
  return PlatformFieldManager.formatFieldsForDisplay(data, platformType, {
    includeOptional: true,
    excludeSystem: true
  });
}

/**
 * 便捷函数：清理表单数据
 */
export function sanitizeFormData(formData: Record<string, any>, platformType: PlatformType): Partial<Platform> {
  return PlatformFieldManager.sanitizePlatformData(formData, platformType);
}