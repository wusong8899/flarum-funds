import Model from 'flarum/common/Model';

export interface IconRepresentation {
  type: 'currency_url' | 'currency_class' | 'currency_unicode' | 'fallback';
  value: string;
  alt?: string;
}

export default class CurrencyIcon extends Model {
  id = Model.attribute<string>('id');
  currencySymbol = Model.attribute<string>('currencySymbol');
  currencyName = Model.attribute<string>('currencyName');
  currencyIconUrl = Model.attribute<string>('currencyIconUrl');
  currencyIconClass = Model.attribute<string>('currencyIconClass');
  currencyUnicodeSymbol = Model.attribute<string>('currencyUnicodeSymbol');
  displayPriority = Model.attribute<number>('displayPriority');
  isActive = Model.attribute<boolean>('isActive');
  createdAt = Model.attribute<Date>('createdAt', (attr: string) => Model.transformDate(attr));
  updatedAt = Model.attribute<Date>('updatedAt', (attr: string) => Model.transformDate(attr));

  // Additional computed attributes from serializer
  bestIcon = Model.attribute<IconRepresentation>('bestIcon');

  /**
   * Get the best available icon representation
   */
  getBestIcon(): IconRepresentation {
    const bestIcon = this.bestIcon();
    if (bestIcon) {
      return bestIcon;
    }

    // Fallback logic if bestIcon isn't available
    if (this.currencyIconUrl()) {
      return {
        type: 'currency_url',
        value: this.currencyIconUrl()!,
        alt: this.currencySymbol()
      };
    }

    if (this.currencyIconClass()) {
      return {
        type: 'currency_class',
        value: this.currencyIconClass()!
      };
    }

    if (this.currencyUnicodeSymbol()) {
      return {
        type: 'currency_unicode',
        value: this.currencyUnicodeSymbol()!
      };
    }

    return {
      type: 'fallback',
      value: 'fas fa-coins'
    };
  }

  /**
   * Check if this currency has a custom icon URL
   */
  hasCustomIcon(): boolean {
    return !!this.currencyIconUrl();
  }

  /**
   * Check if this currency has a custom CSS class
   */
  hasCustomClass(): boolean {
    return !!this.currencyIconClass();
  }

  /**
   * Check if this currency has a Unicode symbol
   */
  hasUnicodeSymbol(): boolean {
    return !!this.currencyUnicodeSymbol();
  }

  /**
   * Get display name with symbol
   */
  getDisplayName(): string {
    const name = this.currencyName();
    const symbol = this.currencySymbol();
    
    if (name && symbol) {
      return `${name} (${symbol})`;
    }
    
    return name || symbol || 'Unknown Currency';
  }
}