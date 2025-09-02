import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';
import withAttr from 'flarum/common/utils/withAttr';
import type Mithril from 'mithril';
import DepositPlatform from '../../../../common/models/DepositPlatform';
import DepositPlatformDropdown from '../selectors/DepositPlatformDropdown';
import AddressDisplay from '../components/AddressDisplay';
import ImageDisplay from '../components/ImageDisplay';
import { getAttr } from '../../withdrawal/utils/modelHelpers';

export interface DepositFormData {
  selectedPlatform: DepositPlatform | null;
  amount: number;
  depositTime: Date;
  userMessage?: string;
}

interface DepositFormProps {
  platforms: DepositPlatform[];
  onSubmit: (data: DepositFormData) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

interface DepositFormState {
  selectedPlatform: Stream<DepositPlatform | null>;
  amount: Stream<string>;
  depositTime: Stream<string>;
  userMessage: Stream<string>;
}

export default class DepositForm extends Component<DepositFormProps, DepositFormState> {
  oninit(vnode: Mithril.Vnode<DepositFormProps>) {
    super.oninit(vnode);
    
    // Initialize with current date/time for deposit time
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16); // Format: YYYY-MM-DDTHH:mm
    
    this.state = {
      selectedPlatform: Stream(null),
      amount: Stream(''),
      depositTime: Stream(localDateTime),
      userMessage: Stream('')
    };
  }

  view(vnode: Mithril.Vnode<DepositFormProps>): Mithril.Children {
    const { platforms, submitting } = vnode.attrs;

    return (
      <div className="DepositForm">
        <div className="DepositForm-header">
          <div className="DepositForm-title">
            <i className="fas fa-plus-circle"></i>
            {app.translator.trans('funds.forum.deposit.form.form_title')}
          </div>
          <div className="DepositForm-description">
            {app.translator.trans('funds.forum.deposit.form.form_description')}
          </div>
        </div>

        <form onsubmit={this.handleSubmit.bind(this)} className="DepositForm-form">
          {/* 平台选择字段 */}
          <div className="DepositForm-field">
            <DepositPlatformDropdown
              platforms={platforms}
              selectedPlatform={this.state.selectedPlatform()}
              onPlatformSelect={(platform: DepositPlatform) => {
                this.state.selectedPlatform(platform);
              }}
            />
          </div>

          {/* 显示选中平台的存款信息 */}
          {this.state.selectedPlatform() && this.renderDepositInfo()}

          {/* 存款金额字段 */}
          {this.state.selectedPlatform() && (
            <div className="DepositForm-field">
              <label className="DepositForm-label">
                {app.translator.trans('funds.forum.deposit.record.amount')}
                <span className="DepositForm-required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="DepositForm-input"
                placeholder={app.translator.trans('funds.forum.deposit.record.amount_placeholder')}
                value={this.state.amount()}
                oninput={withAttr('value', this.state.amount)}
                required
                disabled={submitting}
              />
              <div className="DepositForm-help">
                {app.translator.trans('funds.forum.deposit.record.amount_help', {
                  symbol: getAttr(this.state.selectedPlatform(), 'symbol') || ''
                })}
              </div>
            </div>
          )}

          {/* 存款时间字段 */}
          {this.state.selectedPlatform() && (
            <div className="DepositForm-field">
              <label className="DepositForm-label">
                {app.translator.trans('funds.forum.deposit.record.deposit_time')}
                <span className="DepositForm-required">*</span>
              </label>
              <input
                type="datetime-local"
                className="DepositForm-input"
                value={this.state.depositTime()}
                oninput={withAttr('value', this.state.depositTime)}
                required
                disabled={submitting}
              />
              <div className="DepositForm-help">
                {app.translator.trans('funds.forum.deposit.record.deposit_time_help')}
              </div>
            </div>
          )}

          {/* 留言字段 */}
          <div className="DepositForm-field">
            <label className="DepositForm-label">
              {app.translator.trans('funds.forum.deposit.form.user_message')}
              <span className="DepositForm-optional">
                ({app.translator.trans('funds.forum.deposit.form.optional')})
              </span>
            </label>
            <textarea
              className="DepositForm-textarea"
              placeholder={app.translator.trans('funds.forum.deposit.form.user_message_placeholder')}
              value={this.state.userMessage()}
              oninput={withAttr('value', this.state.userMessage)}
              rows={4}
              disabled={submitting}
            ></textarea>
            <div className="DepositForm-help">
              {app.translator.trans('funds.forum.deposit.form.user_message_help')}
            </div>
          </div>

          {/* 表单操作按钮 */}
          <div className="DepositForm-actions">
            <Button
              type="button"
              className="Button Button--secondary DepositForm-cancelButton"
              onclick={() => app.modal.close()}
              disabled={submitting}
            >
              {app.translator.trans('funds.forum.deposit.form.cancel')}
            </Button>
            
            <Button
              type="submit"
              className="Button Button--primary DepositForm-submitButton"
              loading={submitting}
              disabled={submitting}
            >
              {app.translator.trans('funds.forum.deposit.form.submit')}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  private renderDepositInfo(): Mithril.Children {
    const platform = this.state.selectedPlatform();
    if (!platform) return null;

    const address = getAttr(platform, 'address');
    const minAmount = getAttr(platform, 'minAmount') || 0;
    const symbol = getAttr(platform, 'symbol');
    const warningText = getAttr(platform, 'warningText');

    return (
      <div className="DepositForm-depositInfo">
        <div className="DepositForm-field">
          <label className="DepositForm-label">
            {app.translator.trans('funds.forum.deposit.form.deposit_address')}
          </label>
          <AddressDisplay
            address={address || ''}
            loading={false}
            onCopy={() => {
              if (address) {
                navigator.clipboard.writeText(address).then(() => {
                  app.alerts.show(
                    { type: 'success', dismissible: true },
                    app.translator.trans('funds.forum.deposit.address_copied')
                  );
                }).catch(() => {
                  app.alerts.show(
                    { type: 'error', dismissible: true },
                    app.translator.trans('funds.forum.deposit.copy_failed')
                  );
                });
              }
            }}
          />
          <div className="DepositForm-help">
            {app.translator.trans('funds.forum.deposit.form.deposit_address_help')}
          </div>
        </div>

        {minAmount > 0 && (
          <div className="DepositForm-field">
            <div className="DepositForm-minAmount">
              {app.translator.trans('funds.forum.deposit.min_amount', {
                amount: minAmount,
                currency: symbol
              })}
            </div>
          </div>
        )}

        <div className="DepositForm-field">
          <ImageDisplay
            platform={platform}
            loading={false}
          />
        </div>

        {warningText && (
        <div className="DepositForm-field">
          <div className="DepositForm-warning">
            <i className="fas fa-info-circle"></i>
            <span>{warningText}</span>
          </div>
        </div>
        )}
      </div>
    );
  }

  private handleSubmit(e: Event): void {
    e.preventDefault();

    const { onSubmit } = this.attrs;
    
    // 验证必选字段
    if (!this.state.selectedPlatform()) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('funds.forum.deposit.form.validation.platform_required')
      );
      return;
    }

    // 验证金额
    const amount = parseFloat(this.state.amount());
    if (!this.state.amount() || isNaN(amount) || amount <= 0) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('funds.forum.deposit.record.validation.invalid_amount')
      );
      return;
    }

    // 验证存款时间
    if (!this.state.depositTime()) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('funds.forum.deposit.record.validation.deposit_time_required')
      );
      return;
    }

    // 检查平台最小金额限制
    const platform = this.state.selectedPlatform();
    const minAmount = getAttr(platform, 'minAmount') || 0;
    if (minAmount > 0 && amount < minAmount) {
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

    // 准备表单数据
    const formData: DepositFormData = {
      selectedPlatform: this.state.selectedPlatform(),
      amount: amount,
      depositTime: new Date(this.state.depositTime()),
      userMessage: this.state.userMessage() || undefined
    };

    onSubmit(formData);
  }

  // 清空表单
  resetForm(): void {
    this.state.selectedPlatform(null);
    this.state.amount('');
    
    // Reset deposit time to current time
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    this.state.depositTime(localDateTime);
    
    this.state.userMessage('');
  }
}