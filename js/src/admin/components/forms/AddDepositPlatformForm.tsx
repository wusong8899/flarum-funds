import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Switch from 'flarum/common/components/Switch';
import Stream from 'flarum/common/utils/Stream';
import withAttr from 'flarum/common/utils/withAttr';
import m from 'mithril';
import type Mithril from 'mithril';
import NetworkType from '../../../common/models/NetworkType';

export interface DepositPlatformFormData {
  name: string;
  symbol: string;
  network: string;
  networkTypeId: number | null;
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
    networkTypeId: Stream<number | null>(null),
    minAmount: Stream(''),
    maxAmount: Stream(''),
    address: Stream(''),
    qrCodeImageUrl: Stream(''),
    iconUrl: Stream(''),
    iconClass: Stream(''),
    warningText: Stream(''),
    isActive: Stream(true)
  };
  
  private networkTypes: NetworkType[] = [];
  private loadingNetworkTypes = false;

  oninit(vnode: Mithril.Vnode<AddDepositPlatformFormAttrs>) {
    super.oninit(vnode);
    this.loadNetworkTypes();
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
              <select
                className="FormControl"
                value={this.formData.networkTypeId() || ''}
                onchange={withAttr('value', (value: string) => {
                  const networkTypeId = value ? parseInt(value) : null;
                  this.formData.networkTypeId(networkTypeId);
                  
                  // Auto-fill network field based on selected network type
                  if (networkTypeId) {
                    const networkType = this.networkTypes.find(nt => nt.id() === networkTypeId);
                    if (networkType) {
                      this.formData.network(networkType.code());
                    }
                  } else {
                    this.formData.network('');
                  }
                })}
                disabled={submitting || this.loadingNetworkTypes}
              >
                <option value="">{this.loadingNetworkTypes ? 'Loading...' : 'Select Network (Optional)'}</option>
                {this.networkTypes.map(networkType => (
                  <option key={networkType.id()} value={networkType.id()}>
                    {networkType.name()}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="Form-group">
              <label>
                {app.translator.trans('withdrawal.admin.deposit.platforms.custom_network')}
              </label>
              <input
                type="text"
                className="FormControl"
                placeholder="Custom network name (if not using predefined)"
                bidi={this.formData.network}
                disabled={submitting}
              />
              <div className="helpText">
                Leave empty to use the selected network type above, or enter a custom network name.
              </div>
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

  private async loadNetworkTypes(): Promise<void> {
    this.loadingNetworkTypes = true;
    m.redraw();

    try {
      const response = await app.request({
        method: 'GET',
        url: app.forum.attribute('apiUrl') + '/network-types?filter[is_active]=1',
      });

      app.store.pushPayload(response);
      this.networkTypes = app.store.all('network-types') as NetworkType[];
    } catch (error) {
      console.error('Failed to load network types:', error);
    } finally {
      this.loadingNetworkTypes = false;
      m.redraw();
    }
  }

  private async handleSubmit(attrs: AddDepositPlatformFormAttrs): Promise<void> {
    // Basic validation
    if (!this.formData.name() || !this.formData.symbol()) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.deposit.platforms.required_fields_error')
      );
      return;
    }

    if (!this.formData.address()) {
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
      networkTypeId: this.formData.networkTypeId(),
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
        } else if (key === 'networkTypeId') {
          this.formData[key](null);
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