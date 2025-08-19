import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import icon from 'flarum/common/helpers/icon';
import type Mithril from 'mithril';
import type { WithdrawalPlatform } from '../types/interfaces';
import { getAttr } from '../utils/modelHelpers';
import { ICONS } from '../utils/constants';

interface AddressInputProps {
  accountDetails: string;
  selectedPlatform: WithdrawalPlatform | null;
  saveAddress: boolean;
  onAccountDetailsChange: (details: string) => void;
  onSaveAddressToggle: (save: boolean) => void;
}

export default class AddressInput extends Component<AddressInputProps> {
  view(): Mithril.Children {
    const { 
      accountDetails, 
      selectedPlatform, 
      saveAddress,
      onAccountDetailsChange,
      onSaveAddressToggle
    } = this.attrs;

    const symbol = this.getSymbol(selectedPlatform);

    return (
      <div className="WithdrawalPage-addressSection">
        <div className="WithdrawalPage-formGroup">
          <div className="WithdrawalPage-addressHeader">
            <span className="WithdrawalPage-label">
              {app.translator.trans('withdrawal.forum.form.address', { symbol })}
              <span className="WithdrawalPage-required">*</span>
            </span>
            <div 
              className="WithdrawalPage-saveAddress" 
              onclick={() => onSaveAddressToggle(!saveAddress)}
            >
              {icon(ICONS.BOOKMARK)}
              {app.translator.trans('withdrawal.forum.form.save_address')}
            </div>
          </div>

          <div className="WithdrawalPage-addressInput">
            <input
              type="text"
              className="WithdrawalPage-input"
              placeholder={app.translator.trans('withdrawal.forum.form.address_placeholder')}
              value={accountDetails}
              oninput={(e: Event) => onAccountDetailsChange((e.target as HTMLInputElement).value)}
            />
            <button 
              className="WithdrawalPage-pasteButton" 
              onclick={() => this.pasteFromClipboard()}
            >
              {icon(ICONS.PASTE)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  private getSymbol(platform: WithdrawalPlatform | null): string {
    if (!platform) return '';
    return getAttr(platform, 'symbol') || '';
  }

  private async pasteFromClipboard(): Promise<void> {
    const { onAccountDetailsChange } = this.attrs;
    
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        onAccountDetailsChange(text.trim());
        m.redraw();
      }
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      app.alerts.show({
        type: 'error',
        dismissible: true
      }, app.translator.trans('withdrawal.forum.clipboard_error'));
    }
  }
}