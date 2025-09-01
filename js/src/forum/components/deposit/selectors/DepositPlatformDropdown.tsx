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
      <div className="WithdrawalPage-platformSelector">
        <div className="WithdrawalPage-label">{app.translator.trans('funds.forum.deposit.platform_label')}</div>
        <div 
          className="WithdrawalPage-platformDropdown" 
          onclick={() => this.toggleDropdown()}
        >
          <div className="WithdrawalPage-platformSelected">
            <div className="WithdrawalPage-platformInfo">
              <div className="WithdrawalPage-platformIcon">
                {this.renderPlatformIcon(selectedPlatform)}
              </div>
              <div className="WithdrawalPage-platformDetails">
                <div className="WithdrawalPage-platformName">
                  {this.getPlatformDisplayName(selectedPlatform)}
                </div>
              </div>
            </div>
          </div>
          {icon(ICONS.CHEVRON_DOWN, { className: 'WithdrawalPage-dropdownIcon' })}
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
      return icon('fas fa-coins');
    }

    const bestIcon = getBestPlatformIcon(platform);
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
        <div className="WithdrawalPage-dropdownMenu">
          <div className="WithdrawalPage-dropdownItem WithdrawalPage-noData">
            {app.translator.trans('funds.forum.deposit.no_platforms')}
          </div>
        </div>
      );
    }

    return (
      <div className="WithdrawalPage-dropdownMenu">
        {validPlatforms.map(platform => (
          <div 
            key={platform.id()}
            className="WithdrawalPage-dropdownItem"
            onclick={() => this.selectPlatform(platform)}
          >
            <div className="WithdrawalPage-platformIcon">
              {this.renderPlatformIcon(platform)}
            </div>
            <div className="WithdrawalPage-platformName">
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