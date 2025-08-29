import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Switch from 'flarum/common/components/Switch';
import Stream from 'flarum/common/utils/Stream';
import withAttr from 'flarum/common/utils/withAttr';
import m from 'mithril';
import type Mithril from 'mithril';

export interface DepositPlatformFormData {
  name: string;
  symbol: string;
  network: string;
  minAmount: string;
  maxAmount: string;
  address: string;
  addressTemplate: string;
  iconUrl: string;
  iconClass: string;
  qrCodeTemplate: string;
  warningText: string;
  isActive: boolean;
}

export interface AddDepositPlatformFormAttrs {
  submitting: boolean;
  onSubmit: (formData: DepositPlatformFormData) => Promise<void>;
  onCancel: () => void;
}

export default class AddDepositPlatformForm extends Component<AddDepositPlatformFormAttrs> {
  private formData = {
    name: Stream(''),
    symbol: Stream(''),
    network: Stream(''),
    minAmount: Stream(''),
    maxAmount: Stream(''),
    address: Stream(''),
    addressTemplate: Stream(''),
    iconUrl: Stream(''),
    iconClass: Stream(''),
    qrCodeTemplate: Stream(''),
    warningText: Stream(''),
    isActive: Stream(true)
  };

  view(vnode: Mithril.Vnode<AddDepositPlatformFormAttrs>) {
    const { submitting, onCancel } = vnode.attrs;

    return (
      <div className="AddDepositPlatformForm">
        <div className="Form">
          <div className="Form-row">
            <div className="Form-group">
              <label>
                {app.translator.trans('withdrawal.admin.deposit.platforms.name')}
                <span className="Form-required">*</span>
              </label>
              <input
                type="text"
                className="FormControl"
                placeholder="e.g., Tether"
                bidi={this.formData.name}
                disabled={submitting}
              />
            </div>
            <div className="Form-group">
              <label>
                {app.translator.trans('withdrawal.admin.deposit.platforms.symbol')}
                <span className="Form-required">*</span>
              </label>
              <input
                type="text"
                className="FormControl"
                placeholder="e.g., USDT"
                bidi={this.formData.symbol}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="Form-row">
            <div className="Form-group">
              <label>
                {app.translator.trans('withdrawal.admin.deposit.platforms.network')}
                <span className="Form-required">*</span>
              </label>
              <select
                className="FormControl"
                value={this.formData.network()}
                onchange={withAttr('value', this.formData.network)}
                disabled={submitting}
              >
                <option value="">Select Network</option>
                <option value="TRC20">TRC20 (TRON)</option>
                <option value="ERC20">ERC20 (Ethereum)</option>
                <option value="BSC">BSC (Binance Smart Chain)</option>
                <option value="POLYGON">POLYGON</option>
                <option value="ARBITRUM">ARBITRUM</option>
                <option value="OPTIMISM">OPTIMISM</option>
              </select>
            </div>
            <div className="Form-group">
              <label>
                {app.translator.trans('withdrawal.admin.deposit.platforms.min_amount')}
              </label>
              <input
                type="number"
                step="0.00000001"
                min="0"
                className="FormControl"
                placeholder="0.0"
                bidi={this.formData.minAmount}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="Form-row">
            <div className="Form-group">
              <label>
                {app.translator.trans('withdrawal.admin.deposit.platforms.max_amount')}
              </label>
              <input
                type="number"
                step="0.00000001"
                min="0"
                className="FormControl"
                placeholder="Leave empty for unlimited"
                bidi={this.formData.maxAmount}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="Form-group">
            <label>
              {app.translator.trans('withdrawal.admin.deposit.platforms.address')}
            </label>
            <input
              type="text"
              className="FormControl"
              placeholder="Static deposit address (optional)"
              bidi={this.formData.address}
              disabled={submitting}
            />
            <div className="helpText">
              {app.translator.trans('withdrawal.admin.deposit.platforms.address_help')}
            </div>
          </div>

          <div className="Form-group">
            <label>
              {app.translator.trans('withdrawal.admin.deposit.platforms.address_template')}
            </label>
            <input
              type="text"
              className="FormControl"
              placeholder="e.g., TSomeAddress{user_id}"
              bidi={this.formData.addressTemplate}
              disabled={submitting}
            />
            <div className="helpText">
              {app.translator.trans('withdrawal.admin.deposit.platforms.address_template_help')}
            </div>
          </div>

          <div className="Form-row">
            <div className="Form-group">
              <label>
                {app.translator.trans('withdrawal.admin.deposit.platforms.icon_url')}
              </label>
              <input
                type="url"
                className="FormControl"
                placeholder="https://example.com/icon.png"
                bidi={this.formData.iconUrl}
                disabled={submitting}
              />
            </div>
            <div className="Form-group">
              <label>
                {app.translator.trans('withdrawal.admin.deposit.platforms.icon_class')}
              </label>
              <input
                type="text"
                className="FormControl"
                placeholder="fas fa-coins"
                bidi={this.formData.iconClass}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="Form-group">
            <label>
              {app.translator.trans('withdrawal.admin.deposit.platforms.qr_template')}
            </label>
            <input
              type="text"
              className="FormControl"
              placeholder="{address} or tron:{address}?amount={amount}"
              bidi={this.formData.qrCodeTemplate}
              disabled={submitting}
            />
            <div className="helpText">
              {app.translator.trans('withdrawal.admin.deposit.platforms.qr_template_help')}
            </div>
          </div>

          <div className="Form-group">
            <label>
              {app.translator.trans('withdrawal.admin.deposit.platforms.warning_text')}
            </label>
            <textarea
              className="FormControl"
              rows={3}
              placeholder="Network-specific warning for users"
              bidi={this.formData.warningText}
              disabled={submitting}
            />
          </div>

          <div className="Form-group">
            <Switch state={this.formData.isActive()} onchange={this.formData.isActive} disabled={submitting}>
              {app.translator.trans('withdrawal.admin.deposit.platforms.is_active')}
            </Switch>
          </div>

          <div className="Form-actions">
            <Button
              className="Button Button--primary"
              type="submit"
              loading={submitting}
              onclick={this.handleSubmit.bind(this, vnode.attrs)}
            >
              {app.translator.trans('withdrawal.admin.deposit.platforms.add_button')}
            </Button>
            <Button
              className="Button"
              onclick={onCancel}
              disabled={submitting}
            >
              {app.translator.trans('core.admin.basics.cancel_button')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  private async handleSubmit(attrs: AddDepositPlatformFormAttrs): Promise<void> {
    // Basic validation
    if (!this.formData.name() || !this.formData.symbol() || !this.formData.network()) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.deposit.platforms.required_fields_error')
      );
      return;
    }

    if (!this.formData.address() && !this.formData.addressTemplate()) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.deposit.platforms.address_required_error')
      );
      return;
    }

    const formData: DepositPlatformFormData = {
      name: this.formData.name(),
      symbol: this.formData.symbol(),
      network: this.formData.network(),
      minAmount: this.formData.minAmount(),
      maxAmount: this.formData.maxAmount(),
      address: this.formData.address(),
      addressTemplate: this.formData.addressTemplate(),
      iconUrl: this.formData.iconUrl(),
      iconClass: this.formData.iconClass(),
      qrCodeTemplate: this.formData.qrCodeTemplate(),
      warningText: this.formData.warningText(),
      isActive: this.formData.isActive()
    };

    try {
      await attrs.onSubmit(formData);
      
      // Reset form
      Object.keys(this.formData).forEach(key => {
        if (key === 'isActive') {
          this.formData[key](true);
        } else {
          this.formData[key]('');
        }
      });

      attrs.onCancel();
    } catch (error) {
      // Error handling is done in parent component
      console.error('Form submission error:', error);
    }
  }
}