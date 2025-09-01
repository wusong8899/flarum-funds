import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';
import withAttr from 'flarum/common/utils/withAttr';
import type Mithril from 'mithril';

export interface SimpleDepositFormData {
  depositAddress: string;
  qrCodeUrl?: string;
  userMessage?: string;
}

interface SimpleDepositFormProps {
  onSubmit: (data: SimpleDepositFormData) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

interface SimpleDepositFormState {
  depositAddress: Stream<string>;
  qrCodeUrl: Stream<string>;
  userMessage: Stream<string>;
}

export default class SimpleDepositForm extends Component<SimpleDepositFormProps, SimpleDepositFormState> {
  oninit(vnode: Mithril.Vnode<SimpleDepositFormProps>) {
    super.oninit(vnode);
    
    this.state = {
      depositAddress: Stream(''),
      qrCodeUrl: Stream(''),
      userMessage: Stream('')
    };
  }

  view(vnode: Mithril.Vnode<SimpleDepositFormProps>): Mithril.Children {
    const { submitting } = vnode.attrs;

    return (
      <div className="SimpleDepositForm">
        <div className="SimpleDepositForm-header">
          <div className="SimpleDepositForm-title">
            <i className="fas fa-plus-circle"></i>
            {app.translator.trans('funds.forum.deposit.simple.form_title', {}, '存款申请')}
          </div>
          <div className="SimpleDepositForm-description">
            {app.translator.trans('funds.forum.deposit.simple.form_description', {}, '请填写您的存款地址和收款二维码，我们会尽快处理您的申请。')}
          </div>
        </div>

        <form onsubmit={this.handleSubmit.bind(this)} className="SimpleDepositForm-form">
          {/* 存款地址字段 */}
          <div className="SimpleDepositForm-field">
            <label className="SimpleDepositForm-label">
              {app.translator.trans('funds.forum.deposit.simple.deposit_address', {}, '存款地址')}
              <span className="SimpleDepositForm-required">*</span>
            </label>
            <input
              type="text"
              className="SimpleDepositForm-input"
              placeholder={app.translator.trans('funds.forum.deposit.simple.deposit_address_placeholder', {}, '请输入您的存款地址...')}
              value={this.state.depositAddress()}
              oninput={withAttr('value', this.state.depositAddress)}
              required
              disabled={submitting}
            />
            <div className="SimpleDepositForm-help">
              {app.translator.trans('funds.forum.deposit.simple.deposit_address_help', {}, '请输入您用于接收存款的钱包地址或账号')}
            </div>
          </div>

          {/* 收款二维码字段 */}
          <div className="SimpleDepositForm-field">
            <label className="SimpleDepositForm-label">
              {app.translator.trans('funds.forum.deposit.simple.qr_code_url', {}, '收款二维码')}
              <span className="SimpleDepositForm-optional">
                ({app.translator.trans('funds.forum.deposit.simple.optional', {}, '可选')})
              </span>
            </label>
            <input
              type="url"
              className="SimpleDepositForm-input"
              placeholder={app.translator.trans('funds.forum.deposit.simple.qr_code_url_placeholder', {}, '请输入二维码图片链接...')}
              value={this.state.qrCodeUrl()}
              oninput={withAttr('value', this.state.qrCodeUrl)}
              disabled={submitting}
            />
            <div className="SimpleDepositForm-help">
              {app.translator.trans('funds.forum.deposit.simple.qr_code_url_help', {}, '可选：上传您的收款二维码图片链接，方便其他人扫码转账')}
            </div>
          </div>

          {/* 留言字段 */}
          <div className="SimpleDepositForm-field">
            <label className="SimpleDepositForm-label">
              {app.translator.trans('funds.forum.deposit.simple.user_message', {}, '留言')}
              <span className="SimpleDepositForm-optional">
                ({app.translator.trans('funds.forum.deposit.simple.optional', {}, '可选')})
              </span>
            </label>
            <textarea
              className="SimpleDepositForm-textarea"
              placeholder={app.translator.trans('funds.forum.deposit.simple.user_message_placeholder', {}, '请输入您的留言或说明...')}
              value={this.state.userMessage()}
              oninput={withAttr('value', this.state.userMessage)}
              rows={4}
              disabled={submitting}
            ></textarea>
            <div className="SimpleDepositForm-help">
              {app.translator.trans('funds.forum.deposit.simple.user_message_help', {}, '可选：添加您的存款说明或特殊要求')}
            </div>
          </div>

          {/* 表单操作按钮 */}
          <div className="SimpleDepositForm-actions">
            <Button
              type="button"
              className="Button Button--secondary SimpleDepositForm-cancelButton"
              onclick={vnode.attrs.onCancel}
              disabled={submitting}
            >
              {app.translator.trans('funds.forum.deposit.simple.cancel', {}, '取消')}
            </Button>
            
            <Button
              type="submit"
              className="Button Button--primary SimpleDepositForm-submitButton"
              loading={submitting}
              disabled={submitting}
            >
              {app.translator.trans('funds.forum.deposit.simple.submit', {}, '提交申请')}
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
        app.translator.trans('funds.forum.deposit.simple.validation.address_required', {}, '请输入存款地址')
      );
      return;
    }

    // 验证二维码URL格式（如果提供的话）
    const qrCodeUrl = this.state.qrCodeUrl();
    if (qrCodeUrl && !this.isValidUrl(qrCodeUrl)) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('funds.forum.deposit.simple.validation.invalid_url', {}, '请输入有效的二维码图片链接')
      );
      return;
    }

    // 准备表单数据
    const formData: SimpleDepositFormData = {
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