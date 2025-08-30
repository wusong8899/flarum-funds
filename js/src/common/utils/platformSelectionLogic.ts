import { getAttr } from '../../forum/withdrawal/utils/modelHelpers';
import type DepositPlatform from '../models/DepositPlatform';
import type WithdrawalPlatform from '../models/WithdrawalPlatform';

export type Platform = DepositPlatform | WithdrawalPlatform;

export interface PlatformSelectionState<T extends Platform> {
  currencyGroups: Record<string, T[]>;
  availablePlatforms: T[];
  currencies: string[];
}

/**
 * 创建平台选择状态 - 通用函数，支持提款和存款平台
 */
export function createPlatformSelectionState<T extends Platform>(platforms: T[]): PlatformSelectionState<T> {
  // 过滤活跃平台
  const availablePlatforms = platforms.filter(platform => getAttr(platform, 'isActive'));
  
  // 按货币符号分组平台
  const currencyGroups: Record<string, T[]> = {};
  availablePlatforms.forEach(platform => {
    const symbol = getAttr(platform, 'symbol');
    if (!currencyGroups[symbol]) {
      currencyGroups[symbol] = [];
    }
    currencyGroups[symbol].push(platform);
  });
  
  return {
    currencyGroups,
    availablePlatforms,
    currencies: Object.keys(currencyGroups)
  };
}

/**
 * 获取指定货币的可用网络列表
 */
export function getAvailableNetworks<T extends Platform>(currencyGroups: Record<string, T[]>, currency: string): string[] {
  if (!currency) return [];
  
  const selectedPlatforms = currencyGroups[currency] || [];
  
  return selectedPlatforms
    .map(platform => getAttr(platform, 'network'))
    .filter(network => network) // 过滤空网络
    .filter((network, index, arr) => arr.indexOf(network) === index); // 去重
}

/**
 * 检查是否应该自动选择平台（无网络平台的自动选择逻辑）
 */
export function shouldAutoSelectPlatform<T extends Platform>(currencyGroups: Record<string, T[]>, currency: string): T | null {
  if (!currency) return null;
  
  const selectedPlatforms = currencyGroups[currency] || [];
  const noNetworkPlatforms = selectedPlatforms.filter(p => !getAttr(p, 'network'));
  const hasNetworkPlatforms = selectedPlatforms.some(p => getAttr(p, 'network'));
  
  // 如果只有无网络平台，自动选择第一个
  if (noNetworkPlatforms.length > 0 && !hasNetworkPlatforms) {
    return noNetworkPlatforms[0];
  }
  
  return null;
}

/**
 * 根据货币和网络获取对应的平台（单一平台自动选择逻辑）
 */
export function getPlatformByNetwork<T extends Platform>(
  currencyGroups: Record<string, T[]>, 
  currency: string, 
  network: string
): T | null {
  if (!currency || !network) return null;
  
  const selectedPlatforms = currencyGroups[currency] || [];
  const networkPlatforms = selectedPlatforms.filter(p => getAttr(p, 'network') === network);
  
  // 如果该网络只有一个平台，自动选择
  if (networkPlatforms.length === 1) {
    return networkPlatforms[0];
  }
  
  return null;
}

/**
 * 通用的货币变更处理逻辑
 */
export interface CurrencyChangeResult<T extends Platform> {
  networks: string[];
  autoSelectedPlatform: T | null;
}

export function handleCurrencyChange<T extends Platform>(
  currencyGroups: Record<string, T[]>,
  currency: string
): CurrencyChangeResult<T> {
  const networks = getAvailableNetworks(currencyGroups, currency);
  const autoSelectedPlatform = shouldAutoSelectPlatform(currencyGroups, currency);
  
  return {
    networks,
    autoSelectedPlatform
  };
}

/**
 * 通用的网络变更处理逻辑
 */
export function handleNetworkChange<T extends Platform>(
  currencyGroups: Record<string, T[]>,
  currency: string,
  network: string
): T | null {
  return getPlatformByNetwork(currencyGroups, currency, network);
}