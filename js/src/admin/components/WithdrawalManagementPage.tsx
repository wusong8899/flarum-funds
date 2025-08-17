import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Stream from 'flarum/common/utils/Stream';
import humanTime from 'flarum/common/helpers/humanTime';
import type Mithril from 'mithril';

interface WithdrawalPlatform {
  id: number;
  attributes: {
    name: string;
    createdAt?: string;
    created_at?: string;
  };
}

interface WithdrawalRequest {
  id: number;
  attributes: {
    amount: number;
    accountDetails?: string;
    account_details?: string;
    status: string;
    createdAt?: string;
    created_at?: string;
  };
  relationships?: {
    user?: {
      data: { id: number };
    };
    platform?: {
      data: { id: number };
    };
  };
}

interface User {
  id: number;
  attributes: {
    displayName: string;
  };
}

export default class WithdrawalManagementPage extends ExtensionPage {
  private platforms: WithdrawalPlatform[] = [];
  private requests: WithdrawalRequest[] = [];
  private users: { [key: number]: User } = {};
  private loading = true;
  private newPlatformName = Stream('');
  private submittingPlatform = false;

  oninit(vnode: Mithril.VnodeDOM) {
    super.oninit(vnode);
    this.loadData();
  }

  content() {
    if (this.loading) {
      return <LoadingIndicator />;
    }

    return (
      <div className="WithdrawalManagementPage">
        <div className="container">
          <h2>{app.translator.trans('withdrawal.admin.page.title')}</h2>
          
          {this.renderSettings()}
          {this.renderPlatformManagement()}
          {this.renderRequestManagement()}
        </div>
      </div>
    );
  }

  private renderSettings(): Mithril.Children {
    return (
      <div className="WithdrawalManagementPage-section">
        <h3>{app.translator.trans('withdrawal.admin.settings.title')}</h3>
        <div className="Form">
          <div className="Form-group">
            <label>{app.translator.trans('withdrawal.admin.settings.min_amount')}</label>
            {this.buildSettingComponent({
              type: 'number',
              setting: 'withdrawal.min_amount',
              placeholder: '0'
            })}
          </div>
          
          <div className="Form-group">
            <label>{app.translator.trans('withdrawal.admin.settings.max_amount')}</label>
            {this.buildSettingComponent({
              type: 'number',
              setting: 'withdrawal.max_amount',
              placeholder: '10000'
            })}
          </div>
          
          <div className="Form-group">
            <label>{app.translator.trans('withdrawal.admin.settings.fee')}</label>
            {this.buildSettingComponent({
              type: 'number',
              setting: 'withdrawal.fee',
              placeholder: '0'
            })}
          </div>
          
          <div className="Form-group">
            {this.submitButton()}
          </div>
        </div>
      </div>
    );
  }

  private renderPlatformManagement(): Mithril.Children {
    return (
      <div className="WithdrawalManagementPage-section">
        <h3>{app.translator.trans('withdrawal.admin.platforms.title')}</h3>
        
        <div className="WithdrawalManagementPage-addPlatform">
          <div className="Form-group">
            <input
              type="text"
              className="FormControl"
              placeholder={app.translator.trans('withdrawal.admin.platforms.add_placeholder')}
              value={this.newPlatformName()}
              oninput={(e: Event) => this.newPlatformName((e.target as HTMLInputElement).value)}
            />
            <Button
              className="Button Button--primary"
              loading={this.submittingPlatform}
              disabled={!this.newPlatformName()}
              onclick={this.addPlatform.bind(this)}
            >
              {app.translator.trans('withdrawal.admin.platforms.add_button')}
            </Button>
          </div>
        </div>

        <div className="WithdrawalManagementPage-platformList">
          {this.platforms.length === 0 ? (
            <p>{app.translator.trans('withdrawal.admin.platforms.empty')}</p>
          ) : (
            this.platforms.map((platform) => this.renderPlatform(platform))
          )}
        </div>
      </div>
    );
  }

  private renderPlatform(platform: WithdrawalPlatform): Mithril.Children {
    const createdDate = platform.attributes?.createdAt || platform.attributes?.created_at;
    let dateDisplay = 'N/A';
    
    if (createdDate && createdDate !== null) {
      try {
        dateDisplay = humanTime(new Date(createdDate));
      } catch (e) {
        console.error('Error formatting date:', e);
        dateDisplay = 'Invalid Date';
      }
    }
    
    return (
      <div key={platform.id} className="WithdrawalPlatform">
        <span className="WithdrawalPlatform-name">{platform.attributes?.name || 'Unknown Platform'}</span>
        <span className="WithdrawalPlatform-date">{dateDisplay}</span>
        <Button
          className="Button Button--danger"
          onclick={() => this.deletePlatform(platform)}
        >
          {app.translator.trans('withdrawal.admin.platforms.delete')}
        </Button>
      </div>
    );
  }

  private renderRequestManagement(): Mithril.Children {
    const pendingRequests = this.requests.filter(r => r.attributes.status === 'pending');
    const processedRequests = this.requests.filter(r => r.attributes.status !== 'pending');

    return (
      <div className="WithdrawalManagementPage-section">
        <h3>{app.translator.trans('withdrawal.admin.requests.title')}</h3>
        
        <div className="WithdrawalManagementPage-pendingRequests">
          <h4>{app.translator.trans('withdrawal.admin.requests.pending_title')}</h4>
          {pendingRequests.length === 0 ? (
            <p>{app.translator.trans('withdrawal.admin.requests.no_pending')}</p>
          ) : (
            pendingRequests.map((request) => this.renderRequest(request, true))
          )}
        </div>

        <div className="WithdrawalManagementPage-processedRequests">
          <h4>{app.translator.trans('withdrawal.admin.requests.processed_title')}</h4>
          {processedRequests.length === 0 ? (
            <p>{app.translator.trans('withdrawal.admin.requests.no_processed')}</p>
          ) : (
            processedRequests.map((request) => this.renderRequest(request, false))
          )}
        </div>
      </div>
    );
  }

  private renderRequest(request: WithdrawalRequest, showActions: boolean): Mithril.Children {
    const userId = request.relationships?.user?.data?.id;
    const platformId = request.relationships?.platform?.data?.id;
    const user = userId ? this.users[userId] : null;
    const platform = platformId ? this.platforms.find(p => p.id == platformId) : null;
    const statusClass = `status-${request.attributes.status}`;
    const createdDate = request.attributes.createdAt || request.attributes.created_at;
    const accountDetails = request.attributes.accountDetails || request.attributes.account_details;
    
    let dateDisplay = 'N/A';
    if (createdDate && createdDate !== null) {
      try {
        dateDisplay = humanTime(new Date(createdDate));
      } catch (e) {
        console.error('Error formatting request date:', e);
        dateDisplay = 'Invalid Date';
      }
    }

    return (
      <div key={request.id} className={`WithdrawalRequest ${statusClass}`}>
        <div className="WithdrawalRequest-info">
          <div className="WithdrawalRequest-user">
            <strong>{user?.attributes?.displayName || 'Unknown User'}</strong>
          </div>
          <div className="WithdrawalRequest-details">
            <span className="amount">${request.attributes.amount}</span>
            <span className="platform">{platform?.attributes?.name || 'Unknown Platform'}</span>
            <span className="date">{dateDisplay}</span>
          </div>
          <div className="WithdrawalRequest-account">
            <strong>{app.translator.trans('withdrawal.admin.requests.account_details')}:</strong>
            <span>{accountDetails || 'N/A'}</span>
          </div>
          <div className="WithdrawalRequest-status">
            <span className={`Badge Badge--${request.attributes.status}`}>
              {app.translator.trans(`withdrawal.admin.requests.status.${request.attributes.status}`)}
            </span>
          </div>
        </div>
        
        {showActions && (
          <div className="WithdrawalRequest-actions">
            <Button
              className="Button Button--primary"
              onclick={() => this.updateRequestStatus(request, 'approved')}
            >
              {app.translator.trans('withdrawal.admin.requests.approve')}
            </Button>
            <Button
              className="Button Button--danger"
              onclick={() => this.updateRequestStatus(request, 'rejected')}
            >
              {app.translator.trans('withdrawal.admin.requests.reject')}
            </Button>
          </div>
        )}
      </div>
    );
  }

  private async addPlatform(): Promise<void> {
    if (!this.newPlatformName() || this.submittingPlatform) return;

    this.submittingPlatform = true;

    try {
      const platform = app.store.createRecord('withdrawal-platforms');
      platform.pushAttributes({
        name: this.newPlatformName()
      });
      
      await platform.save();
      
      this.newPlatformName('');
      await this.loadPlatforms();
      
      app.alerts.show({
        type: 'success',
        message: app.translator.trans('withdrawal.admin.platforms.add_success')
      });
    } catch (error) {
      console.error('Error adding platform:', error);
      app.alerts.show({
        type: 'error',
        message: app.translator.trans('withdrawal.admin.platforms.add_error')
      });
    } finally {
      this.submittingPlatform = false;
      m.redraw();
    }
  }

  private async deletePlatform(platform: WithdrawalPlatform): Promise<void> {
    if (!confirm(app.translator.trans('withdrawal.admin.platforms.delete_confirm', { name: platform.attributes.name }))) {
      return;
    }

    try {
      const record = app.store.getById('withdrawal-platforms', platform.id);
      if (record) {
        await record.delete();
        await this.loadPlatforms();
        
        app.alerts.show({
          type: 'success',
          message: app.translator.trans('withdrawal.admin.platforms.delete_success')
        });
      }
    } catch (error) {
      console.error('Error deleting platform:', error);
      app.alerts.show({
        type: 'error',
        message: app.translator.trans('withdrawal.admin.platforms.delete_error')
      });
    }
  }

  private async updateRequestStatus(request: WithdrawalRequest, status: string): Promise<void> {
    try {
      const record = app.store.getById('withdrawal-requests', request.id);
      if (record) {
        await record.save({ status });
        await this.loadRequests();
        
        app.alerts.show({
          type: 'success',
          message: app.translator.trans(`withdrawal.admin.requests.${status}_success`)
        });
      }
    } catch (error) {
      console.error('Error updating request:', error);
      app.alerts.show({
        type: 'error',
        message: app.translator.trans('withdrawal.admin.requests.update_error')
      });
    }
  }

  private async loadData(): Promise<void> {
    try {
      await Promise.all([
        this.loadPlatforms(),
        this.loadRequests()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.loading = false;
      m.redraw();
    }
  }

  private async loadPlatforms(): Promise<void> {
    try {
      const response = await app.store.find('withdrawal-platforms');
      this.platforms = Array.isArray(response) ? response.filter(p => p !== null) : (response ? [response] : []);
      
      console.log('Loaded platforms:', this.platforms);
    } catch (error) {
      console.error('Error loading platforms:', error);
      this.platforms = [];
    }
  }

  private async loadRequests(): Promise<void> {
    try {
      const response = await app.store.find('withdrawal-requests');
      this.requests = Array.isArray(response) ? response.filter(r => r !== null) : (response ? [response] : []);
      
      console.log('Loaded requests:', this.requests);
    } catch (error) {
      console.error('Error loading requests:', error);
      this.requests = [];
    }
    
    // Load user data for each request
    const userIds = [...new Set(this.requests.map(r => r.relationships.user.data.id))];
    const usersToLoad = userIds.filter(userId => !this.users[userId]);
    
    if (usersToLoad.length > 0) {
      try {
        const userPromises = usersToLoad.map(userId => 
          app.store.find('users', userId).catch(error => {
            console.error(`Error loading user ${userId}:`, error);
            return null;
          })
        );
        
        const loadedUsers = await Promise.all(userPromises);
        
        usersToLoad.forEach((userId, index) => {
          if (loadedUsers[index]) {
            this.users[userId] = loadedUsers[index];
          }
        });
      } catch (error) {
        console.error('Error loading users:', error);
      }
    }
  }
}