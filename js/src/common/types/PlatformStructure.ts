/**
 * 统一平台数据结构定义
 * 
 * 定义提现平台和存款平台的统一数据结构，包括字段分类和验证规则
 */

/**
 * 平台类型枚举
 */
export type PlatformType = 'withdrawal' | 'deposit';

/**
 * 基础平台字段接口 - 所有平台共有的字段
 */
export interface BasePlatformFields {
  // === 必要字段 (Required Fields) ===
  /** 平台名称 */
  name: string;
  /** 货币符号 (BTC, USDT, ETH等) */
  symbol: string;
  /** 最小金额 */
  minAmount: number;
  /** 手续费 */
  fee: number;
  /** 是否启用 */
  isActive: boolean;
  
  // === 可选字段 (Optional Fields) ===
  /** 网络类型 (TRC20, ERC20, BSC等) - 可为空表示无网络区分 */
  network?: string | null;
  /** 最大金额 */
  maxAmount?: number | null;
  /** 网络类型ID - 关联到NetworkType表 */
  networkTypeId?: number | null;
  /** 自定义货币图标URL */
  currencyIconOverrideUrl?: string | null;
  /** 自定义货币图标CSS类 */
  currencyIconOverrideClass?: string | null;
  /** 自定义网络图标URL */
  networkIconOverrideUrl?: string | null;
  /** 自定义网络图标CSS类 */
  networkIconOverrideClass?: string | null;
  /** 平台特定图标URL */
  platformSpecificIconUrl?: string | null;
  /** 平台特定图标CSS类 */
  platformSpecificIconClass?: string | null;
  
  // === 系统字段 (System Fields) ===
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 提现平台特有字段
 */
export interface WithdrawalPlatformSpecificFields {
  // 提现平台目前没有特有字段，所有字段都在基础字段中
}

/**
 * 存款平台特有字段
 */
export interface DepositPlatformSpecificFields {
  // === 必要字段 (Required Fields) ===
  /** 收款地址 - 存款平台必须有地址 */
  address: string;
  
  // === 可选字段 (Optional Fields) ===
  /** 二维码图片URL */
  qrCodeImageUrl?: string | null;
  /** 图标URL (向后兼容字段) */
  iconUrl?: string | null;
  /** 图标CSS类 (向后兼容字段) */
  iconClass?: string | null;
  /** 警告文本 */
  warningText?: string | null;
  /** 网络配置JSON */
  networkConfig?: Record<string, any> | null;
}

/**
 * 完整的提现平台接口
 */
export interface WithdrawalPlatform extends BasePlatformFields, WithdrawalPlatformSpecificFields {
  platformType: 'withdrawal';
}

/**
 * 完整的存款平台接口
 */
export interface DepositPlatform extends BasePlatformFields, DepositPlatformSpecificFields {
  platformType: 'deposit';
  // 重写必要字段以包含存款平台特有的必要字段
  address: string; // 存款平台必须有地址
}

/**
 * 联合平台类型 - 可以是提现或存款平台
 */
export type Platform = WithdrawalPlatform | DepositPlatform;

/**
 * 字段分类定义
 */
export const PLATFORM_FIELD_CATEGORIES = {
  // 必要字段 - 创建平台时必须提供
  REQUIRED: {
    COMMON: ['name', 'symbol', 'minAmount', 'fee', 'isActive'] as const,
    WITHDRAWAL: [] as const, // 提现平台无额外必要字段
    DEPOSIT: ['address'] as const, // 存款平台必须有地址
  },
  
  // 可选字段 - 创建时可以为空
  OPTIONAL: {
    COMMON: [
      'network', 'maxAmount', 'networkTypeId',
      'currencyIconOverrideUrl', 'currencyIconOverrideClass',
      'networkIconOverrideUrl', 'networkIconOverrideClass', 
      'platformSpecificIconUrl', 'platformSpecificIconClass'
    ] as const,
    WITHDRAWAL: [] as const,
    DEPOSIT: [
      'qrCodeImageUrl', 'iconUrl', 'iconClass', 
      'warningText', 'networkConfig'
    ] as const,
  },
  
  // 系统字段 - 由系统自动管理
  SYSTEM: ['id', 'createdAt', 'updatedAt'] as const,
} as const;

/**
 * 获取指定平台类型的必要字段列表
 */
export function getRequiredFields(platformType: PlatformType): readonly string[] {
  return [
    ...PLATFORM_FIELD_CATEGORIES.REQUIRED.COMMON,
    ...PLATFORM_FIELD_CATEGORIES.REQUIRED[platformType.toUpperCase() as keyof typeof PLATFORM_FIELD_CATEGORIES.REQUIRED]
  ];
}

/**
 * 获取指定平台类型的可选字段列表
 */
export function getOptionalFields(platformType: PlatformType): readonly string[] {
  return [
    ...PLATFORM_FIELD_CATEGORIES.OPTIONAL.COMMON,
    ...PLATFORM_FIELD_CATEGORIES.OPTIONAL[platformType.toUpperCase() as keyof typeof PLATFORM_FIELD_CATEGORIES.OPTIONAL]
  ];
}

/**
 * 获取指定平台类型的所有字段列表（不包括系统字段）
 */
export function getAllFields(platformType: PlatformType): readonly string[] {
  return [
    ...getRequiredFields(platformType),
    ...getOptionalFields(platformType)
  ];
}

/**
 * 验证平台数据是否包含所有必要字段
 */
export function validateRequiredFields(data: Partial<Platform>, platformType: PlatformType): {
  valid: boolean;
  missingFields: string[];
} {
  const requiredFields = getRequiredFields(platformType);
  const missingFields = requiredFields.filter(field => 
    !(field in data) || data[field as keyof Platform] === null || data[field as keyof Platform] === undefined
  );
  
  return {
    valid: missingFields.length === 0,
    missingFields
  };
}

/**
 * 创建默认平台数据
 */
export function createDefaultPlatformData(platformType: PlatformType): Partial<Platform> {
  const baseDefaults: Partial<BasePlatformFields> = {
    name: '',
    symbol: '',
    minAmount: 0,
    fee: 0,
    isActive: true,
    network: null,
    maxAmount: null,
    networkTypeId: null,
    currencyIconOverrideUrl: null,
    currencyIconOverrideClass: null,
    networkIconOverrideUrl: null,
    networkIconOverrideClass: null,
    platformSpecificIconUrl: null,
    platformSpecificIconClass: null,
  };

  if (platformType === 'withdrawal') {
    return {
      ...baseDefaults,
      platformType: 'withdrawal' as const,
    } as Partial<WithdrawalPlatform>;
  } else {
    return {
      ...baseDefaults,
      platformType: 'deposit' as const,
      address: '',
      qrCodeImageUrl: null,
      iconUrl: null,
      iconClass: null,
      warningText: null,
      networkConfig: null,
    } as Partial<DepositPlatform>;
  }
}

/**
 * 字段显示名称映射（用于UI）
 */
export const FIELD_DISPLAY_NAMES = {
  // 基础字段
  name: '平台名称',
  symbol: '货币符号', 
  network: '网络类型',
  minAmount: '最小金额',
  maxAmount: '最大金额',
  fee: '手续费',
  isActive: '启用状态',
  networkTypeId: '网络类型',
  
  // 图标字段
  currencyIconOverrideUrl: '货币图标URL',
  currencyIconOverrideClass: '货币图标CSS类',
  networkIconOverrideUrl: '网络图标URL', 
  networkIconOverrideClass: '网络图标CSS类',
  platformSpecificIconUrl: '平台图标URL',
  platformSpecificIconClass: '平台图标CSS类',
  
  // 存款平台特有字段
  address: '收款地址',
  qrCodeImageUrl: '二维码图片URL',
  iconUrl: '图标URL',
  iconClass: '图标CSS类',
  warningText: '警告文本',
  networkConfig: '网络配置',
  
  // 系统字段
  id: 'ID',
  createdAt: '创建时间',
  updatedAt: '更新时间',
} as const;

/**
 * 字段验证规则
 */
export const FIELD_VALIDATION_RULES = {
  name: { required: true, minLength: 1, maxLength: 255 },
  symbol: { required: true, minLength: 1, maxLength: 50 },
  network: { required: false, maxLength: 50 },
  minAmount: { required: true, min: 0 },
  maxAmount: { required: false, min: 0 },
  fee: { required: true, min: 0 },
  address: { required: true, minLength: 1, maxLength: 500 }, // 存款平台必要
  qrCodeImageUrl: { required: false, maxLength: 500 },
  warningText: { required: false, maxLength: 1000 },
} as const;