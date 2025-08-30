import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';
import type Mithril from 'mithril';
import { PlatformFormData } from '../types/AdminTypes';
import m from 'mithril';

export interface AddPlatformFormAttrs {
  onSubmit: (formData: PlatformFormData) => Promise<void>;
  submitting: boolean;
}

export default class AddPlatformForm extends Component<AddPlatformFormAttrs> {
  private name = Stream('');
  private symbol = Stream('');
  private minAmount = Stream('');
  private maxAmount = Stream('');
  private fee = Stream('');
  private iconUrl = Stream('');
  private iconClass = Stream('');

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
          
          <div className="Form-row">
            <div className="Form-col">
              <label>{app.translator.trans('withdrawal.admin.platforms.icon_url')}</label>
              <input
                type="url"
                className="FormControl"
                placeholder="https://example.com/icon.png"
                bidi={this.iconUrl}
              />
              <small className="helpText">{app.translator.trans('withdrawal.admin.platforms.icon_url_help')}</small>
            </div>
            <div className="Form-col">
              <label>{app.translator.trans('withdrawal.admin.platforms.icon_class')}</label>
              <input
                type="text"
                className="FormControl"
                placeholder="fas fa-coins"
                bidi={this.iconClass}
              />
              <small className="helpText">{app.translator.trans('withdrawal.admin.platforms.icon_class_help')}</small>
            </div>
          </div>
          
          <div className="Form-group">
            <Button
              className="Button Button--primary"
              loading={this.attrs.submitting}
              disabled={!this.canSubmit()}
              onclick={this.handleSubmit.bind(this)}
            >
              {app.translator.trans('withdrawal.admin.platforms.add_button')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  private canSubmit(): boolean {
    return !!(
      this.name() &&
      this.name().trim() &&
      this.symbol() &&
      this.symbol().trim() &&
      this.minAmount() &&
      this.maxAmount() &&
      parseFloat(this.minAmount()) > 0 &&
      parseFloat(this.maxAmount()) > 0 &&
      parseFloat(this.maxAmount()) >= parseFloat(this.minAmount())
    );
  }

  private async handleSubmit(): Promise<void> {
    if (!this.canSubmit() || this.attrs.submitting) return;

    const formData: PlatformFormData = {
      name: this.name(),
      symbol: this.symbol(),
      minAmount: this.minAmount(),
      maxAmount: this.maxAmount(),
      fee: this.fee(),
      iconUrl: this.iconUrl(),
      iconClass: this.iconClass()
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
    this.minAmount('');
    this.maxAmount('');
    this.fee('');
    this.iconUrl('');
    this.iconClass('');
    m.redraw();
  }
}