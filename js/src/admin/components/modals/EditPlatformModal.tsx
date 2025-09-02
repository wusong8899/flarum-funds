import app from 'flarum/admin/app';
import Modal, { IInternalModalAttrs } from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';
import type Mithril from 'mithril';
import { WithdrawalPlatform } from '../types/AdminTypes';
import { FormValidator } from '../../../common/utils/formValidators';
import m from 'mithril';

export interface EditPlatformModalAttrs extends IInternalModalAttrs {
  platform: WithdrawalPlatform;
  onEditPlatform: (id: number, formData: any) => Promise<void>;
}

export default class EditPlatformModal extends Modal<EditPlatformModalAttrs> {
  private name = Stream('');
  private symbol = Stream('');
  private network = Stream('');
  private minAmount = Stream('');
  private maxAmount = Stream('');
  private fee = Stream('');
  private isActive = Stream(true);
  // Simplified platform icon system
  private platformIconUrl = Stream('');
  private platformIconClass = Stream('');
  private submitting = false;

  className() {
    return 'EditPlatformModal Modal--medium';
  }

  title() {
    return app.translator.trans('funds.admin.platforms.edit_title');
  }

  oninit(vnode: Mithril.Vnode<EditPlatformModalAttrs>) {
    super.oninit(vnode);
    this.populateForm();
  }

  private populateForm(): void {
    const { platform } = this.attrs;
    
    // Populate form fields with current platform data
    this.name(platform.name() || '');
    this.symbol(platform.symbol() || '');
    this.network(platform.network() || '');
    this.minAmount(platform.minAmount()?.toString() || '');
    this.maxAmount(platform.maxAmount()?.toString() || '');
    this.fee(platform.fee()?.toString() || '');
    this.isActive(platform.isActive() ?? true);
    // Use simplified icon system
    this.platformIconUrl(platform.platformIconUrl() || '');
    this.platformIconClass(platform.platformIconClass() || '');
  }

  content(): Mithril.Children {
    return (
      <div className="Modal-body">
        <div className="Form">
          <div className="Form-group">
            <div className="Form-row">
              <div className="Form-col">
                <label>{app.translator.trans('funds.admin.platforms.name')}</label>
                <input
                  type="text"
                  className="FormControl"
                  placeholder={app.translator.trans('funds.admin.platforms.add_placeholder')}
                  bidi={this.name}
                />
              </div>
              <div className="Form-col">
                <label>{app.translator.trans('funds.admin.platforms.symbol')}</label>
                <input
                  type="text"
                  className="FormControl"
                  placeholder="BTC, ETH, USDT..."
                  bidi={this.symbol}
                />
              </div>
              <div className="Form-col">
                <label>{app.translator.trans('funds.admin.platforms.network')}</label>
                <input
                  type="text"
                  className="FormControl"
                  placeholder="TRC20, ERC20, BSC... (optional)"
                  bidi={this.network}
                />
                <small className="helpText">{app.translator.trans('funds.admin.platforms.network_help')}</small>
              </div>
            </div>
            
            <div className="Form-row">
              <div className="Form-col">
                <label>{app.translator.trans('funds.admin.platforms.min_amount')}</label>
                <input
                  type="number"
                  step="0.00000001"
                  className="FormControl"
                  placeholder="0.001"
                  bidi={this.minAmount}
                />
              </div>
              <div className="Form-col">
                <label>{app.translator.trans('funds.admin.platforms.max_amount')}</label>
                <input
                  type="number"
                  step="0.00000001"
                  className="FormControl"
                  placeholder="10.0"
                  bidi={this.maxAmount}
                />
              </div>
              <div className="Form-col">
                <label>{app.translator.trans('funds.admin.platforms.fee')}</label>
                <input
                  type="number"
                  step="0.00000001"
                  className="FormControl"
                  placeholder="0.0005"
                  bidi={this.fee}
                />
              </div>
            </div>
            
            <div className="Form-row">
              <div className="Form-col">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={this.isActive()}
                    onchange={(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      this.isActive(target.checked);
                    }}
                  />
                  {app.translator.trans('funds.admin.platforms.is_active')}
                </label>
              </div>
            </div>
            
            {/* Simplified platform icon system */}
            <div className="Form-section">
              <h4>{app.translator.trans('funds.admin.platforms.platform_icon')}</h4>
              <p className="helpText">{app.translator.trans('funds.admin.platforms.platform_icon_help')}</p>
              
              <div className="Form-row">
                <div className="Form-col">
                  <label>{app.translator.trans('funds.admin.platforms.platform_icon_url')}</label>
                  <input
                    type="url"
                    className="FormControl"
                    placeholder="https://example.com/platform-icon.png"
                    bidi={this.platformIconUrl}
                  />
                  <small className="helpText">{app.translator.trans('funds.admin.platforms.platform_icon_url_help')}</small>
                </div>
                <div className="Form-col">
                  <label>{app.translator.trans('funds.admin.platforms.platform_icon_class')}</label>
                  <input
                    type="text"
                    className="FormControl"
                    placeholder="fab fa-bitcoin"
                    bidi={this.platformIconClass}
                  />
                  <small className="helpText">{app.translator.trans('funds.admin.platforms.platform_icon_class_help')}</small>
                </div>
              </div>
            </div>
            
            <div className="Form-group">
              <Button
                className="Button Button--primary"
                type="submit"
                loading={this.submitting}
                disabled={this.submitting}
              >
                {app.translator.trans('funds.admin.platforms.edit_button')}
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
        </div>
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
      const nameLabel = app.translator.trans('funds.admin.platforms.name').toString();
      const symbolLabel = app.translator.trans('funds.admin.platforms.symbol').toString();
      const minAmountLabel = app.translator.trans('funds.admin.platforms.min_amount').toString();
      const maxAmountLabel = app.translator.trans('funds.admin.platforms.max_amount').toString();
      const feeLabel = app.translator.trans('funds.admin.platforms.fee').toString();
      
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
        const errorMessage = app.translator.trans('funds.admin.platforms.max_min_error').toString();
        validator.custom(false, 'maxAmount', errorMessage);
      }

      // Optional URL validation for platform icon
      if (this.platformIconUrl() && this.platformIconUrl().trim()) {
        const platformIconUrlLabel = app.translator.trans('funds.admin.platforms.platform_icon_url').toString();
        validator.url(this.platformIconUrl(), 'platformIconUrl', platformIconUrlLabel);
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
    
    const formData = {
      name: this.name(),
      symbol: this.symbol(),
      network: this.network(),
      minAmount: this.minAmount(),
      maxAmount: this.maxAmount(),
      fee: this.fee(),
      isActive: this.isActive(),
      // Simplified platform icon system
      platformIconUrl: this.platformIconUrl(),
      platformIconClass: this.platformIconClass()
    };

    try {
      await this.attrs.onEditPlatform(this.attrs.platform.id(), formData);
      this.hide();
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('funds.admin.platforms.edit_success')
      );
    } catch (error) {
      console.error('Edit platform error:', error);
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('funds.admin.platforms.edit_error')
      );
    } finally {
      this.submitting = false;
      m.redraw();
    }
  }
}