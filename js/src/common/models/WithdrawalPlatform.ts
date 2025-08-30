import Model from 'flarum/common/Model';

/**
 * WithdrawalPlatform model for Flarum
 * 
 * This model represents a withdrawal platform that users can use
 * to withdraw their virtual currency.
 */
export default class WithdrawalPlatform extends Model {
  // Basic attributes
  name = Model.attribute<string>('name');
  symbol = Model.attribute<string>('symbol');
  network = Model.attribute<string | null>('network');
  displayName = Model.attribute<string>('displayName');
  minAmount = Model.attribute<number>('minAmount');
  maxAmount = Model.attribute<number>('maxAmount');
  fee = Model.attribute<number>('fee');
  
  // Optional attributes
  iconUrl = Model.attribute<string | null>('iconUrl');
  iconClass = Model.attribute<string | null>('iconClass');
  
  // Status
  isActive = Model.attribute<boolean>('isActive');
  
  // Timestamps
  createdAt = Model.attribute('createdAt', Model.transformDate);
  updatedAt = Model.attribute('updatedAt', Model.transformDate);
  
  // Computed properties
  apiEndpoint() {
    return `/withdrawal-platforms/${this.id()}`;
  }
  
  // Helper methods
  getDisplayName(): string {
    return this.displayName() || this.name();
  }
  
  isValidAmount(amount: number): boolean {
    const min = this.minAmount();
    const max = this.maxAmount();
    return amount >= min && amount <= max;
  }
  
  getTotalCost(amount: number): number {
    return amount + this.fee();
  }
}