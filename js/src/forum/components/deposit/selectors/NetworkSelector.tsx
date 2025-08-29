import Component from 'flarum/common/Component';
import icon from 'flarum/common/helpers/icon';
import Stream from 'flarum/common/utils/Stream';
import m from 'mithril';
import type Mithril from 'mithril';

export interface NetworkSelectorAttrs {
  networks: string[];
  selected: string;
  onSelect: (network: string) => void;
  loading: boolean;
  disabled: boolean;
}

export default class NetworkSelector extends Component<NetworkSelectorAttrs> {
  private isOpen = Stream(false);

  view(vnode: Mithril.Vnode<NetworkSelectorAttrs>) {
    const { networks, selected, loading, disabled } = vnode.attrs;

    return (
      <div className={`NetworkSelector ${this.isOpen() ? 'open' : ''} ${disabled ? 'disabled' : ''}`}>
        <div 
          className="NetworkSelector-trigger"
          onclick={() => !loading && !disabled && this.isOpen(!this.isOpen())}
        >
          <div className="NetworkSelector-content">
            {loading ? (
              <div className="NetworkSelector-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Loading networks...</span>
              </div>
            ) : disabled ? (
              <div className="NetworkSelector-placeholder">
                <div className="NetworkSelector-icon">
                  {icon('fas fa-network-wired')}
                </div>
                <span className="NetworkSelector-label">Select currency first</span>
              </div>
            ) : selected ? (
              <div className="NetworkSelector-selected">
                <div className="NetworkSelector-icon">
                  {this.getNetworkIcon(selected)}
                </div>
                <span className="NetworkSelector-label">{selected}</span>
              </div>
            ) : (
              <div className="NetworkSelector-placeholder">
                <div className="NetworkSelector-icon">
                  {icon('fas fa-network-wired')}
                </div>
                <span className="NetworkSelector-label">Select Network</span>
              </div>
            )}
          </div>
          <div className="NetworkSelector-arrow">
            {icon('fas fa-chevron-down')}
          </div>
        </div>

        {this.isOpen() && !loading && !disabled && (
          <div className="NetworkSelector-dropdown">
            {networks.map(network => (
              <div
                key={network}
                className={`NetworkSelector-option ${network === selected ? 'selected' : ''}`}
                onclick={() => this.handleSelect(network, vnode.attrs.onSelect)}
              >
                <div className="NetworkSelector-optionIcon">
                  {this.getNetworkIcon(network)}
                </div>
                <span className="NetworkSelector-optionLabel">{network}</span>
                <span className="NetworkSelector-optionDesc">{this.getNetworkDescription(network)}</span>
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

  private handleSelect(network: string, onSelect: (network: string) => void): void {
    onSelect(network);
    this.isOpen(false);
  }

  private getNetworkIcon(network: string): Mithril.Children {
    // You can customize icons per network here
    switch (network) {
      case 'TRC20':
        return <span className="NetworkSelector-networkIcon trc20">T</span>;
      case 'ERC20':
        return <span className="NetworkSelector-networkIcon erc20">E</span>;
      case 'BSC':
      case 'BEP20':
        return <span className="NetworkSelector-networkIcon bsc">B</span>;
      case 'POLYGON':
        return <span className="NetworkSelector-networkIcon polygon">P</span>;
      default:
        return icon('fas fa-network-wired');
    }
  }

  private getNetworkDescription(network: string): string {
    // Network descriptions for better UX
    switch (network) {
      case 'TRC20':
        return 'TRON network - Low fees';
      case 'ERC20':
        return 'Ethereum network - High security';
      case 'BSC':
      case 'BEP20':
        return 'Binance Smart Chain - Fast & cheap';
      case 'POLYGON':
        return 'Polygon network - Very low fees';
      default:
        return 'Blockchain network';
    }
  }
}