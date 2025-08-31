import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';
import type Mithril from 'mithril';
import { PlatformFormData } from '../types/AdminTypes';
import { FormValidator } from '../../../common/utils/formValidators';
import m from 'mithril';

export interface AddPlatformFormAttrs {
  onSubmit: (formData: PlatformFormData) => Promise<void>;
  submitting: boolean;
}

export default class AddPlatformForm extends Component<AddPlatformFormAttrs> {
  private name = Stream('');
  private symbol = Stream('');
  private network = Stream('');
  private minAmount = Stream('');
  private maxAmount = Stream('');
  private fee = Stream('');
  // Three-tier icon system
  private currencyIconOverrideUrl = Stream('');
  private currencyIconOverrideClass = Stream('');
  private networkIconOverrideUrl = Stream('');
  private networkIconOverrideClass = Stream('');

  view(): Mithril.Children {
    return (
      <div className="WithdrawalManagementPage-addPlatform">
        <div className="Form-group">
          <div className="Form-row">
            <div className="Form-col">
              <label>{app.translator.trans('withdrawal.admin.platforms.name')}</label>
              <input
                type="text"
                className="FormControl"
                placeholder={app.translator.trans('withdrawal.admin.platforms.add_placeholder')}
                bidi={this.name}
              />
            </div>
            <div className="Form-col">
              <label>{app.translator.trans('withdrawal.admin.platforms.symbol')}</label>
              <input
                type="text"
                className="FormControl"
                placeholder="BTC, ETH, USDT..."
                bidi={this.symbol}
              />
            </div>
            <div className="Form-col">
              <label>{app.translator.trans('withdrawal.admin.platforms.network')}</label>
              <input
                type="text"
                className="FormControl"
                placeholder="TRC20, ERC20, BSC... (optional)"
                bidi={this.network}
              />
              <small className="helpText">{app.translator.trans('withdrawal.admin.platforms.network_help')}</small>
            </div>
          </div>
          
          <div className="Form-row">
            <div className="Form-col">
              <label>{app.translator.trans('withdrawal.admin.platforms.min_amount')}</label>
              <input
                type="number"
                step="0.00000001"
                className="FormControl"
                placeholder="0.001"
                bidi={this.minAmount}
              />
            </div>
            <div className="Form-col">
              <label>{app.translator.trans('withdrawal.admin.platforms.max_amount')}</label>
              <input
                type="number"
                step="0.00000001"
                className="FormControl"
                placeholder="10.0"
                bidi={this.maxAmount}
              />
            </div>
            <div className="Form-col">
              <label>{app.translator.trans('withdrawal.admin.platforms.fee')}</label>
              <input
                type="number"
                step="0.00000001"
                className="FormControl"
                placeholder="0.0005"
                bidi={this.fee}
              />
            </div>
          </div>
          
          {/* Three-tier icon system */}
          <div className="Form-section">
            <h4>{app.translator.trans('withdrawal.admin.platforms.icon_configuration')}</h4>
            <p className="helpText">{app.translator.trans('withdrawal.admin.platforms.icon_configuration_help')}</p>
            
            {/* Currency Icon Override */}
            <div className="Form-row">
              <div className="Form-col">
                <label>{app.translator.trans('withdrawal.admin.platforms.currency_icon_override_url')}</label>
                <input
                  type="url"
                  className="FormControl"
                  placeholder="https://example.com/currency-icon.png"
                  bidi={this.currencyIconOverrideUrl}
                />
                <small className="helpText">{app.translator.trans('withdrawal.admin.platforms.currency_icon_override_url_help')}</small>
              </div>
              <div className="Form-col">
                <label>{app.translator.trans('withdrawal.admin.platforms.currency_icon_override_class')}</label>
                <input
                  type="text"
                  className="FormControl"
                  placeholder="fab fa-bitcoin"
                  bidi={this.currencyIconOverrideClass}
                />
                <small className="helpText">{app.translator.trans('withdrawal.admin.platforms.currency_icon_override_class_help')}</small>
              </div>
            </div>
            
            {/* Network Icon Override */}
            <div className="Form-row">
              <div className="Form-col">
                <label>{app.translator.trans('withdrawal.admin.platforms.network_icon_override_url')}</label>
                <input
                  type="url"
                  className="FormControl"
                  placeholder="https://example.com/network-icon.png"
                  bidi={this.networkIconOverrideUrl}
                />
                <small className="helpText">{app.translator.trans('withdrawal.admin.platforms.network_icon_override_url_help')}</small>
              </div>
              <div className="Form-col">
                <label>{app.translator.trans('withdrawal.admin.platforms.network_icon_override_class')}</label>
                <input
                  type="text"
                  className="FormControl"
                  placeholder="fas fa-network-wired"
                  bidi={this.networkIconOverrideClass}
                />
                <small className="helpText">{app.translator.trans('withdrawal.admin.platforms.network_icon_override_class_help')}</small>
              </div>
            </div>
          </div>
          
          <div className="Form-group">
            <Button
              className="Button Button--primary"
              loading={this.attrs.submitting}
              disabled={this.attrs.submitting}
              onclick={this.handleSubmit.bind(this)}
            >
              {app.translator.trans('withdrawal.admin.platforms.add_button')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  private validateForm(): boolean {
    const validator = new FormValidator();
    
    try {
      // Fixed: Convert NestedStringArray to string for FormValidator
      const nameLabel = app.translator.trans('withdrawal.admin.platforms.name').toString();
      const symbolLabel = app.translator.trans('withdrawal.admin.platforms.symbol').toString();
      const minAmountLabel = app.translator.trans('withdrawal.admin.platforms.min_amount').toString();
      const maxAmountLabel = app.translator.trans('withdrawal.admin.platforms.max_amount').toString();
      const feeLabel = app.translator.trans('withdrawal.admin.platforms.fee').toString();
      
      validator
        .required(this.name(), 'name', nameLabel)
        .required(this.symbol(), 'symbol', symbolLabel)
        .numberRange(this.minAmount(), 0, undefined, 'minAmount', minAmountLabel)
        .numberRange(this.maxAmount(), 0, undefined, 'maxAmount', maxAmountLabel)
        .numberRange(this.fee(), 0, undefined, 'fee', feeLabel);

      // Custom validation for max >= min
      const minVal = parseFloat(this.minAmount());
      const maxVal = parseFloat(this.maxAmount());
      if (maxVal < minVal) {
        const errorMessage = app.translator.trans('withdrawal.admin.platforms.max_min_error').toString();
        validator.custom(false, 'maxAmount', errorMessage);
      }

      // Optional URL validations for three-tier icon system
      if (this.currencyIconOverrideUrl() && this.currencyIconOverrideUrl().trim()) {
        const currencyIconUrlLabel = app.translator.trans('withdrawal.admin.platforms.currency_icon_override_url').toString();
        validator.url(this.currencyIconOverrideUrl(), 'currencyIconOverrideUrl', currencyIconUrlLabel);
      }
      
      if (this.networkIconOverrideUrl() && this.networkIconOverrideUrl().trim()) {
        const networkIconUrlLabel = app.translator.trans('withdrawal.admin.platforms.network_icon_override_url').toString();
        validator.url(this.networkIconOverrideUrl(), 'networkIconOverrideUrl', networkIconUrlLabel);
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

  private async handleSubmit(): Promise<void> {
    if (this.attrs.submitting) return;

    if (!this.validateForm()) return;

    const formData: PlatformFormData = {
      name: this.name(),
      symbol: this.symbol(),
      network: this.network(),
      minAmount: this.minAmount(),
      maxAmount: this.maxAmount(),
      fee: this.fee(),
      // Three-tier icon system
      currencyIconOverrideUrl: this.currencyIconOverrideUrl(),
      currencyIconOverrideClass: this.currencyIconOverrideClass(),
      networkIconOverrideUrl: this.networkIconOverrideUrl(),
      networkIconOverrideClass: this.networkIconOverrideClass()
    };

    try {
      await this.attrs.onSubmit(formData);
      this.clearForm();
    } catch {
      // Error handling is done in parent component
    }
  }

  private clearForm(): void {
    this.name('');
    this.symbol('');
    this.network('');
    this.minAmount('');
    this.maxAmount('');
    this.fee('');
    // Clear three-tier icon fields
    this.currencyIconOverrideUrl('');
    this.currencyIconOverrideClass('');
    this.networkIconOverrideUrl('');
    this.networkIconOverrideClass('');
    m.redraw();
  }
}