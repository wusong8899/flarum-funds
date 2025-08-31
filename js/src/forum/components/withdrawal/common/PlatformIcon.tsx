import icon from 'flarum/common/helpers/icon';
import type Mithril from 'mithril';
import WithdrawalPlatform from '../../../../common/models/WithdrawalPlatform';
import { ICONS } from '../utils/constants';
import { getBestPlatformIcon, renderIcon } from '../../../../common/utils/IconResolver';

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

    // Size classes
    const sizeClass = `platform-icon-${size}`;
    const finalClasses = `crypto-icon ${sizeClass} ${className}`;

    // Use the new three-tier icon system
    const bestIcon = getBestPlatformIcon(platform);
    
    return renderIcon(bestIcon, finalClasses);
  }
}