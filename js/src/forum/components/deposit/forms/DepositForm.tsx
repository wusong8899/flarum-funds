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
  userMessage: Stream<string>;
}

export default class DepositForm extends Component<DepositFormProps, DepositFormState> {
  oninit(vnode: Mithril.Vnode<DepositFormProps>) {
    super.oninit(vnode);
    
    this.state = {
      selectedPlatform: Stream(null),
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
              onclick={vnode.attrs.onCancel}
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
    const warningText = getAttr(platform, 'warningText') || 
      app.translator.trans('funds.forum.deposit.default_warning', {
        currency: symbol,
        network: getAttr(platform, 'network'),
        minAmount
      });

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
            size={160}
          />
        </div>

        <div className="DepositForm-field">
          <div className="DepositForm-warning">
            <i className="fas fa-info-circle"></i>
            <span>{warningText}</span>
          </div>
        </div>
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

    // 准备表单数据
    const formData: DepositFormData = {
      selectedPlatform: this.state.selectedPlatform(),
      userMessage: this.state.userMessage() || undefined
    };

    onSubmit(formData);
  }

  // 清空表单
  resetForm(): void {
    this.state.selectedPlatform(null);
    this.state.userMessage('');
  }
}