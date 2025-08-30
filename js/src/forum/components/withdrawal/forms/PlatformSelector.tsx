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
      <div className="WithdrawalPage-platformSelector">
        <div className="WithdrawalPage-label">提取平台</div>
        <div 
          className="WithdrawalPage-platformDropdown" 
          onclick={() => this.toggleDropdown()}
        >
          <div className="WithdrawalPage-platformSelected">
            <div className="WithdrawalPage-platformInfo">
              <div className="WithdrawalPage-platformIcon">
                <PlatformIcon 
                  platform={selectedPlatform} 
                  size="medium"
                />
              </div>
              <div className="WithdrawalPage-platformDetails">
                <div className="WithdrawalPage-platformName">
                  {this.getPlatformName(selectedPlatform)}
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
        <div className="WithdrawalPage-dropdownMenu">
          <div className="WithdrawalPage-dropdownItem WithdrawalPage-noData">
            {app.translator.trans('withdrawal.forum.no_platforms')}
          </div>
        </div>
      );
    }

    return (
      <div className="WithdrawalPage-dropdownMenu">
        {validPlatforms.map(platform => (
          <div 
            key={platform.id}
            className="WithdrawalPage-dropdownItem"
            onclick={() => this.selectPlatform(platform)}
          >
            <div className="WithdrawalPage-platformIcon">
              <PlatformIcon platform={platform} size="small" />
            </div>
            <div className="WithdrawalPage-platformName">
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