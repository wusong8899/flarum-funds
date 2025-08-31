import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import icon from 'flarum/common/helpers/icon';
import type Mithril from 'mithril';
import WithdrawalPlatform from '../../../../common/models/WithdrawalPlatform';
import { getAttr } from '../utils/modelHelpers';
import { DEFAULTS, ICONS } from '../utils/constants';

interface AmountInputProps {
  amount: string;
  selectedPlatform: WithdrawalPlatform | null;
  loadingBalance: boolean;
  onAmountChange: (amount: string) => void;
  onFillAllAmount: () => void;
}

export default class AmountInput extends Component<AmountInputProps> {
  view(): Mithril.Children {
    const { 
      amount, 
      selectedPlatform, 
      loadingBalance,
      onAmountChange,
      onFillAllAmount 
    } = this.attrs;

    const minAmount = this.getMinAmount(selectedPlatform);
    const maxAmount = this.getMaxAmount(selectedPlatform);
    const fee = this.getFee(selectedPlatform);

    return (
      <div className="WithdrawalPage-amountSection">
        <div className="WithdrawalPage-formGroup">
          <div className="WithdrawalPage-label">
            {app.translator.trans('funds.forum.form.amount')}
          </div>

          <div className="WithdrawalPage-amountInput">
            <input
              type="text"
              className="WithdrawalPage-input"
              placeholder="0.00000000"
              value={amount}
              oninput={(e: Event) => onAmountChange((e.target as HTMLInputElement).value)}
            />
            <Button
              className="WithdrawalPage-allButton"
              onclick={onFillAllAmount}
              disabled={loadingBalance}
            >
              {app.translator.trans('funds.forum.form.all_button')}
            </Button>
          </div>

          <div className="WithdrawalPage-amountLimits">
            <div className="WithdrawalPage-limitRow">
              <span className="WithdrawalPage-limitLabel">
                {app.translator.trans('funds.forum.limits.min_max')}
              </span>
              <span className="WithdrawalPage-limitValue">
                {icon(ICONS.COINS)} {minAmount} ~ {maxAmount}
              </span>
            </div>
            <div className="WithdrawalPage-limitRow">
              <span className="WithdrawalPage-limitLabel">
                {app.translator.trans('funds.forum.limits.fee')}
              </span>
              <span className="WithdrawalPage-limitValue">
                {icon(ICONS.COINS)} {fee}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private getMinAmount(platform: WithdrawalPlatform | null): number {
    if (!platform) return DEFAULTS.MIN_AMOUNT;
    return getAttr(platform, 'minAmount') || DEFAULTS.MIN_AMOUNT;
  }

  private getMaxAmount(platform: WithdrawalPlatform | null): number {
    if (!platform) return DEFAULTS.MAX_AMOUNT;
    return getAttr(platform, 'maxAmount') || DEFAULTS.MAX_AMOUNT;
  }

  private getFee(platform: WithdrawalPlatform | null): number {
    if (!platform) return DEFAULTS.FEE;
    return getAttr(platform, 'fee') || DEFAULTS.FEE;
  }
}