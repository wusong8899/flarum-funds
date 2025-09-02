import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import icon from 'flarum/common/helpers/icon';
import type Mithril from 'mithril';
import DepositPlatform from '../../../../common/models/DepositPlatform';
import { getAttr } from '../../withdrawal/utils/modelHelpers';
import { ICONS } from '../../withdrawal/utils/constants';
import { getBestPlatformIcon, renderIcon } from '../../../../common/utils/IconResolver';
import m from 'mithril';

interface DepositPlatformDropdownProps {
  platforms: DepositPlatform[];
  selectedPlatform: DepositPlatform | null;
  onPlatformSelect: (platform: DepositPlatform) => void;
}

interface DepositPlatformDropdownState {
  showDropdown: boolean;
}

export default class DepositPlatformDropdown extends Component<DepositPlatformDropdownProps, DepositPlatformDropdownState> {
  oninit(vnode: Mithril.Vnode<DepositPlatformDropdownProps, DepositPlatformDropdownState>) {
    super.oninit(vnode);
    this.state = {
      showDropdown: false,
    };
  }

  view(): Mithril.Children {
    const { selectedPlatform } = this.attrs;
    const { showDropdown } = this.state;

    return (
      <div className="DepositForm-platformSelector">
        <div className="DepositForm-label">{app.translator.trans('funds.forum.deposit.platform_label')}</div>
        <div 
          className="DepositForm-platformDropdown" 
          onclick={() => this.toggleDropdown()}
        >
          <div className="DepositForm-platformSelected">
            <div className="DepositForm-platformInfo">
              <div className="DepositForm-platformIcon">
                {this.renderPlatformIcon(selectedPlatform)}
              </div>
              <div className="DepositForm-platformDetails">
                <div className="DepositForm-platformName">
                  {this.getPlatformDisplayName(selectedPlatform)}
                </div>
              </div>
            </div>
          </div>
          {icon(ICONS.CHEVRON_DOWN, { className: 'DepositForm-dropdownIcon' })}
        </div>

        {showDropdown && this.renderPlatformDropdown()}
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
      this.state.showDropdown = false;
      m.redraw();
    }
  };

  private toggleDropdown(): void {
    this.state.showDropdown = !this.state.showDropdown;
  }

  private getPlatformDisplayName(platform: DepositPlatform | null): string {
    if (!platform) {
      return app.translator.trans('funds.forum.deposit.select_platform').toString();
    }
    
    const name = getAttr(platform, 'name') || '';
    const network = getAttr(platform, 'network');
    
    if (network) {
      return `${name} (${network})`;
    }
    
    return name;
  }

  private renderPlatformIcon(platform: DepositPlatform | null): Mithril.Children {
    if (!platform) {
      console.log('No platform selected, showing default icon');
      return icon('fas fa-coins');
    }

    const bestIcon = getBestPlatformIcon(platform);
    console.log('Platform icon data for', getAttr(platform, 'name'), ':', {
      platformIconUrl: getAttr(platform, 'platformIconUrl'),
      platformIconClass: getAttr(platform, 'platformIconClass'),
      bestIcon: bestIcon
    });
    return renderIcon(bestIcon, 'platform-icon-image');
  }


  private renderPlatformDropdown(): Mithril.Children {
    const { platforms } = this.attrs;

    // Filter active platforms
    const validPlatforms = (platforms || []).filter(platform => 
      platform && getAttr(platform, 'isActive')
    );
    
    if (validPlatforms.length === 0) {
      return (
        <div className="DepositForm-dropdownMenu">
          <div className="DepositForm-dropdownItem DepositForm-noData">
            {app.translator.trans('funds.forum.deposit.no_platforms')}
          </div>
        </div>
      );
    }

    return (
      <div className="DepositForm-dropdownMenu">
        {validPlatforms.map(platform => (
          <div 
            key={platform.id()}
            className="DepositForm-dropdownItem"
            onclick={() => this.selectPlatform(platform)}
          >
            <div className="DepositForm-platformIcon">
              {this.renderPlatformIcon(platform)}
            </div>
            <div className="DepositForm-platformName">
              {this.getPlatformDisplayName(platform)}
            </div>
          </div>
        ))}
      </div>
    );
  }


  private selectPlatform(platform: DepositPlatform): void {
    const { onPlatformSelect } = this.attrs;
    
    onPlatformSelect(platform);
    this.state.showDropdown = false;
  }
}