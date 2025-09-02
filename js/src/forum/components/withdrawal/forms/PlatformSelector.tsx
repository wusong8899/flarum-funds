import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import icon from 'flarum/common/helpers/icon';
import type Mithril from 'mithril';
import WithdrawalPlatform from '../../../../common/models/WithdrawalPlatform';
import PlatformIcon from '../common/PlatformIcon';
import { getAttr } from '../utils/modelHelpers';
import { ICONS } from '../utils/constants';

interface PlatformSelectorProps {
  platforms: WithdrawalPlatform[];
  selectedPlatform: WithdrawalPlatform | null;
  onPlatformSelect: (platform: WithdrawalPlatform) => void;
  onAmountChange?: () => void; // Callback when platform changes to clear amount
}

interface PlatformSelectorState {
  showDropdown: boolean;
}

export default class PlatformSelector extends Component<PlatformSelectorProps, PlatformSelectorState> {
  oninit(vnode: Mithril.Vnode<PlatformSelectorProps, PlatformSelectorState>) {
    super.oninit(vnode);
    this.state = {
      showDropdown: false,
    };
  }

  view(): Mithril.Children {
    const { selectedPlatform } = this.attrs;
    const { showDropdown } = this.state;

    return (
      <div className="FundsPage-withdrawal-PlatformSelector">
        <div className="FundsPage-withdrawal-Label">提取平台</div>
        <div 
          className="FundsPage-withdrawal-PlatformDropdown" 
          onclick={() => this.toggleDropdown()}
        >
          <div className="FundsPage-withdrawal-PlatformSelected">
            <div className="FundsPage-withdrawal-PlatformInfo">
              <div className="FundsPage-withdrawal-PlatformIcon">
                <PlatformIcon 
                  platform={selectedPlatform} 
                  size="medium"
                />
              </div>
              <div className="FundsPage-withdrawal-PlatformDetails">
                <div className="FundsPage-withdrawal-PlatformName">
                  {this.getPlatformName(selectedPlatform)}
                </div>
              </div>
            </div>
          </div>
          {icon(ICONS.CHEVRON_DOWN, { className: 'FundsPage-withdrawal-DropdownIcon' })}
        </div>

        {showDropdown && this.renderPlatformDropdown()}
      </div>
    );
  }

  private toggleDropdown(): void {
    this.state.showDropdown = !this.state.showDropdown;
  }

  private getPlatformName(platform: WithdrawalPlatform | null): string {
    if (!platform) {
      return '请选择平台';
    }
    return getAttr(platform, 'displayName') || getAttr(platform, 'name') || '请选择平台';
  }

  private renderPlatformDropdown(): Mithril.Children {
    const { platforms } = this.attrs;

    // Ensure platforms array is valid and filter out invalid items
    const validPlatforms = (platforms || []).filter(platform => !!platform);

    if (validPlatforms.length === 0) {
      return (
        <div className="FundsPage-withdrawal-DropdownMenu">
          <div className="FundsPage-withdrawal-DropdownItem FundsPage-withdrawal-NoData">
            {app.translator.trans('funds.forum.no_platforms')}
          </div>
        </div>
      );
    }

    return (
      <div className="FundsPage-withdrawal-DropdownMenu">
        {validPlatforms.map(platform => (
          <div 
            key={platform.id()}
            className="FundsPage-withdrawal-DropdownItem"
            onclick={() => this.selectPlatform(platform)}
          >
            <div className="FundsPage-withdrawal-PlatformIcon">
              <PlatformIcon platform={platform} size="small" />
            </div>
            <div className="FundsPage-withdrawal-PlatformName">
              {getAttr(platform, 'displayName') || getAttr(platform, 'name')}
            </div>
          </div>
        ))}
      </div>
    );
  }

  private selectPlatform(platform: WithdrawalPlatform): void {
    const { onPlatformSelect, onAmountChange } = this.attrs;
    
    onPlatformSelect(platform);
    this.state.showDropdown = false;
    
    // Clear amount when switching platforms
    if (onAmountChange) {
      onAmountChange();
    }
  }
}