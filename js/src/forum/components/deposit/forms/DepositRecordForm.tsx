import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';
import withAttr from 'flarum/common/utils/withAttr';
import type Mithril from 'mithril';
import type DepositPlatform from '../../../../common/models/DepositPlatform';
import { getAttr, getIdString } from '../../withdrawal/utils/modelHelpers';

export interface DepositRecordFormData {
  platformId: number;
  platformAccount: string;
  realName?: string;
  amount: number;
  depositTime: Date;
  screenshotUrl?: string;
  userMessage?: string;
}

interface DepositRecordFormProps {
  platform: DepositPlatform;
  onSubmit: (data: DepositRecordFormData) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

interface DepositRecordFormState {
  platformAccount: Stream<string>;
  realName: Stream<string>;
  amount: Stream<string>;
  depositTime: Stream<string>;
  screenshotUrl: Stream<string>;
  userMessage: Stream<string>;
}

export default class DepositRecordForm extends Component<DepositRecordFormProps, DepositRecordFormState> {
  oninit(vnode: Mithril.Vnode<DepositRecordFormProps>) {
    super.oninit(vnode);
    
    // Initialize form data with current date/time
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16); // Format: YYYY-MM-DDTHH:mm
    
    this.state = {
      platformAccount: Stream(''),
      realName: Stream(''),
      amount: Stream(''),
      depositTime: Stream(localDateTime),
      screenshotUrl: Stream(''),
      userMessage: Stream('')
    };
  }

  view(vnode: Mithril.Vnode<DepositRecordFormProps>): Mithril.Children {
    const { platform, submitting } = vnode.attrs;
    const minAmount = getAttr(platform, 'minAmount') || 0;
    const maxAmount = getAttr(platform, 'maxAmount');
    const symbol = getAttr(platform, 'symbol') || '';

    // Debug logging - can be removed after verification
    console.log('DepositRecordForm platform data:', {
      platform,
      minAmount,
      maxAmount,
      symbol,
      platformAttributes: platform?.attributes,
      minAmountType: typeof minAmount,
      maxAmountType: typeof maxAmount
    });

    return (
      <div className="DepositRecordForm">
        <div className="DepositRecordForm-header">
          <div className="DepositRecordForm-title">
            <i className="fas fa-plus-circle"></i>
            {app.translator.trans('funds.forum.deposit.record.form_title')}
          </div>
          <div className="DepositRecordForm-platformInfo">
            {app.translator.trans('funds.forum.deposit.record.selected_platform', {
              platform: getAttr(platform, 'name'),
              symbol: symbol
            })}
          </div>
        </div>

        <form onsubmit={this.handleSubmit.bind(this)} className="DepositRecordForm-form">
          {/* Platform Account Field */}
          <div className="DepositRecordForm-field">
            <label className="DepositRecordForm-label">
              {app.translator.trans('funds.forum.deposit.record.platform_account')}
              <span className="DepositRecordForm-required">*</span>
            </label>
            <input
              type="text"
              className="DepositRecordForm-input"
              placeholder={app.translator.trans('funds.forum.deposit.record.platform_account_placeholder')}
              value={this.state.platformAccount()}
              oninput={withAttr('value', this.state.platformAccount)}
              required
              disabled={submitting}
            />
            <div className="DepositRecordForm-help">
              {app.translator.trans('funds.forum.deposit.record.platform_account_help')}
            </div>
          </div>

          {/* Real Name Field (Optional) */}
          <div className="DepositRecordForm-field">
            <label className="DepositRecordForm-label">
              {app.translator.trans('funds.forum.deposit.record.real_name')}
              <span className="DepositRecordForm-optional">
                ({app.translator.trans('funds.forum.deposit.record.optional')})
              </span>
            </label>
            <input
              type="text"
              className="DepositRecordForm-input"
              placeholder={app.translator.trans('funds.forum.deposit.record.real_name_placeholder')}
              value={this.state.realName()}
              oninput={withAttr('value', this.state.realName)}
              disabled={submitting}
            />
          </div>

          {/* Amount Field */}
          <div className="DepositRecordForm-field">
            <label className="DepositRecordForm-label">
              {app.translator.trans('funds.forum.deposit.record.amount')} ({symbol})
              <span className="DepositRecordForm-required">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min={minAmount}
              max={maxAmount}
              className="DepositRecordForm-input"
              placeholder={app.translator.trans('funds.forum.deposit.record.amount_placeholder')}
              value={this.state.amount()}
              oninput={withAttr('value', this.state.amount)}
              required
              disabled={submitting}
            />
            <div className="DepositRecordForm-limits">
              {minAmount > 0 && (
                <span className="DepositRecordForm-limit">
                  {app.translator.trans('funds.forum.deposit.record.min_amount', {
                    amount: minAmount,
                    symbol: symbol
                  })}
                </span>
              )}
              {maxAmount && (
                <span className="DepositRecordForm-limit">
                  {app.translator.trans('funds.forum.deposit.record.max_amount', {
                    amount: maxAmount,
                    symbol: symbol
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Deposit Time Field */}
          <div className="DepositRecordForm-field">
            <label className="DepositRecordForm-label">
              {app.translator.trans('funds.forum.deposit.record.deposit_time')}
              <span className="DepositRecordForm-required">*</span>
            </label>
            <input
              type="datetime-local"
              className="DepositRecordForm-input"
              value={this.state.depositTime()}
              oninput={withAttr('value', this.state.depositTime)}
              required
              disabled={submitting}
            />
            <div className="DepositRecordForm-help">
              {app.translator.trans('funds.forum.deposit.record.deposit_time_help')}
            </div>
          </div>

          {/* Screenshot URL Field (Optional) */}
          <div className="DepositRecordForm-field">
            <label className="DepositRecordForm-label">
              {app.translator.trans('funds.forum.deposit.record.screenshot_url')}
              <span className="DepositRecordForm-optional">
                ({app.translator.trans('funds.forum.deposit.record.optional')})
              </span>
            </label>
            <input
              type="url"
              className="DepositRecordForm-input"
              placeholder={app.translator.trans('funds.forum.deposit.record.screenshot_url_placeholder')}
              value={this.state.screenshotUrl()}
              oninput={withAttr('value', this.state.screenshotUrl)}
              disabled={submitting}
            />
            <div className="DepositRecordForm-help">
              {app.translator.trans('funds.forum.deposit.record.screenshot_url_help')}
            </div>
          </div>

          {/* User Message Field (Optional) */}
          <div className="DepositRecordForm-field">
            <label className="DepositRecordForm-label">
              {app.translator.trans('funds.forum.deposit.record.user_message')}
              <span className="DepositRecordForm-optional">
                ({app.translator.trans('funds.forum.deposit.record.optional')})
              </span>
            </label>
            <textarea
              className="DepositRecordForm-textarea"
              placeholder={app.translator.trans('funds.forum.deposit.record.user_message_placeholder')}
              value={this.state.userMessage()}
              oninput={withAttr('value', this.state.userMessage)}
              rows={3}
              disabled={submitting}
            ></textarea>
          </div>

          {/* Form Actions */}
          <div className="DepositRecordForm-actions">
            <Button
              type="button"
              className="Button Button--secondary DepositRecordForm-cancelButton"
              onclick={vnode.attrs.onCancel}
              disabled={submitting}
            >
              {app.translator.trans('funds.forum.deposit.record.cancel')}
            </Button>
            
            <Button
              type="submit"
              className="Button Button--primary DepositRecordForm-submitButton"
              loading={submitting}
              disabled={submitting}
            >
              {app.translator.trans('funds.forum.deposit.record.submit')}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  private handleSubmit(e: Event): void {
    e.preventDefault();

    const { platform, onSubmit } = this.attrs;
    
    // Basic validation
    if (!this.state.platformAccount() || !this.state.amount() || !this.state.depositTime()) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('funds.forum.deposit.record.validation.required_fields')
      );
      return;
    }

    const amount = parseFloat(this.state.amount());
    if (isNaN(amount) || amount <= 0) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('funds.forum.deposit.record.validation.invalid_amount')
      );
      return;
    }

    // Check platform limits
    const minAmount = getAttr(platform, 'minAmount') || 0;
    const maxAmount = getAttr(platform, 'maxAmount');

    if (amount < minAmount) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('funds.forum.deposit.record.validation.amount_too_low', {
          amount: amount,
          min: minAmount,
          symbol: getAttr(platform, 'symbol')
        })
      );
      return;
    }

    if (maxAmount && amount > maxAmount) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('funds.forum.deposit.record.validation.amount_too_high', {
          amount: amount,
          max: maxAmount,
          symbol: getAttr(platform, 'symbol')
        })
      );
      return;
    }

    // Prepare form data
    const formData: DepositRecordFormData = {
      platformId: parseInt(getIdString(platform)),
      platformAccount: this.state.platformAccount(),
      realName: this.state.realName() || undefined,
      amount: amount,
      depositTime: new Date(this.state.depositTime()),
      screenshotUrl: this.state.screenshotUrl() || undefined,
      userMessage: this.state.userMessage() || undefined
    };

    onSubmit(formData);
  }
}