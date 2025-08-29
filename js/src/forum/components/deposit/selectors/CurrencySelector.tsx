import Component from 'flarum/common/Component';
import icon from 'flarum/common/helpers/icon';
import Stream from 'flarum/common/utils/Stream';
import m from 'mithril';
import type Mithril from 'mithril';

export interface CurrencySelectorAttrs {
  currencies: string[];
  selected: string;
  onSelect: (currency: string) => void;
  loading: boolean;
}

export default class CurrencySelector extends Component<CurrencySelectorAttrs> {
  private isOpen = Stream(false);

  view(vnode: Mithril.Vnode<CurrencySelectorAttrs>) {
    const { currencies, selected, loading } = vnode.attrs;

    return (
      <div className={`CurrencySelector ${this.isOpen() ? 'open' : ''}`}>
        <div 
          className="CurrencySelector-trigger"
          onclick={() => !loading && this.isOpen(!this.isOpen())}
        >
          <div className="CurrencySelector-content">
            {loading ? (
              <div className="CurrencySelector-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Loading currencies...</span>
              </div>
            ) : selected ? (
              <div className="CurrencySelector-selected">
                <div className="CurrencySelector-icon">
                  {this.getCurrencyIcon(selected)}
                </div>
                <span className="CurrencySelector-label">{selected}</span>
              </div>
            ) : (
              <div className="CurrencySelector-placeholder">
                <div className="CurrencySelector-icon">
                  {icon('fas fa-coins')}
                </div>
                <span className="CurrencySelector-label">Select Currency</span>
              </div>
            )}
          </div>
          <div className="CurrencySelector-arrow">
            {icon('fas fa-chevron-down')}
          </div>
        </div>

        {this.isOpen() && !loading && (
          <div className="CurrencySelector-dropdown">
            {currencies.map(currency => (
              <div
                key={currency}
                className={`CurrencySelector-option ${currency === selected ? 'selected' : ''}`}
                onclick={() => this.handleSelect(currency, vnode.attrs.onSelect)}
              >
                <div className="CurrencySelector-optionIcon">
                  {this.getCurrencyIcon(currency)}
                </div>
                <span className="CurrencySelector-optionLabel">{currency}</span>
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

  private handleSelect(currency: string, onSelect: (currency: string) => void): void {
    onSelect(currency);
    this.isOpen(false);
  }

  private getCurrencyIcon(currency: string): Mithril.Children {
    // You can customize icons per currency here
    switch (currency) {
      case 'USDT':
        return <span className="CurrencySelector-currencyIcon usdt">₮</span>;
      case 'USDC':
        return <span className="CurrencySelector-currencyIcon usdc">$</span>;
      case 'BTC':
        return <span className="CurrencySelector-currencyIcon btc">₿</span>;
      case 'ETH':
        return <span className="CurrencySelector-currencyIcon eth">Ξ</span>;
      default:
        return icon('fas fa-coins');
    }
  }
}