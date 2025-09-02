import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
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
  fee: string;
  address: string;
  qrCodeImageUrl: string;
  // Platform icon system
  platformIconUrl: string;
  platformIconClass: string;
  warningText: string;
  isActive: boolean;
}

export interface AddDepositPlatformFormAttrs {
  submitting: boolean;
  onSubmit: (formData: DepositPlatformFormData) => Promise<void>;
  onCancel?: () => void; // Optional since form is always visible
}

export default class AddDepositPlatformForm extends Component<AddDepositPlatformFormAttrs> {
  private formData = {
    name: Stream(''),
    symbol: Stream(''),
    network: Stream(''),
    minAmount: Stream(''),
    maxAmount: Stream(''),
    fee: Stream(''),
    address: Stream(''),
    qrCodeImageUrl: Stream(''),
    // Platform icon system
    platformIconUrl: Stream(''),
    platformIconClass: Stream(''),
    warningText: Stream(''),
    isActive: Stream(true)
  };

  oninit(vnode: Mithril.Vnode<AddDepositPlatformFormAttrs>) {
    super.oninit(vnode);
  }

  view(vnode: Mithril.Vnode<AddDepositPlatformFormAttrs>) {
    const { submitting } = vnode.attrs;

    return (
      <form 
        id="deposit-platform-form" 
        className="AddDepositPlatformForm"
        onsubmit={(e: Event) => this.handleSubmit(vnode.attrs, e)}
      >
        <div className="Form">
          <div className="Form-row">
            <div className="Form-group">
              <label>
                {app.translator.trans('funds.admin.deposit.platforms.name')}
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
                {app.translator.trans('funds.admin.deposit.platforms.symbol')}
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
                {app.translator.trans('funds.admin.deposit.platforms.network')}
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
                {app.translator.trans('funds.admin.deposit.platforms.min_amount')}
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
                {app.translator.trans('funds.admin.deposit.platforms.max_amount')}
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
            <div className="Form-group">
              <label>
                {app.translator.trans('funds.admin.deposit.platforms.fee')}
              </label>
              <input
                type="number"
                step="0.00000001"
                min="0"
                className="FormControl"
                placeholder="0.0"
                bidi={this.formData.fee}
                disabled={submitting}
              />
              <div className="helpText">
                {app.translator.trans('funds.admin.deposit.platforms.fee_help')}
              </div>
            </div>
          </div>

          <div className="Form-group">
            <label>
              {app.translator.trans('funds.admin.deposit.platforms.address')}
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
              {app.translator.trans('funds.admin.deposit.platforms.address_help')}
            </div>
          </div>

          <div className="Form-group">
            <label>
              {app.translator.trans('funds.admin.deposit.platforms.qr_code_image_url')}
            </label>
            <input
              type="url"
              className="FormControl"
              placeholder="https://example.com/qr-code.png"
              bidi={this.formData.qrCodeImageUrl}
              disabled={submitting}
            />
            <div className="helpText">
              {app.translator.trans('funds.admin.deposit.platforms.qr_code_image_help')}
            </div>
          </div>

          {/* Three-tier icon system */}
          <div className="Form-section">
            <h4>{app.translator.trans('funds.admin.platforms.platform_icon')}</h4>
            <p className="helpText">{app.translator.trans('funds.admin.platforms.platform_icon_help')}</p>
            
            <div className="Form-row">
              <div className="Form-group">
                <label>平台图标URL</label>
                <input
                  type="url"
                  className="FormControl"
                  placeholder="https://example.com/platform-icon.png"
                  bidi={this.formData.platformIconUrl}
                  disabled={submitting}
                />
                <div className="helpText">请输入平台图标的URL</div>
              </div>
              <div className="Form-group">
                <label>平台图标CSS类</label>
                <input
                  type="text"
                  className="FormControl"
                  placeholder="fab fa-bitcoin"
                  bidi={this.formData.platformIconClass}
                  disabled={submitting}
                />
                <div className="helpText">请输入平台图标的CSS类</div>
              </div>
            </div>
          </div>


          <div className="Form-group">
            <label>
              警告文本
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
              是否激活
            </Switch>
          </div>

        </div>
      </form>
    );
  }


  private validateForm(): boolean {
    const validator = new FormValidator();
    
    try {
      // Fixed: Convert NestedStringArray to string for FormValidator
      const nameLabel = app.translator.trans('funds.admin.deposit.platforms.name').toString();
      const symbolLabel = app.translator.trans('funds.admin.deposit.platforms.symbol').toString();
      const addressLabel = app.translator.trans('funds.admin.deposit.platforms.address').toString();
      
      validator
        .required(this.formData.name(), 'name', nameLabel)
        .required(this.formData.symbol(), 'symbol', symbolLabel)
        .required(this.formData.address(), 'address', addressLabel);

      // Optional numeric fields validation
      if (this.formData.minAmount() && this.formData.minAmount().trim()) {
        const minAmountLabel = app.translator.trans('funds.admin.deposit.platforms.min_amount').toString();
        validator.numberRange(this.formData.minAmount(), 0, undefined, 'minAmount', minAmountLabel);
      }
      
      if (this.formData.maxAmount() && this.formData.maxAmount().trim()) {
        const maxAmountLabel = app.translator.trans('funds.admin.deposit.platforms.max_amount').toString();
        validator.numberRange(this.formData.maxAmount(), 0, undefined, 'maxAmount', maxAmountLabel);
      }

      if (this.formData.fee() && this.formData.fee().trim()) {
        const feeLabel = app.translator.trans('funds.admin.deposit.platforms.fee').toString();
        validator.numberRange(this.formData.fee(), 0, undefined, 'fee', feeLabel);
      }

      // Custom validation for max >= min if both are provided
      if (this.formData.minAmount() && this.formData.maxAmount()) {
        const minVal = parseFloat(this.formData.minAmount());
        const maxVal = parseFloat(this.formData.maxAmount());
        if (!isNaN(minVal) && !isNaN(maxVal) && maxVal < minVal) {
          const errorMessage = app.translator.trans('funds.admin.platforms.max_min_error').toString();
          validator.custom(false, 'maxAmount', errorMessage);
        }
      }

      // Optional URL validations for three-tier icon system
      if (this.formData.platformIconUrl() && this.formData.platformIconUrl().trim()) {
        const platformIconUrlLabel = app.translator.trans('funds.admin.platforms.platform_icon_url').toString();
        validator.url(this.formData.platformIconUrl(), 'platformIconUrl', platformIconUrlLabel);
      }
      
      if (this.formData.qrCodeImageUrl() && this.formData.qrCodeImageUrl().trim()) {
        const qrCodeLabel = app.translator.trans('funds.admin.deposit.platforms.qr_code_image_url').toString();
        validator.url(this.formData.qrCodeImageUrl(), 'qrCodeImageUrl', qrCodeLabel);
      }

      const result = validator.getResult();
      
      if (!result.isValid && result.firstErrorMessage) {
        app.alerts.show({ type: 'error', dismissible: true }, result.firstErrorMessage);
      }

      return result.isValid;
    } catch (error) {
      console.error('Form validation error:', error);
      app.alerts.show({ type: 'error', dismissible: true }, 'Validation failed');
      return false;
    }
  }

  public clearForm(): void {
    this.formData.name('');
    this.formData.symbol('');
    this.formData.network('');
    this.formData.minAmount('');
    this.formData.maxAmount('');
    this.formData.fee('');
    this.formData.address('');
    this.formData.qrCodeImageUrl('');
    // Clear three-tier icon fields
    this.formData.platformIconUrl('');
    this.formData.platformIconClass('');
    this.formData.warningText('');
    this.formData.isActive(true);
  }

  private async handleSubmit(attrs: AddDepositPlatformFormAttrs, e: Event): Promise<void> {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    const formData: DepositPlatformFormData = {
      name: this.formData.name(),
      symbol: this.formData.symbol(),
      network: this.formData.network(),
      minAmount: this.formData.minAmount(),
      maxAmount: this.formData.maxAmount(),
      fee: this.formData.fee(),
      address: this.formData.address(),
      qrCodeImageUrl: this.formData.qrCodeImageUrl(),
      // Three-tier icon system
      platformIconUrl: this.formData.platformIconUrl(),
      platformIconClass: this.formData.platformIconClass(),
      warningText: this.formData.warningText(),
      isActive: this.formData.isActive()
    };

    try {
      await attrs.onSubmit(formData);
      // Clear form after successful submission
      this.clearForm();
    } catch (error) {
      // Error handling is done by parent component
      console.error('Form submission error:', error);
    }
  }
}