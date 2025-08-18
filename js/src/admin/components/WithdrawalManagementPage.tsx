import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Stream from 'flarum/common/utils/Stream';
import humanTime from 'flarum/common/helpers/humanTime';
import Modal from 'flarum/common/components/Modal';
import type Mithril from 'mithril';

interface WithdrawalPlatform {
  id: number;
  attributes: {
    name: string;
    symbol?: string;
    minAmount?: number;
    maxAmount?: number;
    fee?: number;
    iconUrl?: string;
    iconClass?: string;
    isActive?: boolean;
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
  private newPlatformSymbol = Stream('');
  private newPlatformMinAmount = Stream('');
  private newPlatformMaxAmount = Stream('');
  private newPlatformFee = Stream('');
  private newPlatformIconUrl = Stream('');
  private newPlatformIconClass = Stream('');
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
          
          {this.renderPlatformManagement()}
          {this.renderRequestManagement()}
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
            <div className="Form-row">
              <div className="Form-col">
                <label>{app.translator.trans('withdrawal.admin.platforms.name')}</label>
                <input
                  type="text"
                  className="FormControl"
                  placeholder={app.translator.trans('withdrawal.admin.platforms.add_placeholder')}
                  value={this.newPlatformName()}
                  oninput={(e: Event) => this.newPlatformName((e.target as HTMLInputElement).value)}
                />
              </div>
              <div className="Form-col">
                <label>{app.translator.trans('withdrawal.admin.platforms.symbol')}</label>
                <input
                  type="text"
                  className="FormControl"
                  placeholder="BTC, ETH, USDT..."
                  value={this.newPlatformSymbol()}
                  oninput={(e: Event) => this.newPlatformSymbol((e.target as HTMLInputElement).value)}
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
                  value={this.newPlatformMinAmount()}
                  oninput={(e: Event) => this.newPlatformMinAmount((e.target as HTMLInputElement).value)}
                />
              </div>
              <div className="Form-col">
                <label>{app.translator.trans('withdrawal.admin.platforms.max_amount')}</label>
                <input
                  type="number"
                  step="0.00000001"
                  className="FormControl"
                  placeholder="10.0"
                  value={this.newPlatformMaxAmount()}
                  oninput={(e: Event) => this.newPlatformMaxAmount((e.target as HTMLInputElement).value)}
                />
              </div>
              <div className="Form-col">
                <label>{app.translator.trans('withdrawal.admin.platforms.fee')}</label>
                <input
                  type="number"
                  step="0.00000001"
                  className="FormControl"
                  placeholder="0.0005"
                  value={this.newPlatformFee()}
                  oninput={(e: Event) => this.newPlatformFee((e.target as HTMLInputElement).value)}
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
                  value={this.newPlatformIconUrl()}
                  oninput={(e: Event) => this.newPlatformIconUrl((e.target as HTMLInputElement).value)}
                />
                <small className="helpText">{app.translator.trans('withdrawal.admin.platforms.icon_url_help')}</small>
              </div>
              <div className="Form-col">
                <label>{app.translator.trans('withdrawal.admin.platforms.icon_class')}</label>
                <input
                  type="text"
                  className="FormControl"
                  placeholder="fas fa-coins"
                  value={this.newPlatformIconClass()}
                  oninput={(e: Event) => this.newPlatformIconClass((e.target as HTMLInputElement).value)}
                />
                <small className="helpText">{app.translator.trans('withdrawal.admin.platforms.icon_class_help')}</small>
              </div>
            </div>
            
            <div className="Form-group">
              <Button
                className="Button Button--primary"
                loading={this.submittingPlatform}
                disabled={!this.canSubmitPlatform()}
                onclick={this.addPlatform.bind(this)}
              >
                {app.translator.trans('withdrawal.admin.platforms.add_button')}
              </Button>
            </div>
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
    // Handle both Model instances and plain objects
    const platformId = typeof platform.id === 'function' ? platform.id() : platform.id;
    const platformName = (typeof platform.name === 'function' ? platform.name() : platform.attributes?.name) || 'Unknown Platform';
    const symbol = (typeof platform.symbol === 'function' ? platform.symbol() : platform.attributes?.symbol) || 'N/A';
    const minAmount = (typeof platform.minAmount === 'function' ? platform.minAmount() : platform.attributes?.minAmount) || 'N/A';
    const maxAmount = (typeof platform.maxAmount === 'function' ? platform.maxAmount() : platform.attributes?.maxAmount) || 'N/A';
    const fee = (typeof platform.fee === 'function' ? platform.fee() : platform.attributes?.fee) || 'N/A';
    const isActive = (typeof platform.isActive === 'function' ? platform.isActive() : platform.attributes?.isActive) ?? false;
    const createdDate = (typeof platform.createdAt === 'function' ? platform.createdAt() : platform.attributes?.createdAt) || null;
    
    let dateDisplay: Mithril.Children = 'N/A';
    if (createdDate) {
      try {
        dateDisplay = humanTime(createdDate);
      } catch (e) {
        console.error('Error formatting date:', e);
        dateDisplay = 'Invalid Date';
      }
    }
    
    return (
      <div key={platformId} className="WithdrawalPlatform">
        <div className="WithdrawalPlatform-info">
          <div className="WithdrawalPlatform-primary">
            <span className={`WithdrawalPlatform-status ${isActive ? 'active' : 'inactive'}`}>
              {isActive ? '🟢' : '🔴'}
            </span>
            <span className="WithdrawalPlatform-name">{platformName}</span>
            <span className={`WithdrawalPlatform-symbol ${symbol}`}>{symbol}</span>
          </div>
          <div className="WithdrawalPlatform-details">
            <span className="WithdrawalPlatform-amounts">
              Min: {minAmount} | Max: {maxAmount} | Fee: {fee}
            </span>
            <span className="WithdrawalPlatform-date">{dateDisplay}</span>
          </div>
        </div>
        <div className="WithdrawalPlatform-actions">
          <Button
            className={`Button ${isActive ? 'Button--secondary' : 'Button--primary'}`}
            onclick={() => this.togglePlatformStatus(platform)}
          >
            {app.translator.trans(`withdrawal.admin.platforms.${isActive ? 'disable' : 'enable'}`)}
          </Button>
          <Button
            className="Button Button--danger"
            onclick={() => this.deletePlatform(platform)}
          >
            {app.translator.trans('withdrawal.admin.platforms.delete')}
          </Button>
        </div>
      </div>
    );
  }

  private canSubmitPlatform(): boolean {
    return !!(
      this.newPlatformName() &&
      this.newPlatformName().trim() &&
      this.newPlatformSymbol() &&
      this.newPlatformSymbol().trim() &&
      this.newPlatformMinAmount() &&
      this.newPlatformMaxAmount() &&
      parseFloat(this.newPlatformMinAmount()) > 0 &&
      parseFloat(this.newPlatformMaxAmount()) > 0 &&
      parseFloat(this.newPlatformMaxAmount()) >= parseFloat(this.newPlatformMinAmount())
    );
  }

  private renderRequestManagement(): Mithril.Children {
    const pendingRequests = this.requests.filter(r => {
      const status = (typeof r.status === 'function' ? r.status() : r.attributes?.status) || 'pending';
      return status === 'pending';
    });
    const processedRequests = this.requests.filter(r => {
      const status = (typeof r.status === 'function' ? r.status() : r.attributes?.status) || 'pending';
      return status !== 'pending';
    });

    return (
      <div className="WithdrawalManagementPage-section">
        <h3>{app.translator.trans('withdrawal.admin.requests.title')}</h3>
        
        <div className="WithdrawalManagementPage-pendingRequests">
          <h4>{app.translator.trans('withdrawal.admin.requests.pending_title')}</h4>
          {pendingRequests.length === 0 ? (
            <p>{app.translator.trans('withdrawal.admin.requests.no_pending')}</p>
          ) : (
            pendingRequests.map((request) => this.renderRequest(request, true, true))
          )}
        </div>

        <div className="WithdrawalManagementPage-processedRequests">
          <h4>{app.translator.trans('withdrawal.admin.requests.processed_title')}</h4>
          {processedRequests.length === 0 ? (
            <p>{app.translator.trans('withdrawal.admin.requests.no_processed')}</p>
          ) : (
            processedRequests.map((request) => this.renderRequest(request, false, true))
          )}
        </div>
      </div>
    );
  }

  private renderRequest(request: WithdrawalRequest, showActions: boolean, showDelete: boolean = false): Mithril.Children {
    // Handle Flarum Model instances
    const requestId = typeof request.id === 'function' ? request.id() : request.id;
    const amount = typeof request.amount === 'function' ? request.amount() : (request.attributes?.amount || 0);
    const status = typeof request.status === 'function' ? request.status() : (request.attributes?.status || 'pending');
    const accountDetails = typeof request.accountDetails === 'function' ? request.accountDetails() : 
      (request.attributes?.accountDetails || request.attributes?.account_details || 'N/A');
    const createdDate = typeof request.createdAt === 'function' ? request.createdAt() : (request.attributes?.createdAt || null);
    
    // Get user info
    let userName = 'Unknown User';
    if (typeof request.user === 'function') {
      const userData = request.user();
      if (userData && typeof userData.displayName === 'function') {
        userName = userData.displayName();
      } else if (userData && userData.attributes?.displayName) {
        userName = userData.attributes.displayName;
      }
    }
    
    // Get platform info - simplified approach using Flarum Model relationships
    let platformName = 'Unknown Platform';
    let platformSymbol = 'N/A';
    
    if (typeof request.platform === 'function') {
      const platform = request.platform();
      if (platform) {
        platformName = typeof platform.name === 'function' ? platform.name() : (platform.attributes?.name || 'Unknown Platform');
        platformSymbol = typeof platform.symbol === 'function' ? platform.symbol() : (platform.attributes?.symbol || 'N/A');
      }
    }
    
    const statusClass = `status-${status}`;
    
    let dateDisplay: Mithril.Children = 'N/A';
    if (createdDate) {
      try {
        dateDisplay = humanTime(createdDate);
      } catch (e) {
        console.error('Error formatting request date:', e);
        dateDisplay = 'Invalid Date';
      }
    }

    return (
      <div key={requestId} className={`WithdrawalRequest ${statusClass}`}>
        <div className="WithdrawalRequest-info">
          <div className="WithdrawalRequest-user">
            <strong>{userName}</strong>
          </div>
          <div className="WithdrawalRequest-details">
            <span className="amount">{amount}</span>
            <span className="platform">{platformName}</span>
            <span className="symbol">{platformSymbol}</span>
            <span className="date">{dateDisplay}</span>
          </div>
          <div className="WithdrawalRequest-account">
            <strong>{app.translator.trans('withdrawal.admin.requests.account_details')}:</strong>
            <span>{accountDetails}</span>
          </div>
          <div className="WithdrawalRequest-status">
            <span className={`Badge Badge--${status}`}>
              {app.translator.trans(`withdrawal.admin.requests.status.${status}`)}
            </span>
          </div>
        </div>
        
        {(showActions || showDelete) && (
          <div className="WithdrawalRequest-actions">
            {showActions && (
              <>
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
              </>
            )}
            <Button
              className="Button Button--link"
              onclick={() => this.deleteRequest(request)}
            >
              <i className="fas fa-trash"></i>
              {app.translator.trans('withdrawal.admin.requests.delete')}
            </Button>
          </div>
        )}
      </div>
    );
  }

  private async addPlatform(): Promise<void> {
    if (!this.canSubmitPlatform() || this.submittingPlatform) return;

    this.submittingPlatform = true;

    try {
      const response = await app.request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/withdrawal-platforms',
        body: {
          data: {
            type: 'withdrawal-platforms',
            attributes: {
              name: this.newPlatformName(),
              symbol: this.newPlatformSymbol(),
              minAmount: parseFloat(this.newPlatformMinAmount()),
              maxAmount: parseFloat(this.newPlatformMaxAmount()),
              fee: parseFloat(this.newPlatformFee() || '0'),
              iconUrl: this.newPlatformIconUrl() || null,
              iconClass: this.newPlatformIconClass() || null,
              isActive: true
            }
          }
        }
      });
      
      if (response && response.data) {
        app.store.pushPayload(response);
      }
      
      // Clear form
      this.newPlatformName('');
      this.newPlatformSymbol('');
      this.newPlatformMinAmount('');
      this.newPlatformMaxAmount('');
      this.newPlatformFee('');
      this.newPlatformIconUrl('');
      this.newPlatformIconClass('');
      
      await this.loadPlatforms();
      
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('withdrawal.admin.platforms.add_success')
      );
    } catch (error) {
      console.error('Error adding platform:', error);
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.platforms.add_error')
      );
    } finally {
      this.submittingPlatform = false;
      m.redraw();
    }
  }

  private async togglePlatformStatus(platform: WithdrawalPlatform): Promise<void> {
    try {
      const platformId = typeof platform.id === 'function' ? platform.id() : platform.id;
      const currentStatus = (typeof platform.isActive === 'function' ? platform.isActive() : platform.attributes?.isActive) ?? false;
      const record = app.store.getById('withdrawal-platforms', platformId);
      
      if (record) {
        await record.save({ isActive: !currentStatus });
        await this.loadPlatforms();
        
        app.alerts.show(
          { type: 'success', dismissible: true },
          app.translator.trans(`withdrawal.admin.platforms.${!currentStatus ? 'enable' : 'disable'}_success`)
        );
      }
    } catch (error) {
      console.error('Error toggling platform status:', error);
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.platforms.toggle_error')
      );
    }
  }

  private deletePlatform(platform: WithdrawalPlatform): void {
    const platformName = (typeof platform.name === 'function' ? platform.name() : platform.attributes?.name) || 'Unknown Platform';
    
    app.modal.show(ConfirmDeleteModal, {
      platformName: platformName,
      onConfirm: async () => {
        try {
          const platformId = typeof platform.id === 'function' ? platform.id() : platform.id;
          const record = app.store.getById('withdrawal-platforms', platformId);
          if (record) {
            await record.delete();
            await this.loadPlatforms();
            
            app.alerts.show(
              { type: 'success', dismissible: true },
              app.translator.trans('withdrawal.admin.platforms.delete_success')
            );
          }
        } catch (error) {
          console.error('Error deleting platform:', error);
          app.alerts.show(
            { type: 'error', dismissible: true },
            app.translator.trans('withdrawal.admin.platforms.delete_error')
          );
        }
      }
    });
  }

  private async updateRequestStatus(request: WithdrawalRequest, status: string): Promise<void> {
    try {
      const requestId = typeof request.id === 'function' ? request.id() : request.id;
      const record = app.store.getById('withdrawal-requests', requestId);
      if (record) {
        await record.save({ status });
        await this.loadRequests();
        
        app.alerts.show(
          { type: 'success', dismissible: true },
          app.translator.trans(`withdrawal.admin.requests.${status}_success`)
        );
      }
    } catch (error) {
      console.error('Error updating request:', error);
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.requests.update_error')
      );
    }
  }

  private deleteRequest(request: WithdrawalRequest): void {
    const requestId = typeof request.id === 'function' ? request.id() : request.id;
    const amount = typeof request.amount === 'function' ? request.amount() : (request.attributes?.amount || 0);
    
    // Get user name for display in confirmation
    let userName = 'Unknown User';
    if (typeof request.user === 'function') {
      const userData = request.user();
      if (userData && typeof userData.displayName === 'function') {
        userName = userData.displayName();
      } else if (userData && userData.attributes?.displayName) {
        userName = userData.attributes.displayName;
      }
    }
    
    app.modal.show(ConfirmDeleteRequestModal, {
      requestInfo: `${userName} - ${amount}`,
      onConfirm: async () => {
        try {
          const record = app.store.getById('withdrawal-requests', requestId);
          if (record) {
            await record.delete();
            await this.loadRequests();
            
            app.alerts.show(
              { type: 'success', dismissible: true },
              app.translator.trans('withdrawal.admin.requests.delete_success')
            );
          }
        } catch (error) {
          console.error('Error deleting request:', error);
          app.alerts.show(
            { type: 'error', dismissible: true },
            app.translator.trans('withdrawal.admin.requests.delete_error')
          );
        }
      }
    });
  }

  private async loadData(): Promise<void> {
    try {
      // Load platforms first to ensure they're in the store
      await this.loadPlatforms();
      // Then load requests which reference platforms
      await this.loadRequests();
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
      const response = await app.store.find('withdrawal-requests', {
        include: 'user,platform'
      });
      this.requests = Array.isArray(response) ? response.filter(r => r !== null) : (response ? [response] : []);
      
      console.log('Loaded requests:', this.requests);
    } catch (error) {
      console.error('Error loading requests:', error);
      this.requests = [];
    }
    
    // Load user data for each request - skip if no requests
    if (this.requests.length === 0) {
      return;
    }
    
    const userIds = [...new Set(this.requests
      .map(r => {
        // Check both data.relationships and direct relationships structures
        const userRelation = r?.data?.relationships?.user?.data || r?.relationships?.user?.data;
        if (userRelation) {
          return userRelation.id;
        }
        return null;
      })
      .filter(id => id !== null && id !== undefined)
    )];
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

class ConfirmDeleteModal extends Modal {
  private platformName: string;
  private onConfirm: () => void;

  constructor(vnode: any) {
    super(vnode);
    this.platformName = vnode.attrs.platformName;
    this.onConfirm = vnode.attrs.onConfirm;
  }

  className() {
    return 'ConfirmDeleteModal Modal--small';
  }

  title() {
    return app.translator.trans('withdrawal.admin.platforms.delete_confirm_title');
  }

  content() {
    return (
      <div className="Modal-body">
        <p>{app.translator.trans('withdrawal.admin.platforms.delete_confirm_message', { name: this.platformName })}</p>
        <div className="Form-group">
          <Button 
            className="Button Button--primary" 
            onclick={this.confirm.bind(this)}
          >
            {app.translator.trans('withdrawal.admin.platforms.delete_confirm_button')}
          </Button>
          <Button 
            className="Button" 
            onclick={this.hide.bind(this)}
          >
            {app.translator.trans('withdrawal.admin.platforms.delete_cancel_button')}
          </Button>
        </div>
      </div>
    );
  }

  confirm() {
    this.onConfirm();
    this.hide();
  }
}

class ConfirmDeleteRequestModal extends Modal {
  private requestInfo: string;
  private onConfirm: () => void;

  constructor(vnode: any) {
    super(vnode);
    this.requestInfo = vnode.attrs.requestInfo;
    this.onConfirm = vnode.attrs.onConfirm;
  }

  className() {
    return 'ConfirmDeleteRequestModal Modal--small';
  }

  title() {
    return app.translator.trans('withdrawal.admin.requests.delete_confirm_title');
  }

  content() {
    return (
      <div className="Modal-body">
        <p>{app.translator.trans('withdrawal.admin.requests.delete_confirm_message', { info: this.requestInfo })}</p>
        <div className="Form-group">
          <Button 
            className="Button Button--danger" 
            onclick={this.confirm.bind(this)}
          >
            {app.translator.trans('withdrawal.admin.requests.delete_confirm_button')}
          </Button>
          <Button 
            className="Button" 
            onclick={this.hide.bind(this)}
          >
            {app.translator.trans('withdrawal.admin.requests.delete_cancel_button')}
          </Button>
        </div>
      </div>
    );
  }

  confirm() {
    this.onConfirm();
    this.hide();
  }
}