import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Switch from 'flarum/common/components/Switch';
import Stream from 'flarum/common/utils/Stream';
import m from 'mithril';
import type Mithril from 'mithril';
import NetworkType from '../../../common/models/NetworkType';

export interface NetworkTypeListItemAttrs {
  networkType: NetworkType;
  onUpdate: (networkType: NetworkType, data: any) => Promise<void>;
  onDelete: (networkType: NetworkType) => Promise<void>;
}

export default class NetworkTypeListItem extends Component<NetworkTypeListItemAttrs> {
  private editing = false;
  private submitting = false;
  private formData: Record<string, Stream<any>> = {};

  oninit(vnode: Mithril.Vnode<NetworkTypeListItemAttrs>) {
    super.oninit(vnode);
    this.initFormData(vnode.attrs.networkType);
  }

  view(vnode: Mithril.Vnode<NetworkTypeListItemAttrs>) {
    const { networkType } = vnode.attrs;

    return (
      <div className="NetworkTypeListItem">
        <div className="item-header">
          <div className="item-info">
            <div className="item-icon">
              {networkType.iconClass() ? (
                <i className={networkType.iconClass()}></i>
              ) : networkType.iconUrl() ? (
                <img src={networkType.iconUrl()} alt={networkType.name()} style="width: 24px; height: 24px;" />
              ) : (
                <i className="fas fa-network-wired"></i>
              )}
            </div>
            <div className="item-details">
              <h4>{networkType.name()}</h4>
              <span className="code">{networkType.code()}</span>
              {networkType.description() && (
                <p className="description">{networkType.description()}</p>
              )}
            </div>
          </div>
          <div className="item-actions">
            <Button
              className="Button Button--link"
              icon="fas fa-edit"
              onclick={() => this.toggleEdit()}
              disabled={this.submitting}
            >
              {this.editing ? app.translator.trans('core.admin.basics.cancel_button') : app.translator.trans('core.admin.edit')}
            </Button>
            <Button
              className="Button Button--link text-danger"
              icon="fas fa-trash"
              onclick={() => vnode.attrs.onDelete(networkType)}
              disabled={this.submitting}
            >
              {app.translator.trans('core.admin.delete')}
            </Button>
          </div>
        </div>

        {this.editing && (
          <div className="item-edit-form">
            <div className="Form">
              <div className="Form-row">
                <div className="Form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    className="FormControl"
                    bidi={this.formData.name}
                    disabled={this.submitting}
                  />
                </div>
                <div className="Form-group">
                  <label>Code</label>
                  <input
                    type="text"
                    className="FormControl"
                    bidi={this.formData.code}
                    disabled={this.submitting}
                  />
                </div>
              </div>

              <div className="Form-group">
                <label>Description</label>
                <textarea
                  className="FormControl"
                  rows={2}
                  bidi={this.formData.description}
                  disabled={this.submitting}
                />
              </div>

              <div className="Form-row">
                <div className="Form-group">
                  <label>Icon URL</label>
                  <input
                    type="url"
                    className="FormControl"
                    bidi={this.formData.iconUrl}
                    disabled={this.submitting}
                  />
                </div>
                <div className="Form-group">
                  <label>Icon Class</label>
                  <input
                    type="text"
                    className="FormControl"
                    bidi={this.formData.iconClass}
                    disabled={this.submitting}
                  />
                </div>
              </div>

              <div className="Form-group">
                <label>Sort Order</label>
                <input
                  type="number"
                  min="0"
                  className="FormControl"
                  bidi={this.formData.sortOrder}
                  disabled={this.submitting}
                />
              </div>

              <div className="Form-group">
                <Switch state={this.formData.isActive()} onchange={this.formData.isActive} disabled={this.submitting}>
                  Active
                </Switch>
              </div>

              <div className="Form-actions">
                <Button
                  className="Button Button--primary"
                  loading={this.submitting}
                  onclick={this.handleSave.bind(this, vnode.attrs)}
                >
                  {app.translator.trans('core.admin.basics.save_changes_button')}
                </Button>
                <Button
                  className="Button"
                  onclick={() => this.toggleEdit()}
                  disabled={this.submitting}
                >
                  {app.translator.trans('core.admin.basics.cancel_button')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  private initFormData(networkType: NetworkType): void {
    this.formData = {
      name: Stream(networkType.name() || ''),
      code: Stream(networkType.code() || ''),
      description: Stream(networkType.description() || ''),
      iconUrl: Stream(networkType.iconUrl() || ''),
      iconClass: Stream(networkType.iconClass() || ''),
      isActive: Stream(networkType.isActive() ?? true),
      sortOrder: Stream(String(networkType.sortOrder() || 0))
    };
  }

  private toggleEdit(): void {
    this.editing = !this.editing;
    if (!this.editing) {
      // Reset form data when cancelling
      this.initFormData(this.attrs.networkType);
    }
    m.redraw();
  }

  private async handleSave(attrs: NetworkTypeListItemAttrs): Promise<void> {
    this.submitting = true;
    m.redraw();

    const data = {
      name: this.formData.name(),
      code: this.formData.code().toUpperCase(),
      description: this.formData.description() || null,
      iconUrl: this.formData.iconUrl() || null,
      iconClass: this.formData.iconClass() || null,
      isActive: this.formData.isActive(),
      sortOrder: parseInt(this.formData.sortOrder()) || 0
    };

    try {
      await attrs.onUpdate(attrs.networkType, data);
      this.editing = false;
    } catch {
      // Error handling is done in parent
    } finally {
      this.submitting = false;
      m.redraw();
    }
  }
}