import { IconRepresentation } from '../models/CurrencyIcon';

declare const m: any;

/**
 * Icon priority order for display resolution
 */
export enum IconPriority {
  PLATFORM_SPECIFIC = 1,
  NETWORK = 2,
  CURRENCY = 3,
  FALLBACK = 4
}

/**
 * Helper function to get the best available icon from a platform
 */
export function getBestPlatformIcon(platform: any): IconRepresentation {
  // Priority 1: Platform-specific icons
  const platformIconUrl = platform.platformSpecificIconUrl?.();
  if (platformIconUrl) {
    return {
      type: 'currency_url',
      value: platformIconUrl,
      alt: platform.name?.() || 'Platform icon'
    };
  }

  const platformIconClass = platform.platformSpecificIconClass?.();
  if (platformIconClass) {
    return {
      type: 'currency_class',
      value: platformIconClass
    };
  }

  // Priority 2: Network icons
  const networkIconUrl = platform.networkIconUrl?.();
  if (networkIconUrl) {
    return {
      type: 'currency_url',
      value: networkIconUrl,
      alt: platform.network?.() || 'Network icon'
    };
  }

  const networkIconClass = platform.networkIconClass?.();
  if (networkIconClass) {
    return {
      type: 'currency_class',
      value: networkIconClass
    };
  }

  // Priority 3: Currency icons
  const currencyIconUrl = platform.currencyIconUrl?.();
  if (currencyIconUrl) {
    return {
      type: 'currency_url',
      value: currencyIconUrl,
      alt: platform.symbol?.() || 'Currency icon'
    };
  }

  const currencyIconClass = platform.currencyIconClass?.();
  if (currencyIconClass) {
    return {
      type: 'currency_class',
      value: currencyIconClass
    };
  }

  const currencyUnicodeSymbol = platform.currencyUnicodeSymbol?.();
  if (currencyUnicodeSymbol) {
    return {
      type: 'currency_unicode',
      value: currencyUnicodeSymbol
    };
  }

  // Priority 4: Fallback
  return {
    type: 'fallback',
    value: 'fas fa-coins'
  };
}

/**
 * Helper function to get currency icon specifically
 */
export function getCurrencyIcon(platform: any): IconRepresentation {
  // Check currency icon override fields first
  const currencyIconOverrideUrl = platform.currencyIconOverrideUrl?.();
  if (currencyIconOverrideUrl) {
    return {
      type: 'currency_url',
      value: currencyIconOverrideUrl,
      alt: platform.symbol?.() || 'Currency icon'
    };
  }

  const currencyIconOverrideClass = platform.currencyIconOverrideClass?.();
  if (currencyIconOverrideClass) {
    return {
      type: 'currency_class',
      value: currencyIconOverrideClass
    };
  }

  // Fall back to computed currency icon
  const currencyIcon = platform.currencyIcon?.();
  if (currencyIcon) {
    return currencyIcon;
  }

  // Direct currency icon fields
  const currencyIconUrl = platform.currencyIconUrl?.();
  if (currencyIconUrl) {
    return {
      type: 'currency_url',
      value: currencyIconUrl,
      alt: platform.symbol?.() || 'Currency icon'
    };
  }

  const currencyIconClass = platform.currencyIconClass?.();
  if (currencyIconClass) {
    return {
      type: 'currency_class',
      value: currencyIconClass
    };
  }

  const currencyUnicodeSymbol = platform.currencyUnicodeSymbol?.();
  if (currencyUnicodeSymbol) {
    return {
      type: 'currency_unicode',
      value: currencyUnicodeSymbol
    };
  }

  return {
    type: 'fallback',
    value: 'fas fa-coins'
  };
}

/**
 * Helper function to get network icon specifically
 */
export function getNetworkIcon(platform: any): IconRepresentation {
  // Check network icon override fields first
  const networkIconOverrideUrl = platform.networkIconOverrideUrl?.();
  if (networkIconOverrideUrl) {
    return {
      type: 'currency_url',
      value: networkIconOverrideUrl,
      alt: platform.network?.() || 'Network icon'
    };
  }

  const networkIconOverrideClass = platform.networkIconOverrideClass?.();
  if (networkIconOverrideClass) {
    return {
      type: 'currency_class',
      value: networkIconOverrideClass
    };
  }

  // Fall back to computed network icon
  const networkIcon = platform.networkIcon?.();
  if (networkIcon) {
    return networkIcon;
  }

  // Direct network icon fields
  const networkIconUrl = platform.networkIconUrl?.();
  if (networkIconUrl) {
    return {
      type: 'currency_url',
      value: networkIconUrl,
      alt: platform.network?.() || 'Network icon'
    };
  }

  const networkIconClass = platform.networkIconClass?.();
  if (networkIconClass) {
    return {
      type: 'currency_class',
      value: networkIconClass
    };
  }

  return {
    type: 'fallback',
    value: 'fas fa-network-wired'
  };
}

/**
 * Render an icon representation as a Mithril element
 */
export function renderIcon(iconRep: IconRepresentation, additionalClasses: string = ''): Mithril.Children {
  const baseClasses = 'icon';
  const classes = additionalClasses ? `${baseClasses} ${additionalClasses}` : baseClasses;

  switch (iconRep.type) {
    case 'currency_url':
      return m('img', {
        src: iconRep.value,
        alt: iconRep.alt || 'Icon',
        className: `${classes} icon--image`,
        style: {
          width: '1em',
          height: '1em',
          objectFit: 'contain',
          display: 'inline-block',
          verticalAlign: 'middle'
        }
      });

    case 'currency_class':
      return m('i', {
        className: `${classes} ${iconRep.value}`,
        'aria-hidden': 'true'
      });

    case 'currency_unicode':
      return m('span', {
        className: `${classes} icon--unicode`,
        'aria-hidden': 'true'
      }, iconRep.value);

    case 'fallback':
    default:
      return m('i', {
        className: `${classes} ${iconRep.value}`,
        'aria-hidden': 'true'
      });
  }
}

/**
 * Get icon priority level for sorting/comparison
 */
export function getIconPriority(platform: any): IconPriority {
  if (platform.platformSpecificIconUrl?.() || platform.platformSpecificIconClass?.()) {
    return IconPriority.PLATFORM_SPECIFIC;
  }

  if (platform.networkIconUrl?.() || platform.networkIconClass?.()) {
    return IconPriority.NETWORK;
  }

  if (platform.currencyIconUrl?.() || platform.currencyIconClass?.() || platform.currencyUnicodeSymbol?.()) {
    return IconPriority.CURRENCY;
  }

  return IconPriority.FALLBACK;
}