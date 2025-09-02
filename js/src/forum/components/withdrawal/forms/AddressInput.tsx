import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import icon from 'flarum/common/helpers/icon';
import type Mithril from 'mithril';
import WithdrawalPlatform from '../../../../common/models/WithdrawalPlatform';
import { getAttr } from '../utils/modelHelpers';
import { ICONS } from '../utils/constants';
import m from 'mithril';

interface AddressInputProps {
  accountDetails: string;
  selectedPlatform: WithdrawalPlatform | null;
  onAccountDetailsChange: (details: string) => void;
}

export default class AddressInput extends Component<AddressInputProps> {
  view(): Mithril.Children {
    const { 
      accountDetails, 
      selectedPlatform, 
      onAccountDetailsChange
    } = this.attrs;

    const symbol = this.getSymbol(selectedPlatform);

    return (
      <div className="FundsPage-withdrawal-AddressSection">
        <div className="FundsPage-withdrawal-FormGroup">
          <div className="FundsPage-withdrawal-AddressHeader">
            <span className="FundsPage-withdrawal-Label">
              {app.translator.trans('funds.forum.form.address', { symbol })}
              <span className="FundsPage-withdrawal-Required">*</span>
            </span>
          </div>

          <div className="FundsPage-withdrawal-AddressInput">
            <input
              type="text"
              className="FundsPage-withdrawal-Input"
              placeholder={app.translator.trans('funds.forum.form.address_placeholder')}
              value={accountDetails}
              oninput={(e: Event) => onAccountDetailsChange((e.target as HTMLInputElement).value)}
            />
            <button 
              className="FundsPage-withdrawal-PasteButton" 
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
      }, app.translator.trans('funds.forum.clipboard_error'));
    }
  }
}