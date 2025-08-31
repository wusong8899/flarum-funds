import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import type Mithril from 'mithril';
import WithdrawalPlatform from '../../../../common/models/WithdrawalPlatform';
import { getAttr } from '../utils/modelHelpers';
import { DEFAULTS } from '../utils/constants';

interface SubmitButtonProps {
  amount: string;
  selectedPlatform: WithdrawalPlatform | null;
  accountDetails: string;
  submitting: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
}

export default class SubmitButton extends Component<SubmitButtonProps> {
  view(): Mithril.Children {
    const { 
      amount, 
      selectedPlatform, 
      submitting, 
      canSubmit, 
      onSubmit 
    } = this.attrs;

    const numericAmount = parseFloat(amount) || 0;
    const fee = this.getFee(selectedPlatform);
    const finalAmount = Math.max(0, numericAmount - fee);
    const symbol = this.getSymbol(selectedPlatform);

    return (
      <div className="WithdrawalPage-submitSection">
        <Button
          className="WithdrawalPage-submitButton"
          loading={submitting}
          disabled={!canSubmit}
          onclick={onSubmit}
        >
          {app.translator.trans('funds.forum.form.submit')}
        </Button>

        {numericAmount > 0 && (
          <div className="WithdrawalPage-finalAmount">
            {app.translator.trans('funds.forum.final_amount', { 
              amount: finalAmount.toFixed(DEFAULTS.BALANCE_PRECISION), 
              symbol 
            })}
          </div>
        )}
      </div>
    );
  }

  private getFee(platform: WithdrawalPlatform | null): number {
    if (!platform) return DEFAULTS.FEE;
    return getAttr(platform, 'fee') || DEFAULTS.FEE;
  }

  private getSymbol(platform: WithdrawalPlatform | null): string {
    if (!platform) return '';
    return getAttr(platform, 'symbol') || '';
  }
}