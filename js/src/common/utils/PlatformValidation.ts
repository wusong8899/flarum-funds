import { ServiceError, ServiceErrorType } from '../types/services';

/**
 * Validate common platform fields
 */
export function validateCommonFields(attributes: Record<string, any>): string[] {
  const errors: string[] = [];

  // Name validation
  if (attributes.name !== undefined) {
    if (!attributes.name || typeof attributes.name !== 'string') {
      errors.push('Platform name is required');
    }
  }

  // Symbol validation
  if (attributes.symbol !== undefined) {
    if (!attributes.symbol || typeof attributes.symbol !== 'string') {
      errors.push('Symbol is required');
    }
  }

  return errors;
}

/**
 * Validate amount fields (min/max/fee)
 */
export function validateAmountFields(attributes: Record<string, any>, currentMinAmount?: number): string[] {
  const errors: string[] = [];

  // Min amount validation
  if (attributes.minAmount !== undefined) {
    if (typeof attributes.minAmount !== 'number' || attributes.minAmount < 0) {
      errors.push('Minimum amount must be a non-negative number');
    }
  }

  // Max amount validation
  if (attributes.maxAmount !== undefined && attributes.maxAmount !== null) {
    if (typeof attributes.maxAmount !== 'number' || attributes.maxAmount < 0) {
      errors.push('Maximum amount must be a non-negative number');
    }
    
    const minAmount = attributes.minAmount ?? currentMinAmount ?? 0;
    if (attributes.maxAmount < minAmount) {
      errors.push('Maximum amount must be greater than or equal to minimum amount');
    }
  }

  // Fee validation
  if (attributes.fee !== undefined && attributes.fee !== null) {
    if (typeof attributes.fee !== 'number' || attributes.fee < 0) {
      errors.push('Fee must be a non-negative number');
    }
  }

  return errors;
}

/**
 * Validate deposit-specific fields
 */
export function validateDepositFields(attributes: Record<string, any>): string[] {
  const errors: string[] = [];

  // Network validation (for deposit platforms)
  if (attributes.network !== undefined) {
    if (!attributes.network || typeof attributes.network !== 'string') {
      errors.push('Network is required');
    }
  }

  // Address validation (for deposit platforms)
  if (attributes.address !== undefined) {
    if (!attributes.address || typeof attributes.address !== 'string') {
      errors.push('Deposit address is required');
    }
  }

  return errors;
}

/**
 * Throw validation error if there are any errors
 */
export function throwIfErrors(errors: string[]): void {
  if (errors.length > 0) {
    throw new ServiceError(
      errors.join(', '),
      ServiceErrorType.VALIDATION_ERROR
    );
  }
}

/**
 * Complete validation for withdrawal platforms
 */
export function validateWithdrawalPlatform(attributes: Record<string, any>, currentMinAmount?: number): void {
  const errors = [
    ...validateCommonFields(attributes),
    ...validateAmountFields(attributes, currentMinAmount)
  ];
  
  throwIfErrors(errors);
}

/**
 * Complete validation for deposit platforms
 */
export function validateDepositPlatform(attributes: Record<string, any>, currentMinAmount?: number): void {
  const errors = [
    ...validateCommonFields(attributes),
    ...validateAmountFields(attributes, currentMinAmount),
    ...validateDepositFields(attributes)
  ];
  
  throwIfErrors(errors);
}