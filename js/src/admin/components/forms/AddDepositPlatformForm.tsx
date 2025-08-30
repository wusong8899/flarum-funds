import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Switch from 'flarum/common/components/Switch';
import Stream from 'flarum/common/utils/Stream';
import type Mithril from 'mithril';
import { FormValidator } from '../../../common/utils/formValidators';

export interface DepositPlatformFormData {
  name: string;
  symbol: string;
  network: string;
  minAmount: string;
  maxAmount: string;
  address: string;
  qrCodeImageUrl: string;
  iconUrl: string;
  iconClass: string;
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
    qrCodeImageUrl: Stream(''),
    iconUrl: Stream(''),
    iconClass: Stream(''),
    warningText: Stream(''),
    isActive: Stream(true)
  };

  oninit(vnode: Mithril.Vnode<AddDepositPlatformFormAttrs>) {
    super.oninit(vnode);
  }

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
              </label>
              <input
                type="text"
                className="FormControl"
                placeholder="e.g., TRC20, ERC20, BSC (optional)"
                bidi={this.formData.network}
                disabled={submitting}
              />
              <div className="helpText">
                Optional. Specify the blockchain network for this platform.
              </div>
            </div>
          </div>
          <div className="Form-row">
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
              <span className="Form-required">*</span>
            </label>
            <input
              type="text"
              className="FormControl"
              placeholder="Enter deposit address for this platform"
              bidi={this.formData.address}
              disabled={submitting}
            />
            <div className="helpText">
              {app.translator.trans('withdrawal.admin.deposit.platforms.address_help')}
            </div>
          </div>

          <div className="Form-group">
            <label>
              {app.translator.trans('withdrawal.admin.deposit.platforms.qr_code_image_url')}
            </label>
            <input
              type="url"
              className="FormControl"
              placeholder="https://example.com/qr-code.png"
              bidi={this.formData.qrCodeImageUrl}
              disabled={submitting}
            />
            <div className="helpText">
              {app.translator.trans('withdrawal.admin.deposit.platforms.qr_code_image_help')}
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


  private validateForm(): boolean {
    const validator = new FormValidator();
    
    try {
      validator
        .required(this.formData.name(), 'name', app.translator.trans('withdrawal.admin.deposit.platforms.name'))
        .required(this.formData.symbol(), 'symbol', app.translator.trans('withdrawal.admin.deposit.platforms.symbol'))
        .required(this.formData.address(), 'address', app.translator.trans('withdrawal.admin.deposit.platforms.address'));

      // Optional numeric fields validation
      if (this.formData.minAmount() && this.formData.minAmount().trim()) {
        validator.numberRange(this.formData.minAmount(), 0, undefined, 'minAmount', app.translator.trans('withdrawal.admin.deposit.platforms.min_amount'));
      }
      
      if (this.formData.maxAmount() && this.formData.maxAmount().trim()) {
        validator.numberRange(this.formData.maxAmount(), 0, undefined, 'maxAmount', app.translator.trans('withdrawal.admin.deposit.platforms.max_amount'));
      }

      // Custom validation for max >= min if both are provided
      if (this.formData.minAmount() && this.formData.maxAmount()) {
        const minVal = parseFloat(this.formData.minAmount());
        const maxVal = parseFloat(this.formData.maxAmount());
        if (!isNaN(minVal) && !isNaN(maxVal) && maxVal < minVal) {
          validator.custom(false, 'maxAmount', app.translator.trans('withdrawal.admin.platforms.max_min_error'));
        }
      }

      // Optional URL validations
      if (this.formData.iconUrl() && this.formData.iconUrl().trim()) {
        validator.url(this.formData.iconUrl(), 'iconUrl', app.translator.trans('withdrawal.admin.deposit.platforms.icon_url'));
      }
      
      if (this.formData.qrCodeImageUrl() && this.formData.qrCodeImageUrl().trim()) {
        validator.url(this.formData.qrCodeImageUrl(), 'qrCodeImageUrl', app.translator.trans('withdrawal.admin.deposit.platforms.qr_code_image_url'));
      }

      const result = validator.getResult();
      
      if (!result.isValid && result.firstErrorMessage) {
        app.alerts.show({ type: 'error', dismissible: true }, result.firstErrorMessage);
      }

      return result.isValid;
    } catch (error) {
      if (error instanceof Error) {
        app.alerts.show({ type: 'error', dismissible: true }, error.message);
      }
      return false;
    }
  }

  private async handleSubmit(attrs: AddDepositPlatformFormAttrs): Promise<void> {
    if (attrs.submitting) return;

    if (!this.validateForm()) return;

    const formData: DepositPlatformFormData = {
      name: this.formData.name(),
      symbol: this.formData.symbol(),
      network: this.formData.network(),
      minAmount: this.formData.minAmount(),
      maxAmount: this.formData.maxAmount(),
      address: this.formData.address(),
      qrCodeImageUrl: this.formData.qrCodeImageUrl(),
      iconUrl: this.formData.iconUrl(),
      iconClass: this.formData.iconClass(),
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