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
      <div className="FundsPage-withdrawal-AmountSection">
        <div className="FundsPage-withdrawal-FormGroup">
          <div className="FundsPage-withdrawal-Label">
            {app.translator.trans('funds.forum.form.amount')}
          </div>

          <div className="FundsPage-withdrawal-AmountInput">
            <input
              type="text"
              className="FundsPage-withdrawal-Input"
              placeholder="0.00000000"
              value={amount}
              oninput={(e: Event) => onAmountChange((e.target as HTMLInputElement).value)}
            />
            <Button
              className="FundsPage-withdrawal-AllButton"
              onclick={onFillAllAmount}
              disabled={loadingBalance}
            >
              {app.translator.trans('funds.forum.form.all_button')}
            </Button>
          </div>

          <div className="FundsPage-withdrawal-AmountLimits">
            <div className="FundsPage-withdrawal-LimitRow">
              <span className="FundsPage-withdrawal-LimitLabel">
                {app.translator.trans('funds.forum.limits.min_max')}
              </span>
              <span className="FundsPage-withdrawal-LimitValue">
                {icon(ICONS.COINS)} {minAmount} ~ {maxAmount}
              </span>
            </div>
            <div className="FundsPage-withdrawal-LimitRow">
              <span className="FundsPage-withdrawal-LimitLabel">
                {app.translator.trans('funds.forum.limits.fee')}
              </span>
              <span className="FundsPage-withdrawal-LimitValue">
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