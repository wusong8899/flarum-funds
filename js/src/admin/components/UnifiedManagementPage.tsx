import app from 'flarum/admin/app';
import m from 'mithril';
import type Mithril from 'mithril';
import GenericManagementPage, { 
  type GenericManagementPageConfig, 
  type GenericPlatform, 
  type GenericTransaction 
} from './shared/GenericManagementPage';
import GeneralSettingsSection from './sections/GeneralSettingsSection';
import PlatformManagementSection from './sections/PlatformManagementSection';
import RequestManagementSection from './sections/RequestManagementSection';
import DepositManagementSection from './sections/DepositManagementSection';
import DepositRecordManagementSection from './sections/DepositRecordManagementSection';
import ConfirmModal from '../../common/components/shared/ConfirmModal';
import { 
  createWithdrawalPlatformOperations,
  createDepositPlatformOperations,
  createWithdrawalRequestOperations,
  createDepositTransactionOperations
} from '../utils/platformOperations';

export default class UnifiedManagementPage extends GenericManagementPage<GenericPlatform, GenericTransaction> {
  
  // Additional state for complex scenarios
  private depositPlatforms: GenericPlatform[] = [];
  private depositTransactions: GenericTransaction[] = [];
  private depositRecords: GenericTransaction[] = [];
  private users: { [key: number]: any } = {};

  protected getConfig(): GenericManagementPageConfig<GenericPlatform, GenericTransaction> {
    return {
      pageTitle: app.translator.trans('withdrawal.admin.page.title').toString(),
      extensionId: 'WithdrawalManagement',
      
      // Primary platform operations (withdrawal)
      platformOperations: createWithdrawalPlatformOperations(),
      transactionOperations: createWithdrawalRequestOperations(),
      
      // Settings component
      settingsComponent: GeneralSettingsSection,
      
      // Tab configuration
      tabs: [
        {
          key: 'withdrawals',
          label: app.translator.trans('withdrawal.admin.tabs.withdrawals').toString(),
          component: 'div', // Will be replaced by custom content
        },
        {
          key: 'deposits',
          label: app.translator.trans('withdrawal.admin.tabs.deposits').toString(),
          component: DepositManagementSection,
          props: () => ({
            platforms: this.depositPlatforms,
            transactions: this.depositTransactions,
            submittingPlatform: this.submittingPlatform,
            onAddPlatform: this.addDepositPlatform.bind(this),
            onTogglePlatformStatus: this.toggleDepositPlatformStatus.bind(this),
            onDeletePlatform: this.deleteDepositPlatform.bind(this),
            onUpdateTransactionStatus: this.updateDepositTransactionStatus.bind(this),
          })
        },
        {
          key: 'deposit-records',
          label: app.translator.trans('withdrawal.admin.tabs.deposit_records').toString(),
          component: 'div', // Will be replaced by custom content
        }
      ],
      
      translations: {
        platformPrefix: 'withdrawal.admin.platforms',
        transactionPrefix: 'withdrawal.admin.requests'
      }
    };
  }

  // Override renderActiveTabContent to handle the complex withdrawals and deposit-records tabs  
  protected renderActiveTabContent(): Mithril.Children {
    if (this.activeTab === 'withdrawals') {
      return (
        <div>
          <PlatformManagementSection
            platforms={this.platforms}
            submittingPlatform={this.submittingPlatform}
            onAddPlatform={this.addPlatform.bind(this)}
            onTogglePlatformStatus={this.togglePlatformStatus.bind(this)}
            onDeletePlatform={this.deletePlatform.bind(this)}
          />
          
          <RequestManagementSection
            requests={this.transactions as any}
            onUpdateRequestStatus={this.updateTransactionStatus.bind(this)}
            onDeleteRequest={this.deleteRequest.bind(this)}
          />
        </div>
      );
    }
    
    if (this.activeTab === 'deposit-records') {
      return (
        <DepositRecordManagementSection
          records={this.depositRecords as any}
          platforms={this.depositPlatforms}
          loading={this.loading}
          onApproveRecord={this.approveDepositRecord.bind(this)}
          onRejectRecord={this.rejectDepositRecord.bind(this)}
          onDeleteRecord={this.deleteDepositRecord.bind(this)}
        />
      );
    }
    
    // For other tabs, use the parent implementation
    return super.renderActiveTabContent();
  }

  // Override loadData to handle complex data loading
  protected async loadData(): Promise<void> {
    try {
      // Load withdrawal data (handled by parent)
      await this.loadPlatforms();
      await this.loadTransactions();
      
      // Load additional user data for requests
      await this.loadUserData();
      
      // Load deposit data
      await this.loadDepositPlatforms();
      await this.loadDepositTransactions();
      await this.loadDepositRecords();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.loading = false;
      m.redraw();
    }
  }

  // Deposit platform management methods
  private async addDepositPlatform(formData: any): Promise<void> {
    const depositOperations = createDepositPlatformOperations();
    if (this.submittingPlatform) return;

    this.submittingPlatform = true;
    m.redraw();

    try {
      await depositOperations.create(formData);
      await this.loadDepositPlatforms();
    } catch (error) {
      console.error('Error adding deposit platform:', error);
      
      // Show error message
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.deposit.platforms.add_error')
      );
    } finally {
      this.submittingPlatform = false;
      m.redraw();
    }
  }

  private async toggleDepositPlatformStatus(platform: GenericPlatform): Promise<void> {
    const depositOperations = createDepositPlatformOperations();
    try {
      await depositOperations.toggleStatus(platform);
      await this.loadDepositPlatforms();
      m.redraw();
    } catch (error) {
      console.error('Error toggling deposit platform status:', error);
    }
  }

  private async deleteDepositPlatform(platform: GenericPlatform): Promise<void> {
    const depositOperations = createDepositPlatformOperations();
    const platformName = (typeof platform.name === 'function' ? platform.name() : platform.name) || 'Unknown Platform';
    
    app.modal.show(ConfirmModal, {
      title: app.translator.trans('withdrawal.admin.platforms.delete_confirm_title'),
      message: app.translator.trans('withdrawal.admin.platforms.delete_confirm_message', { name: platformName }),
      confirmText: app.translator.trans('withdrawal.admin.platforms.delete_confirm_button'),
      cancelText: app.translator.trans('withdrawal.admin.platforms.delete_cancel_button'),
      dangerous: true,
      icon: 'fas fa-trash',
      onConfirm: async () => {
        try {
          await depositOperations.delete(platform);
          await this.loadDepositPlatforms();
          
          app.alerts.show(
            { type: 'success', dismissible: true },
            app.translator.trans('withdrawal.admin.deposit.platforms.delete_success')
          );
        } catch (error) {
          console.error('Error deleting deposit platform:', error);
          app.alerts.show(
            { type: 'error', dismissible: true },
            app.translator.trans('withdrawal.admin.deposit.platforms.delete_error')
          );
        }
        m.redraw();
      },
      onCancel: () => {
        app.modal.close();
      }
    });
  }

  private async updateDepositTransactionStatus(transaction: GenericTransaction, status: string): Promise<void> {
    const depositTransactionOperations = createDepositTransactionOperations();
    try {
      await depositTransactionOperations.updateStatus(transaction, status);
      await this.loadDepositTransactions();
      m.redraw();
    } catch (error) {
      console.error('Error updating deposit transaction:', error);
    }
  }

  // Deletion method for requests (different from transactions)
  private deleteRequest(request: any): void {
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
    
    app.modal.show(ConfirmModal, {
      title: app.translator.trans('withdrawal.admin.requests.delete_confirm_title'),
      message: app.translator.trans('withdrawal.admin.requests.delete_confirm_message', { info: `${userName} - ${amount}` }),
      confirmText: app.translator.trans('withdrawal.admin.requests.delete_confirm_button'),
      cancelText: app.translator.trans('withdrawal.admin.requests.delete_cancel_button'),
      dangerous: true,
      icon: 'fas fa-trash',
      onConfirm: async () => {
        try {
          const record = app.store.getById('withdrawal-requests', requestId);
          if (record) {
            await record.delete();
            await this.loadTransactions();
            
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
      },
      onCancel: () => {
        app.modal.close();
      }
    });
  }

  // Additional data loading methods
  private async loadDepositPlatforms(): Promise<void> {
    const depositOperations = createDepositPlatformOperations();
    try {
      this.depositPlatforms = await depositOperations.load();
      console.log('Loaded deposit platforms:', this.depositPlatforms);
    } catch (error) {
      console.error('Error loading deposit platforms:', error);
      this.depositPlatforms = [];
    }
  }

  private async loadDepositTransactions(): Promise<void> {
    const depositTransactionOperations = createDepositTransactionOperations();
    try {
      this.depositTransactions = await depositTransactionOperations.load();
      console.log('Loaded deposit transactions:', this.depositTransactions);
    } catch (error) {
      console.error('Error loading deposit transactions:', error);
      this.depositTransactions = [];
    }
  }

  private async loadUserData(): Promise<void> {
    // Skip if no requests
    if (this.transactions.length === 0) return;
    
    const userIds = [...new Set(this.transactions
      .map(r => {
        // Check both data.relationships and direct relationships structures
        const userRelation = (r as any)?.data?.relationships?.user?.data || (r as any)?.relationships?.user?.data;
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

  // Deposit record management methods
  private async loadDepositRecords(): Promise<void> {
    try {
      const response = await app.request({
        method: 'GET',
        url: app.forum.attribute('apiUrl') + '/deposit-records'
      });

      app.store.pushPayload(response);
      this.depositRecords = app.store.all('deposit-records');
      console.log('Loaded deposit records:', this.depositRecords);
    } catch (error) {
      console.error('Error loading deposit records:', error);
      this.depositRecords = [];
    }
  }

  private async approveDepositRecord(record: any, creditedAmount?: number, notes?: string): Promise<void> {
    const recordId = typeof record.id === 'function' ? record.id() : record.id;
    
    try {
      const response = await app.request({
        method: 'PATCH',
        url: `${app.forum.attribute('apiUrl')}/deposit-records/${recordId}`,
        body: {
          data: {
            type: 'deposit-records',
            id: recordId,
            attributes: {
              status: 'approved',
              creditedAmount: creditedAmount,
              adminNotes: notes
            }
          }
        }
      });

      app.store.pushPayload(response);
      await this.loadDepositRecords();
      m.redraw();
    } catch (error) {
      console.error('Error approving deposit record:', error);
      throw error;
    }
  }

  private async rejectDepositRecord(record: any, reason: string): Promise<void> {
    const recordId = typeof record.id === 'function' ? record.id() : record.id;
    
    try {
      const response = await app.request({
        method: 'PATCH',
        url: `${app.forum.attribute('apiUrl')}/deposit-records/${recordId}`,
        body: {
          data: {
            type: 'deposit-records',
            id: recordId,
            attributes: {
              status: 'rejected',
              adminNotes: reason
            }
          }
        }
      });

      app.store.pushPayload(response);
      await this.loadDepositRecords();
      m.redraw();
    } catch (error) {
      console.error('Error rejecting deposit record:', error);
      throw error;
    }
  }

  private async deleteDepositRecord(record: any): Promise<void> {
    const recordId = typeof record.id === 'function' ? record.id() : record.id;
    
    try {
      const storeRecord = app.store.getById('deposit-records', recordId);
      if (storeRecord) {
        await storeRecord.delete();
        await this.loadDepositRecords();
        m.redraw();
      }
    } catch (error) {
      console.error('Error deleting deposit record:', error);
      throw error;
    }
  }
}