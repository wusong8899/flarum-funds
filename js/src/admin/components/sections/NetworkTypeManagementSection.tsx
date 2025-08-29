import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import type Mithril from 'mithril';
import NetworkType from '../../../common/models/NetworkType';
import NetworkTypeListItem from '../items/NetworkTypeListItem';
import AddNetworkTypeForm from '../forms/AddNetworkTypeForm';

interface NetworkTypeManagementSectionAttrs {}

export default class NetworkTypeManagementSection extends Component<NetworkTypeManagementSectionAttrs> {
  private networkTypes: NetworkType[] = [];
  private loading = false;
  private showAddForm = false;

  oninit(vnode: Mithril.Vnode<NetworkTypeManagementSectionAttrs>) {
    super.oninit(vnode);
    this.loadNetworkTypes();
  }

  view(): Mithril.Children {
    return (
      <div className="NetworkTypeManagementSection">
        <div className="section-header">
          <h3>{app.translator.trans('withdrawal.admin.network_types.title')}</h3>
          <Button
            className="Button Button--primary"
            icon="fas fa-plus"
            onclick={() => this.toggleAddForm()}
          >
            {app.translator.trans('withdrawal.admin.network_types.add_button')}
          </Button>
        </div>

        {this.showAddForm && (
          <div className="section-content">
            <AddNetworkTypeForm
              submitting={this.loading}
              onSubmit={this.handleAddNetworkType.bind(this)}
              onCancel={() => this.toggleAddForm()}
            />
          </div>
        )}

        <div className="section-content">
          {this.loading && !this.networkTypes.length ? (
            <LoadingIndicator />
          ) : this.networkTypes.length === 0 ? (
            <div className="empty-state">
              <p>{app.translator.trans('withdrawal.admin.network_types.empty')}</p>
            </div>
          ) : (
            <div className="network-types-list">
              {this.networkTypes.map((networkType) => (
                <NetworkTypeListItem
                  key={networkType.id()}
                  networkType={networkType}
                  onUpdate={this.handleUpdateNetworkType.bind(this)}
                  onDelete={this.handleDeleteNetworkType.bind(this)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  private toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    m.redraw();
  }

  private async loadNetworkTypes(): Promise<void> {
    this.loading = true;
    m.redraw();

    try {
      const response = await app.request({
        method: 'GET',
        url: app.forum.attribute('apiUrl') + '/network-types',
      });

      app.store.pushPayload(response);
      this.networkTypes = app.store.all('network-types') as NetworkType[];
    } catch (error) {
      console.error('Failed to load network types:', error);
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.network_types.load_error')
      );
    } finally {
      this.loading = false;
      m.redraw();
    }
  }

  private async handleAddNetworkType(formData: any): Promise<void> {
    this.loading = true;
    m.redraw();

    try {
      const response = await app.request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/network-types',
        body: {
          data: {
            type: 'network-types',
            attributes: formData
          }
        }
      });

      app.store.pushPayload(response);
      this.networkTypes = app.store.all('network-types') as NetworkType[];
      this.showAddForm = false;

      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('withdrawal.admin.network_types.created')
      );
    } catch (error) {
      console.error('Failed to create network type:', error);
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.network_types.create_error')
      );
      throw error;
    } finally {
      this.loading = false;
      m.redraw();
    }
  }

  private async handleUpdateNetworkType(networkType: NetworkType, data: any): Promise<void> {
    try {
      const response = await app.request({
        method: 'PATCH',
        url: app.forum.attribute('apiUrl') + '/network-types/' + networkType.id(),
        body: {
          data: {
            type: 'network-types',
            id: networkType.id(),
            attributes: data
          }
        }
      });

      app.store.pushPayload(response);
      m.redraw();

      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('withdrawal.admin.network_types.updated')
      );
    } catch (error) {
      console.error('Failed to update network type:', error);
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.network_types.update_error')
      );
    }
  }

  private async handleDeleteNetworkType(networkType: NetworkType): Promise<void> {
    if (!confirm(app.translator.trans('withdrawal.admin.network_types.delete_confirm'))) {
      return;
    }

    try {
      await app.request({
        method: 'DELETE',
        url: app.forum.attribute('apiUrl') + '/network-types/' + networkType.id()
      });

      // Remove from store and local array
      this.networkTypes = this.networkTypes.filter(nt => nt.id() !== networkType.id());
      app.store.remove(networkType);

      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('withdrawal.admin.network_types.deleted')
      );
    } catch (error) {
      console.error('Failed to delete network type:', error);
      
      let errorMessage = app.translator.trans('withdrawal.admin.network_types.delete_error');
      if (error.responseJSON?.errors?.[0]?.detail) {
        errorMessage = error.responseJSON.errors[0].detail;
      }

      app.alerts.show(
        { type: 'error', dismissible: true },
        errorMessage
      );
    } finally {
      m.redraw();
    }
  }
}