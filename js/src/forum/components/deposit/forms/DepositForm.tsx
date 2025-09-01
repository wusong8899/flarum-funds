import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';
import withAttr from 'flarum/common/utils/withAttr';
import type Mithril from 'mithril';

export interface DepositFormData {
  depositAddress: string;
  qrCodeUrl?: string;
  userMessage?: string;
}

interface DepositFormProps {
  onSubmit: (data: DepositFormData) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

interface DepositFormState {
  depositAddress: Stream<string>;
  qrCodeUrl: Stream<string>;
  userMessage: Stream<string>;
}

export default class DepositForm extends Component<DepositFormProps, DepositFormState> {
  oninit(vnode: Mithril.Vnode<DepositFormProps>) {
    super.oninit(vnode);
    
    this.state = {
      depositAddress: Stream(''),
      qrCodeUrl: Stream(''),
      userMessage: Stream('')
    };
  }

  view(vnode: Mithril.Vnode<DepositFormProps>): Mithril.Children {
    const { submitting } = vnode.attrs;

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
          {/* 存款地址字段 */}
          <div className="DepositForm-field">
            <label className="DepositForm-label">
              {app.translator.trans('funds.forum.deposit.form.deposit_address')}
              <span className="DepositForm-required">*</span>
            </label>
            <input
              type="text"
              className="DepositForm-input"
              placeholder={app.translator.trans('funds.forum.deposit.form.deposit_address_placeholder')}
              value={this.state.depositAddress()}
              oninput={withAttr('value', this.state.depositAddress)}
              required
              disabled={submitting}
            />
            <div className="DepositForm-help">
              {app.translator.trans('funds.forum.deposit.form.deposit_address_help')}
            </div>
          </div>

          {/* 收款二维码字段 */}
          <div className="DepositForm-field">
            <label className="DepositForm-label">
              {app.translator.trans('funds.forum.deposit.form.qr_code_url')}
              <span className="DepositForm-optional">
                ({app.translator.trans('funds.forum.deposit.form.optional')})
              </span>
            </label>
            <input
              type="url"
              className="DepositForm-input"
              placeholder={app.translator.trans('funds.forum.deposit.form.qr_code_url_placeholder')}
              value={this.state.qrCodeUrl()}
              oninput={withAttr('value', this.state.qrCodeUrl)}
              disabled={submitting}
            />
            <div className="DepositForm-help">
              {app.translator.trans('funds.forum.deposit.form.qr_code_url_help')}
            </div>
          </div>

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

  private handleSubmit(e: Event): void {
    e.preventDefault();

    const { onSubmit } = this.attrs;
    
    // 基本验证
    if (!this.state.depositAddress()) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('funds.forum.deposit.form.validation.address_required')
      );
      return;
    }

    // 验证二维码URL格式（如果提供的话）
    const qrCodeUrl = this.state.qrCodeUrl();
    if (qrCodeUrl && !this.isValidUrl(qrCodeUrl)) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('funds.forum.deposit.form.validation.invalid_url')
      );
      return;
    }

    // 准备表单数据
    const formData: DepositFormData = {
      depositAddress: this.state.depositAddress(),
      qrCodeUrl: qrCodeUrl || undefined,
      userMessage: this.state.userMessage() || undefined
    };

    onSubmit(formData);
  }

  private isValidUrl(url: string): boolean {
    try {
      // eslint-disable-next-line no-new
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // 清空表单
  resetForm(): void {
    this.state.depositAddress('');
    this.state.qrCodeUrl('');
    this.state.userMessage('');
  }
}