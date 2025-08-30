/**
 * Service layer exports for the withdrawal extension
 * 
 * This file provides easy access to all CRUD services and their singleton instances.
 */

// Service classes
export { default as WithdrawalService } from './WithdrawalService';
export { default as DepositService } from './DepositService';  
export { default as PlatformService } from './PlatformService';
export { default as SettingsService } from './SettingsService';
export { default as AddressService } from './AddressService';

// Singleton instances for direct use
export { withdrawalService } from './WithdrawalService';
export { depositService } from './DepositService';
export { platformService } from './PlatformService';
export { settingsService } from './SettingsService';
export { addressService } from './AddressService';

// Service interfaces and types
export type {
  BaseService,
  WithdrawalServiceInterface,
  DepositServiceInterface,
  PlatformServiceInterface,
  SettingsServiceInterface,
  AddressServiceInterface,
  QueryOptions,
  FilterOptions,
  PaginationOptions,
  SortOptions,
  ServiceResponse,
  ServiceConfig,
  CacheOptions,
  ServiceError,
  ServiceErrorType
} from '../types/services';

/**
 * Service registry for easy access to all services
 */
export const Services = {
  withdrawal: () => import('./WithdrawalService').then(m => m.withdrawalService),
  deposit: () => import('./DepositService').then(m => m.depositService),
  platform: () => import('./PlatformService').then(m => m.platformService),
  settings: () => import('./SettingsService').then(m => m.settingsService),
  address: () => import('./AddressService').then(m => m.addressService)
} as const;

/**
 * Helper function to get a service by name
 */
export async function getService<T = any>(name: keyof typeof Services): Promise<T> {
  const serviceLoader = Services[name];
  return await serviceLoader() as T;
}

/**
 * Initialize all services
 * Call this during app initialization to ensure all services are ready
 */
export async function initializeServices(): Promise<void> {
  try {
    // Preload all services
    await Promise.all([
      getService('withdrawal'),
      getService('deposit'), 
      getService('platform'),
      getService('settings'),
      getService('address')
    ]);
    
    console.log('All withdrawal extension services initialized successfully');
    console.log('Available services: Withdrawal, Deposit, Platform, Settings, Address');
  } catch (error) {
    console.error('Failed to initialize withdrawal extension services:', error);
    throw error;
  }
}

/**
 * Direct service registry for synchronous access (pre-imported)
 */
import { withdrawalService } from './WithdrawalService';
import { depositService } from './DepositService';
import { platformService } from './PlatformService';
import { settingsService } from './SettingsService';
import { addressService } from './AddressService';

export const serviceRegistry = {
  withdrawal: withdrawalService,
  deposit: depositService,
  platform: platformService,
  settings: settingsService,
  address: addressService
} as const;

/**
 * Utility to check if all services support a specific operation
 */
export function checkServiceCapabilities(operation: string): Record<string, boolean> {
  return {
    withdrawal: typeof withdrawalService[operation as keyof typeof withdrawalService] === 'function',
    deposit: typeof depositService[operation as keyof typeof depositService] === 'function',
    platform: typeof platformService[operation as keyof typeof platformService] === 'function',
    settings: typeof settingsService[operation as keyof typeof settingsService] === 'function',
    address: typeof addressService[operation as keyof typeof addressService] === 'function'
  };
}

/**
 * Get service statistics
 */
export function getServiceStats() {
  return {
    totalServices: Object.keys(serviceRegistry).length,
    services: Object.keys(serviceRegistry),
    capabilities: {
      crud: checkServiceCapabilities('find').withdrawal && checkServiceCapabilities('create').deposit,
      settings: checkServiceCapabilities('saveSetting').settings,
      addresses: checkServiceCapabilities('generateAddress').address
    }
  };
}