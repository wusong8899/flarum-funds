import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import icon from 'flarum/common/helpers/icon';
import type Mithril from 'mithril';
import DepositPlatform from '../../../../common/models/DepositPlatform';
import { getAttr } from '../../withdrawal/utils/modelHelpers';
import { ICONS } from '../../withdrawal/utils/constants';
import { getBestPlatformIcon, getCurrencyIcon, renderIcon } from '../../../../common/utils/IconResolver';
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
      <div className="FundsPage-platformSelector">
        <div className="FundsPage-label">{app.translator.trans('funds.forum.deposit.platform_label')}</div>
        <div 
          className="FundsPage-platformDropdown" 
          onclick={() => this.toggleDropdown()}
        >
          <div className="FundsPage-platformSelected">
            <div className="FundsPage-platformInfo">
              <div className="FundsPage-platformIcon">
                {this.renderPlatformIcon(selectedPlatform)}
              </div>
              <div className="FundsPage-platformDetails">
                <div className="FundsPage-platformName">
                  {this.getPlatformDisplayName(selectedPlatform)}
                </div>
                {selectedPlatform && this.renderPlatformSubtext(selectedPlatform)}
              </div>
            </div>
          </div>
          {icon(ICONS.CHEVRON_DOWN, { className: 'FundsPage-dropdownIcon' })}
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
    return renderIcon(bestIcon, 'FundsPage-platformIconImage');
  }

  private getCurrencyIconForSymbol(symbol: string, platforms: DepositPlatform[]): Mithril.Children {
    // Find the first platform with this symbol to get currency icon
    const platformWithSymbol = platforms.find(platform => getAttr(platform, 'symbol') === symbol);
    
    if (platformWithSymbol) {
      const currencyIconRep = getCurrencyIcon(platformWithSymbol);
      return renderIcon(currencyIconRep, 'FundsPage-currencyIcon');
    }
    
    return icon('fas fa-coins');
  }

  private renderPlatformSubtext(platform: DepositPlatform): Mithril.Children {
    const minAmount = getAttr(platform, 'minAmount');
    const fee = getAttr(platform, 'fee');
    const symbol = getAttr(platform, 'symbol');
    
    const parts: string[] = [];
    
    if (minAmount && minAmount > 0) {
      parts.push(app.translator.trans('funds.forum.deposit.min_amount_short', {
        amount: minAmount,
        symbol: symbol
      }).toString());
    }
    
    if (fee && fee > 0) {
      parts.push(app.translator.trans('funds.forum.deposit.fee_short', {
        fee: fee,
        symbol: symbol
      }).toString());
    }
    
    if (parts.length > 0) {
      return (
        <div className="FundsPage-platformSubtext">
          {parts.join(' • ')}
        </div>
      );
    }
    
    return null;
  }

  private renderPlatformDropdown(): Mithril.Children {
    const { platforms } = this.attrs;

    // Group platforms by currency and sort
    const groupedPlatforms = this.groupPlatformsByCurrency(platforms);
    
    if (Object.keys(groupedPlatforms).length === 0) {
      return (
        <div className="FundsPage-dropdownMenu">
          <div className="FundsPage-dropdownItem FundsPage-noData">
            {app.translator.trans('funds.forum.deposit.no_platforms')}
          </div>
        </div>
      );
    }

    return (
      <div className="FundsPage-dropdownMenu">
        {Object.entries(groupedPlatforms).flatMap(([currency, currencyPlatforms]) => [
          // Currency header
          <div key={`${currency}-header`} className="FundsPage-dropdownHeader">
            <div className="FundsPage-currencyHeader">
              <div className="FundsPage-currencyIcon">
                {this.getCurrencyIconForSymbol(currency, platforms)}
              </div>
              <span className="FundsPage-currencyName">{currency}</span>
            </div>
          </div>,
          // Platforms for this currency
          ...currencyPlatforms.map(platform => (
            <div 
              key={platform.id()}
              className="FundsPage-dropdownItem"
              onclick={() => this.selectPlatform(platform)}
            >
              <div className="FundsPage-platformIcon">
                {this.renderPlatformIcon(platform)}
              </div>
              <div className="FundsPage-platformInfo">
                <div className="FundsPage-platformName">
                  {this.getPlatformDisplayName(platform)}
                </div>
                {this.renderPlatformSubtext(platform)}
              </div>
            </div>
          ))
        ])}
      </div>
    );
  }

  private groupPlatformsByCurrency(platforms: DepositPlatform[]): { [currency: string]: DepositPlatform[] } {
    const grouped: { [currency: string]: DepositPlatform[] } = {};
    
    // Filter active platforms and group by currency
    const validPlatforms = (platforms || []).filter(platform => 
      platform && getAttr(platform, 'isActive')
    );

    validPlatforms.forEach(platform => {
      const symbol = getAttr(platform, 'symbol');
      if (!grouped[symbol]) {
        grouped[symbol] = [];
      }
      grouped[symbol].push(platform);
    });

    // Sort platforms within each currency group by network
    Object.keys(grouped).forEach(currency => {
      grouped[currency].sort((a, b) => {
        const networkA = getAttr(a, 'network') || '';
        const networkB = getAttr(b, 'network') || '';
        return networkA.localeCompare(networkB);
      });
    });

    return grouped;
  }

  private selectPlatform(platform: DepositPlatform): void {
    const { onPlatformSelect } = this.attrs;
    
    onPlatformSelect(platform);
    this.state.showDropdown = false;
  }
}