import Component from 'flarum/common/Component';
import icon from 'flarum/common/helpers/icon';
import Stream from 'flarum/common/utils/Stream';
import m from 'mithril';
import type Mithril from 'mithril';
import type DepositPlatform from '../../../common/models/DepositPlatform';
import { getAttr } from '../../withdrawal/utils/modelHelpers';

export interface PlatformSelectorAttrs {
  platforms: DepositPlatform[];
  selected: DepositPlatform | null;
  onSelect: (platform: DepositPlatform) => void;
  loading: boolean;
}

export default class PlatformSelector extends Component<PlatformSelectorAttrs> {
  private isOpen = Stream(false);

  view(vnode: Mithril.Vnode<PlatformSelectorAttrs>) {
    const { platforms, selected, loading } = vnode.attrs;

    return (
      <div className={`PlatformSelector ${this.isOpen() ? 'open' : ''}`}>
        <div 
          className="PlatformSelector-trigger"
          onclick={() => !loading && this.isOpen(!this.isOpen())}
        >
          <div className="PlatformSelector-content">
            {loading ? (
              <div className="PlatformSelector-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Loading platforms...</span>
              </div>
            ) : selected ? (
              <div className="PlatformSelector-selected">
                <div className="PlatformSelector-icon">
                  {this.getPlatformIcon(selected)}
                </div>
                <span className="PlatformSelector-label">{this.getPlatformDisplayName(selected)}</span>
              </div>
            ) : (
              <div className="PlatformSelector-placeholder">
                <div className="PlatformSelector-icon">
                  {icon('fas fa-coins')}
                </div>
                <span className="PlatformSelector-label">Select Platform</span>
              </div>
            )}
          </div>
          <div className="PlatformSelector-arrow">
            {icon('fas fa-chevron-down')}
          </div>
        </div>

        {this.isOpen() && !loading && (
          <div className="PlatformSelector-dropdown">
            {platforms.map(platform => (
              <div
                key={platform.id()}
                className={`PlatformSelector-option ${platform === selected ? 'selected' : ''}`}
                onclick={() => this.handleSelect(platform, vnode.attrs.onSelect)}
              >
                <div className="PlatformSelector-optionIcon">
                  {this.getPlatformIcon(platform)}
                </div>
                <div className="PlatformSelector-optionContent">
                  <span className="PlatformSelector-optionLabel">{this.getPlatformDisplayName(platform)}</span>
                  <span className="PlatformSelector-optionDesc">{this.getPlatformDescription(platform)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  oncreate(vnode: Mithril.VnodeDOM) {
    super.oncreate(vnode);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleOutsideClick);
  }

  onremove(vnode: Mithril.VnodeDOM) {
    super.onremove(vnode);
    document.removeEventListener('click', this.handleOutsideClick);
  }

  private handleOutsideClick = (e: MouseEvent) => {
    const element = this.element;
    if (element && !element.contains(e.target as Node)) {
      this.isOpen(false);
      m.redraw();
    }
  };

  private handleSelect(platform: DepositPlatform, onSelect: (platform: DepositPlatform) => void): void {
    onSelect(platform);
    this.isOpen(false);
  }

  private getPlatformIcon(platform: DepositPlatform): Mithril.Children {
    const iconUrl = getAttr(platform, 'iconUrl');
    const iconClass = getAttr(platform, 'iconClass');
    const symbol = getAttr(platform, 'symbol');

    if (iconUrl) {
      return <img src={iconUrl} alt={symbol} className="PlatformSelector-platformIcon" />;
    } else if (iconClass) {
      return <i className={iconClass}></i>;
    } else {
      return icon('fas fa-coins');
    }
  }

  private getPlatformDisplayName(platform: DepositPlatform): string {
    const symbol = getAttr(platform, 'symbol');
    const network = getAttr(platform, 'network');
    
    if (network) {
      return `${symbol} (${network})`;
    }
    return symbol;
  }

  private getPlatformDescription(platform: DepositPlatform): string {
    const minAmount = getAttr(platform, 'minAmount');
    const network = getAttr(platform, 'network');
    
    if (network && minAmount) {
      return `${network} network - Min: ${minAmount}`;
    } else if (network) {
      return `${network} network`;
    } else if (minAmount) {
      return `Min: ${minAmount}`;
    }
    return 'Deposit platform';
  }
}