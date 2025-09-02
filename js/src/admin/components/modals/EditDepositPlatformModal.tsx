import app from 'flarum/admin/app';
import Modal, { IInternalModalAttrs } from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import Switch from 'flarum/common/components/Switch';
import Stream from 'flarum/common/utils/Stream';
import type Mithril from 'mithril';
import { DepositPlatform } from '../types/AdminTypes';
import { DepositPlatformFormData } from '../forms/AddDepositPlatformForm';
import { FormValidator } from '../../../common/utils/formValidators';
import m from 'mithril';

export interface EditDepositPlatformModalAttrs extends IInternalModalAttrs {
  platform: DepositPlatform;
  onEdit: (id: number, formData: DepositPlatformFormData) => Promise<void>;
}

export default class EditDepositPlatformModal extends Modal<EditDepositPlatformModalAttrs> {
  private formData = {
    name: Stream(''),
    symbol: Stream(''),
    network: Stream(''),
    minAmount: Stream(''),
    maxAmount: Stream(''),
    fee: Stream(''),
    address: Stream(''),
    qrCodeImageUrl: Stream(''),
    // Simplified platform icon system
    platformIconUrl: Stream(''),
    platformIconClass: Stream(''),
    warningText: Stream(''),
    isActive: Stream(true)
  };
  private submitting = false;

  className() {
    return 'EditDepositPlatformModal Modal--large';
  }

  title() {
    return app.translator.trans('funds.admin.deposit.platforms.edit_title');
  }

  oninit(vnode: Mithril.Vnode<EditDepositPlatformModalAttrs>) {
    super.oninit(vnode);
    this.populateForm();
  }

  private populateForm(): void {
    const { platform } = this.attrs;
    
    // Populate form fields with current platform data
    this.formData.name(platform.name || '');
    this.formData.symbol(platform.symbol || '');
    this.formData.network(platform.network || '');
    this.formData.minAmount(platform.minAmount?.toString() || '');
    this.formData.maxAmount(platform.maxAmount?.toString() || '');
    this.formData.fee(platform.fee?.toString() || '');
    this.formData.address(platform.address || '');
    this.formData.qrCodeImageUrl(platform.qrCodeImageUrl || '');
    // Use simplified icon system
    this.formData.platformIconUrl(platform.platformSpecificIconUrl || '');
    this.formData.platformIconClass(platform.platformSpecificIconClass || '');
    this.formData.warningText(platform.warningText || '');
    this.formData.isActive(platform.isActive ?? true);
  }

  content(): Mithril.Children {
    return (
      <div className="Modal-body">
        <form onsubmit={this.onsubmit.bind(this)}>
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
                  disabled={this.submitting}
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
                  disabled={this.submitting}
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
                  disabled={this.submitting}
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
                  disabled={this.submitting}
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
                  disabled={this.submitting}
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
                  disabled={this.submitting}
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
                disabled={this.submitting}
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
                disabled={this.submitting}
              />
              <div className="helpText">
                {app.translator.trans('funds.admin.deposit.platforms.qr_code_image_help')}
              </div>
            </div>

            {/* Simplified platform icon system */}
            <div className="Form-section">
              <h4>{app.translator.trans('funds.admin.platforms.platform_icon')}</h4>
              <p className="helpText">{app.translator.trans('funds.admin.platforms.platform_icon_help')}</p>
              
              <div className="Form-row">
                <div className="Form-group">
                  <label>{app.translator.trans('funds.admin.platforms.platform_icon_url')}</label>
                  <input
                    type="url"
                    className="FormControl"
                    placeholder="https://example.com/platform-icon.png"
                    bidi={this.formData.platformIconUrl}
                    disabled={this.submitting}
                  />
                  <div className="helpText">{app.translator.trans('funds.admin.platforms.platform_icon_url_help')}</div>
                </div>
                <div className="Form-group">
                  <label>{app.translator.trans('funds.admin.platforms.platform_icon_class')}</label>
                  <input
                    type="text"
                    className="FormControl"
                    placeholder="fab fa-bitcoin"
                    bidi={this.formData.platformIconClass}
                    disabled={this.submitting}
                  />
                  <div className="helpText">{app.translator.trans('funds.admin.platforms.platform_icon_class_help')}</div>
                </div>
              </div>
            </div>

            <div className="Form-group">
              <label>
                {app.translator.trans('funds.admin.deposit.platforms.warning_text')}
              </label>
              <textarea
                className="FormControl"
                rows={3}
                placeholder="Network-specific warning for users"
                bidi={this.formData.warningText}
                disabled={this.submitting}
              />
            </div>

            <div className="Form-group">
              <Switch 
                state={this.formData.isActive()} 
                onchange={this.formData.isActive} 
                disabled={this.submitting}
              >
                {app.translator.trans('funds.admin.deposit.platforms.is_active')}
              </Switch>
            </div>
            
            <div className="Form-group">
              <Button
                className="Button Button--primary"
                type="submit"
                loading={this.submitting}
                disabled={this.submitting}
              >
                {app.translator.trans('funds.admin.deposit.platforms.edit_button')}
              </Button>
              <Button
                className="Button Button--secondary"
                onclick={this.hide.bind(this)}
                disabled={this.submitting}
              >
                {app.translator.trans('core.admin.basics.cancel_button')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  onsubmit(e: Event): void {
    e.preventDefault();
    this.handleEdit();
  }

  private validateForm(): boolean {
    const validator = new FormValidator();
    
    try {
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

      // Optional URL validations for simplified icon system
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

  private async handleEdit(): Promise<void> {
    if (this.submitting) return;

    if (!this.validateForm()) return;

    this.submitting = true;
    
    const formData: DepositPlatformFormData = {
      name: this.formData.name(),
      symbol: this.formData.symbol(),
      network: this.formData.network(),
      minAmount: this.formData.minAmount(),
      maxAmount: this.formData.maxAmount(),
      fee: this.formData.fee(),
      address: this.formData.address(),
      qrCodeImageUrl: this.formData.qrCodeImageUrl(),
      // Simplified platform icon system
      platformIconUrl: this.formData.platformIconUrl(),
      platformIconClass: this.formData.platformIconClass(),
      warningText: this.formData.warningText(),
      isActive: this.formData.isActive()
    };

    try {
      await this.attrs.onEdit(this.attrs.platform.id, formData);
      this.hide();
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('funds.admin.deposit.platforms.edit_success')
      );
    } catch (error) {
      console.error('Edit deposit platform error:', error);
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('funds.admin.deposit.platforms.edit_error')
      );
    } finally {
      this.submitting = false;
      m.redraw();
    }
  }
}