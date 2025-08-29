import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Switch from 'flarum/common/components/Switch';
import Stream from 'flarum/common/utils/Stream';
import type Mithril from 'mithril';

export interface NetworkTypeFormData {
  name: string;
  code: string;
  description: string;
  iconUrl: string;
  iconClass: string;
  isActive: boolean;
  sortOrder: number;
}

export interface AddNetworkTypeFormAttrs {
  submitting: boolean;
  onSubmit: (formData: NetworkTypeFormData) => Promise<void>;
  onCancel: () => void;
}

export default class AddNetworkTypeForm extends Component<AddNetworkTypeFormAttrs> {
  private formData = {
    name: Stream(''),
    code: Stream(''),
    description: Stream(''),
    iconUrl: Stream(''),
    iconClass: Stream(''),
    isActive: Stream(true),
    sortOrder: Stream('0')
  };

  view(vnode: Mithril.Vnode<AddNetworkTypeFormAttrs>) {
    const { submitting, onCancel } = vnode.attrs;

    return (
      <div className="AddNetworkTypeForm">
        <div className="Form">
          <div className="Form-row">
            <div className="Form-group">
              <label>
                {app.translator.trans('withdrawal.admin.network_types.name')}
                <span className="Form-required">*</span>
              </label>
              <input
                type="text"
                className="FormControl"
                placeholder="e.g., TRON (TRC20)"
                bidi={this.formData.name}
                disabled={submitting}
              />
            </div>
            <div className="Form-group">
              <label>
                {app.translator.trans('withdrawal.admin.network_types.code')}
                <span className="Form-required">*</span>
              </label>
              <input
                type="text"
                className="FormControl"
                placeholder="e.g., TRC20"
                bidi={this.formData.code}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="Form-group">
            <label>
              {app.translator.trans('withdrawal.admin.network_types.description')}
            </label>
            <textarea
              className="FormControl"
              rows={3}
              placeholder="Optional description of the network"
              bidi={this.formData.description}
              disabled={submitting}
            />
          </div>

          <div className="Form-row">
            <div className="Form-group">
              <label>
                {app.translator.trans('withdrawal.admin.network_types.icon_url')}
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
                {app.translator.trans('withdrawal.admin.network_types.icon_class')}
              </label>
              <input
                type="text"
                className="FormControl"
                placeholder="fab fa-tron"
                bidi={this.formData.iconClass}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="Form-group">
            <label>
              {app.translator.trans('withdrawal.admin.network_types.sort_order')}
            </label>
            <input
              type="number"
              min="0"
              className="FormControl"
              placeholder="0"
              bidi={this.formData.sortOrder}
              disabled={submitting}
            />
          </div>

          <div className="Form-group">
            <Switch state={this.formData.isActive()} onchange={this.formData.isActive} disabled={submitting}>
              {app.translator.trans('withdrawal.admin.network_types.is_active')}
            </Switch>
          </div>

          <div className="Form-actions">
            <Button
              className="Button Button--primary"
              type="submit"
              loading={submitting}
              onclick={this.handleSubmit.bind(this, vnode.attrs)}
            >
              {app.translator.trans('withdrawal.admin.network_types.add_button')}
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

  private async handleSubmit(attrs: AddNetworkTypeFormAttrs): Promise<void> {
    // Basic validation
    if (!this.formData.name() || !this.formData.code()) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.network_types.required_fields_error')
      );
      return;
    }

    const formData: NetworkTypeFormData = {
      name: this.formData.name(),
      code: this.formData.code().toUpperCase(),
      description: this.formData.description(),
      iconUrl: this.formData.iconUrl(),
      iconClass: this.formData.iconClass(),
      isActive: this.formData.isActive(),
      sortOrder: parseInt(this.formData.sortOrder()) || 0
    };

    try {
      await attrs.onSubmit(formData);
      
      // Reset form
      Object.keys(this.formData).forEach(key => {
        if (key === 'isActive') {
          this.formData[key](true);
        } else if (key === 'sortOrder') {
          this.formData[key]('0');
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