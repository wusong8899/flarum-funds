import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import type Mithril from 'mithril';
import { WithdrawalPlatform, WithdrawalRequest, User, PlatformFormData } from './types/AdminTypes';
import GeneralSettingsSection from './sections/GeneralSettingsSection';
import PlatformManagementSection from './sections/PlatformManagementSection';
import RequestManagementSection from './sections/RequestManagementSection';
import ConfirmDeletePlatformModal from './modals/ConfirmDeletePlatformModal';
import ConfirmDeleteRequestModal from './modals/ConfirmDeleteRequestModal';

export default class WithdrawalManagementPage extends ExtensionPage {
  private platforms: WithdrawalPlatform[] = [];
  private requests: WithdrawalRequest[] = [];
  private users: { [key: number]: User } = {};
  private loading = true;
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
          
          <GeneralSettingsSection onSettingChange={this.saveSetting.bind(this)} />
          
          <PlatformManagementSection
            platforms={this.platforms}
            submittingPlatform={this.submittingPlatform}
            onAddPlatform={this.addPlatform.bind(this)}
            onTogglePlatformStatus={this.togglePlatformStatus.bind(this)}
            onDeletePlatform={this.deletePlatform.bind(this)}
          />
          
          <RequestManagementSection
            requests={this.requests}
            onUpdateRequestStatus={this.updateRequestStatus.bind(this)}
            onDeleteRequest={this.deleteRequest.bind(this)}
          />
        </div>
      </div>
    );
  }







  private async addPlatform(formData: PlatformFormData): Promise<void> {
    if (this.submittingPlatform) return;

    this.submittingPlatform = true;

    try {
      const response = await app.request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/withdrawal-platforms',
        body: {
          data: {
            type: 'withdrawal-platforms',
            attributes: {
              name: formData.name,
              symbol: formData.symbol,
              minAmount: parseFloat(formData.minAmount),
              maxAmount: parseFloat(formData.maxAmount),
              fee: parseFloat(formData.fee || '0'),
              iconUrl: formData.iconUrl || null,
              iconClass: formData.iconClass || null,
              isActive: true
            }
          }
        }
      });
      
      if (response && response.data) {
        app.store.pushPayload(response);
      }
      
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
    
    app.modal.show(ConfirmDeletePlatformModal, {
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

  private async saveSetting(key: string, value: string): Promise<void> {
    try {
      await app.request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/settings',
        body: { [key]: value }
      });
      
      // Update the forum attribute immediately so the UI reflects the change
      app.forum.pushAttributes({ [key]: value });
      
    } catch (error) {
      console.error('Error saving setting:', error);
      app.alerts.show(
        { type: 'error', dismissible: true },
        'Failed to save setting'
      );
    }
  }
}

