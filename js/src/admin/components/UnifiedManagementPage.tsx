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
import DepositRecordManagementSection from './sections/DepositRecordManagementSection';
import DepositPlatformManagementSection from './sections/DepositPlatformManagementSection';
import ConfirmModal from '../../common/components/shared/ConfirmModal';
import { 
  createWithdrawalPlatformOperations,
  createWithdrawalRequestOperations
} from '../utils/platformOperations';

// Import services
import { depositService, platformService } from '../../common/services';
import { ServiceError } from '../../common/types/services';
import Component from 'flarum/common/Component';

// Placeholder components for custom tabs
class WithdrawalTabPlaceholder extends Component {
  view() {
    return <div>Withdrawals Content</div>;
  }
}

class DepositsTabPlaceholder extends Component {
  view() {
    return <div>Deposits Content</div>;
  }
}


export default class UnifiedManagementPage extends GenericManagementPage<GenericPlatform, GenericTransaction> {
  
  // Additional state for complex scenarios
  private depositPlatforms: GenericPlatform[] = [];
  private depositRecords: GenericTransaction[] = [];
  private users: { [key: number]: any } = {};

  protected getConfig(): GenericManagementPageConfig<GenericPlatform, GenericTransaction> {
    return {
      pageTitle: app.translator.trans('funds.admin.page.title').toString(),
      extensionId: 'WithdrawalManagement',
      
      // Primary platform operations (funds)
      platformOperations: createWithdrawalPlatformOperations(),
      transactionOperations: createWithdrawalRequestOperations(),
      
      // Settings component
      settingsComponent: GeneralSettingsSection,
      
      // Tab configuration
      tabs: [
        {
          key: 'withdrawals',
          label: app.translator.trans('funds.admin.tabs.withdrawals').toString(),
          component: WithdrawalTabPlaceholder
        },
        {
          key: 'deposits',
          label: app.translator.trans('funds.admin.tabs.deposits').toString(),
          component: DepositsTabPlaceholder
        }
      ],
      
      translations: {
        platformPrefix: 'funds.admin.platforms',
        transactionPrefix: 'funds.admin.requests'
      }
    };
  }

  // Override renderActiveTabContent to handle the complex withdrawals and deposits tabs  
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
            onDeleteRequest={this.deleteWithdrawalRequest.bind(this)}
          />
        </div>
      );
    }
    
    if (this.activeTab === 'deposits') {
      return (
        <div>
          <DepositPlatformManagementSection
            platforms={this.depositPlatforms}
            submittingPlatform={this.submittingPlatform}
            onAddPlatform={this.addDepositPlatform.bind(this)}
            onTogglePlatformStatus={this.toggleDepositPlatformStatus.bind(this)}
            onDeletePlatform={this.deleteDepositPlatform.bind(this)}
          />
          
          <DepositRecordManagementSection
            platforms={this.depositPlatforms}
            records={this.depositRecords}
            loading={this.loading}
            onApproveRecord={this.approveDepositRecord.bind(this)}
            onRejectRecord={this.rejectDepositRecord.bind(this)}
            onDeleteRecord={this.deleteDepositRecord.bind(this)}
          />
        </div>
      );
    }
    
    // For other tabs, use the parent implementation
    return super.renderActiveTabContent();
  }

  // Override loadData to handle unified funds and deposit data loading
  protected async loadData(): Promise<void> {
    try {
      // Load funds data (handled by parent)
      await this.loadPlatforms();
      await this.loadTransactions();
      
      // Load additional user data for requests
      await this.loadUserData();
      
      // Load deposit data
      await this.loadDepositPlatforms();
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
    if (this.submittingPlatform) return;

    this.submittingPlatform = true;
    m.redraw();

    try {
      // Convert numeric fields from strings to numbers
      const attributes = {
        ...formData,
        minAmount: parseFloat(formData.minAmount) || 0,
        maxAmount: formData.maxAmount && formData.maxAmount.trim() ? parseFloat(formData.maxAmount) : null,
        fee: formData.fee && formData.fee.trim() ? parseFloat(formData.fee) : 0,
        isActive: formData.isActive !== undefined ? formData.isActive : true
      };
      
      await platformService.create('deposit', attributes);
      await this.loadDepositPlatforms();
      
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('funds.admin.deposit.platforms.add_success')
      );
    } catch (error) {
      console.error('Error adding deposit platform:', error);
      
      let errorMessage = app.translator.trans('funds.admin.deposit.platforms.add_error').toString();
      
      if (error instanceof ServiceError) {
        errorMessage = error.message;
      }
      
      app.alerts.show(
        { type: 'error', dismissible: true },
        errorMessage
      );
    } finally {
      this.submittingPlatform = false;
      m.redraw();
    }
  }

  private async toggleDepositPlatformStatus(platform: GenericPlatform): Promise<void> {
    try {
      await platformService.toggleStatus(platform);
      await this.loadDepositPlatforms();
      
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('funds.admin.deposit.platforms.status_updated')
      );
      
      m.redraw();
    } catch (error) {
      console.error('Error toggling deposit platform status:', error);
      
      let errorMessage = app.translator.trans('funds.admin.deposit.platforms.status_error').toString();
      
      if (error instanceof ServiceError) {
        errorMessage = error.message;
      }
      
      app.alerts.show(
        { type: 'error', dismissible: true },
        errorMessage
      );
    }
  }

  private async deleteDepositPlatform(platform: GenericPlatform): Promise<void> {
    const platformName = (typeof platform.name === 'function' ? platform.name() : platform.name) || 'Unknown Platform';
    
    app.modal.show(ConfirmModal, {
      title: app.translator.trans('funds.admin.platforms.delete_confirm_title'),
      message: app.translator.trans('funds.admin.platforms.delete_confirm_message', { name: platformName }),
      confirmText: app.translator.trans('funds.admin.platforms.delete_confirm_button'),
      cancelText: app.translator.trans('funds.admin.platforms.delete_cancel_button'),
      dangerous: true,
      icon: 'fas fa-trash',
      onConfirm: async () => {
        try {
          await platformService.delete(platform);
          await this.loadDepositPlatforms();
          
          app.alerts.show(
            { type: 'success', dismissible: true },
            app.translator.trans('funds.admin.deposit.platforms.delete_success')
          );
        } catch (error) {
          console.error('Error deleting deposit platform:', error);
          
          let errorMessage = app.translator.trans('funds.admin.deposit.platforms.delete_error').toString();
          
          if (error instanceof ServiceError) {
            errorMessage = error.message;
          }
          
          app.alerts.show(
            { type: 'error', dismissible: true },
            errorMessage
          );
        }
        m.redraw();
      },
      onCancel: () => {
        app.modal.close();
      }
    });
  }


  private async updateDepositRecordStatus(record: GenericTransaction, status: string): Promise<void> {
    try {
      await depositService.update(record as any, { status });
      await this.loadDepositRecords();
      
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('funds.admin.deposit.records.status_updated')
      );
      
      m.redraw();
    } catch (error) {
      console.error('Error updating deposit record:', error);
      
      let errorMessage = app.translator.trans('funds.admin.deposit.records.status_error').toString();
      
      if (error instanceof ServiceError) {
        errorMessage = error.message;
      }
      
      app.alerts.show(
        { type: 'error', dismissible: true },
        errorMessage
      );
    }
  }

  // Deletion method for funds requests  
  private deleteWithdrawalRequest(request: any): void {
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
      title: app.translator.trans('funds.admin.requests.delete_confirm_title'),
      message: app.translator.trans('funds.admin.requests.delete_confirm_message', { info: `${userName} - ${amount}` }),
      confirmText: app.translator.trans('funds.admin.requests.delete_confirm_button'),
      cancelText: app.translator.trans('funds.admin.requests.delete_cancel_button'),
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
              app.translator.trans('funds.admin.requests.delete_success')
            );
          }
        } catch (error) {
          console.error('Error deleting request:', error);
          app.alerts.show(
            { type: 'error', dismissible: true },
            app.translator.trans('funds.admin.requests.delete_error')
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
    try {
      this.depositPlatforms = await platformService.find('deposit', {
        sort: 'name'
      });
      console.log('Loaded deposit platforms:', this.depositPlatforms);
    } catch (error) {
      console.error('Error loading deposit platforms:', error);
      this.depositPlatforms = [];
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
      // For admin, get all deposit records (not just user's own)
      const records = await depositService.find({
        include: 'user,platform',
        sort: '-createdAt'
      });
      
      this.depositRecords = records as GenericTransaction[];
      console.log('Loaded deposit records:', this.depositRecords);
    } catch (error) {
      console.error('Error loading deposit records:', error);
      this.depositRecords = [];
    }
  }

  private async approveDepositRecord(record: any, creditedAmount?: number, notes?: string): Promise<void> {
    try {
      const attributes: any = {
        status: 'approved'
      };
      
      if (creditedAmount !== undefined) {
        attributes.creditedAmount = creditedAmount;
      }
      
      if (notes) {
        attributes.adminNotes = notes;
      }
      
      await depositService.update(record, attributes);
      await this.loadDepositRecords();
      
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('funds.admin.deposit.records.approve_success')
      );
      
      m.redraw();
    } catch (error) {
      console.error('Error approving deposit record:', error);
      
      let errorMessage = app.translator.trans('funds.admin.deposit.records.approve_error').toString();
      
      if (error instanceof ServiceError) {
        errorMessage = error.message;
      }
      
      app.alerts.show(
        { type: 'error', dismissible: true },
        errorMessage
      );
      
      throw error;
    }
  }

  private async rejectDepositRecord(record: any, reason: string): Promise<void> {
    try {
      await depositService.update(record, {
        status: 'rejected',
        adminNotes: reason
      });
      
      await this.loadDepositRecords();
      
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('funds.admin.deposit.records.reject_success')
      );
      
      m.redraw();
    } catch (error) {
      console.error('Error rejecting deposit record:', error);
      
      let errorMessage = app.translator.trans('funds.admin.deposit.records.reject_error').toString();
      
      if (error instanceof ServiceError) {
        errorMessage = error.message;
      }
      
      app.alerts.show(
        { type: 'error', dismissible: true },
        errorMessage
      );
      
      throw error;
    }
  }

  private async deleteDepositRecord(record: any): Promise<void> {
    try {
      await depositService.delete(record);
      await this.loadDepositRecords();
      
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('funds.admin.deposit.records.delete_success')
      );
      
      m.redraw();
    } catch (error) {
      console.error('Error deleting deposit record:', error);
      
      let errorMessage = app.translator.trans('funds.admin.deposit.records.delete_error').toString();
      
      if (error instanceof ServiceError) {
        errorMessage = error.message;
      }
      
      app.alerts.show(
        { type: 'error', dismissible: true },
        errorMessage
      );
      
      throw error;
    }
  }
}