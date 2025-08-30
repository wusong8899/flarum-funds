import icon from 'flarum/common/helpers/icon';
import type Mithril from 'mithril';
import WithdrawalPlatform from '../../../../common/models/WithdrawalPlatform';
import { getAttr } from '../utils/modelHelpers';
import { ICONS } from '../utils/constants';

interface PlatformIconProps {
  platform: WithdrawalPlatform | null;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default class PlatformIcon {
  view(vnode: Mithril.Vnode<PlatformIconProps>): Mithril.Children {
    const { platform, className = '', size = 'medium' } = vnode.attrs;

    // Add null checks to prevent errors
    if (!platform) {
      return icon(ICONS.COINS, { className: `crypto-icon default ${className}` });
    }

    // Handle both Model instances and plain objects
    const iconUrl = getAttr(platform, 'iconUrl');
    const iconClass = getAttr(platform, 'iconClass');
    const name = getAttr(platform, 'name');
    const symbol = getAttr(platform, 'symbol');

    // Size classes
    const sizeClass = `platform-icon-${size}`;

    // Priority: iconUrl > iconClass > default
    if (iconUrl) {
      return (
        <img 
          src={iconUrl} 
          alt={name || 'Platform'}
          className={`platform-icon-image ${sizeClass} ${className}`}
          onerror={(e) => {
            // Fallback to iconClass or default icon if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallbackIcon = document.createElement('i');
            const fallbackIconClass = iconClass || ICONS.COINS;
            fallbackIcon.className = `${fallbackIconClass} crypto-icon ${className}`;
            target.parentElement?.appendChild(fallbackIcon);
          }}
        />
      );
    }

    // Use Font Awesome icon class if specified, otherwise default
    const finalIconClass = iconClass || ICONS.COINS;
    const finalSymbol = symbol?.toLowerCase() || 'default';
    return icon(finalIconClass, { 
      className: `crypto-icon ${finalSymbol} ${sizeClass} ${className}` 
    });
  }
}