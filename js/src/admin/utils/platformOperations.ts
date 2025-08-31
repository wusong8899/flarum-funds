import app from 'flarum/admin/app';
import type { PlatformOperations, TransactionOperations } from '../components/shared/GenericManagementPage';

// Withdrawal platform operations - now using service layer
export const createWithdrawalPlatformOperations = (): PlatformOperations<any> => ({
  async create(formData: any) {
    try {
      // Import PlatformService dynamically to avoid circular dependencies
      const { platformService } = await import('../../common/services/PlatformService');
      
      const attributes = {
        name: formData.name,
        symbol: formData.symbol,
        network: formData.network || null,
        minAmount: parseFloat(formData.minAmount),
        maxAmount: parseFloat(formData.maxAmount),
        fee: parseFloat(formData.fee || '0'),
        iconUrl: formData.iconUrl || null,
        iconClass: formData.iconClass || null,
        isActive: true
      };
      
      const result = await platformService.create('withdrawal', attributes);
      
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('withdrawal.admin.platforms.add_success').toString()
      );
      
      return result;
    } catch (error) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        error instanceof Error ? error.message : app.translator.trans('withdrawal.admin.platforms.add_error').toString()
      );
      throw error;
    }
  },

  async toggleStatus(platform: any) {
    try {
      // Import PlatformService dynamically
      const { platformService } = await import('../../common/services/PlatformService');
      
      const result = await platformService.toggleStatus(platform);
      const newStatus = result.isActive();
      
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans(`withdrawal.admin.platforms.${newStatus ? 'enable' : 'disable'}_success`)
      );
      
      return result;
    } catch (error) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        error instanceof Error ? error.message : 'Failed to toggle platform status'
      );
      throw error;
    }
  },

  async delete(platform: any) {
    try {
      // Import PlatformService dynamically
      const { platformService } = await import('../../common/services/PlatformService');
      
      await platformService.delete(platform);
      
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('withdrawal.admin.platforms.delete_success').toString()
      );
    } catch (error) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        error instanceof Error ? error.message : 'Failed to delete platform'
      );
      throw error;
    }
  },

  async load() {
    try {
      // Import PlatformService dynamically
      const { platformService } = await import('../../common/services/PlatformService');
      return await platformService.find('withdrawal');
    } catch (error) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.platforms.load_error').toString()
      );
      throw error;
    }
  }
});

// Deposit platform operations - now using service layer
export const createDepositPlatformOperations = (): PlatformOperations<any> => ({
  async create(formData: any) {
    try {
      // Import PlatformService dynamically
      const { platformService } = await import('../../common/services/PlatformService');
      
      const attributes = {
        name: formData.name,
        symbol: formData.symbol,
        network: formData.network,
        minAmount: parseFloat(formData.minAmount) || 0,
        maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : null,
        address: formData.address || null,
        qrCodeImageUrl: formData.qrCodeImageUrl || null,
        iconUrl: formData.iconUrl || null,
        iconClass: formData.iconClass || null,
        warningText: formData.warningText || null,
        isActive: formData.isActive
      };
      
      const result = await platformService.create('deposit', attributes);
      
      // Success message is handled by the calling component (UnifiedManagementPage)
      // to avoid duplicate messages
      
      return result;
    } catch (error) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        error instanceof Error ? error.message : app.translator.trans('withdrawal.admin.deposit.platforms.add_error').toString()
      );
      throw error;
    }
  },

  async toggleStatus(platform: any) {
    try {
      // Import PlatformService dynamically
      const { platformService } = await import('../../common/services/PlatformService');
      
      const result = await platformService.toggleStatus(platform);
      
      // Success message is handled by the calling component (UnifiedManagementPage)
      // to avoid duplicate messages
      
      return result;
    } catch (error) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        error instanceof Error ? error.message : app.translator.trans('withdrawal.admin.deposit.platforms.toggle_error').toString()
      );
      throw error;
    }
  },

  async delete(platform: any) {
    try {
      // Import PlatformService dynamically
      const { platformService } = await import('../../common/services/PlatformService');
      
      await platformService.delete(platform);
      
      // Success message is handled by the calling component (UnifiedManagementPage)
      // to avoid duplicate messages
    } catch (error) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        error instanceof Error ? error.message : app.translator.trans('withdrawal.admin.deposit.platforms.delete_error').toString()
      );
      throw error;
    }
  },

  async load() {
    try {
      // Import PlatformService dynamically
      const { platformService } = await import('../../common/services/PlatformService');
      return await platformService.find('deposit');
    } catch (error) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.deposit.platforms.load_error').toString()
      );
      throw error;
    }
  }
});

// Withdrawal request operations - now using service layer
export const createWithdrawalRequestOperations = (): TransactionOperations<any> => ({
  async updateStatus(request: any, status: string) {
    try {
      // Import WithdrawalService dynamically
      const { withdrawalService } = await import('../../common/services/WithdrawalService');
      
      const result = await withdrawalService.update(request, { status });
      
      // Success message is handled by the calling component (GenericManagementPage)
      // to avoid duplicate messages
      
      return result;
    } catch (error) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        error instanceof Error ? error.message : `Failed to update request status to ${status}`
      );
      throw error;
    }
  },

  async load() {
    try {
      // Import WithdrawalService dynamically
      const { withdrawalService } = await import('../../common/services/WithdrawalService');
      return await withdrawalService.find({ include: 'user,platform' });
    } catch (error) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.requests.load_error').toString()
      );
      throw error;
    }
  }
});

// Deposit record operations - now using service layer
export const createDepositRecordOperations = (): TransactionOperations<any> => ({
  async updateStatus(record: any, status: string) {
    try {
      // Import DepositService dynamically
      const { depositService } = await import('../../common/services/DepositService');
      
      const result = await depositService.update(record, { status });
      
      // Success message is handled by the calling component
      // to avoid duplicate messages
      
      return result;
    } catch (error) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        error instanceof Error ? error.message : app.translator.trans('withdrawal.admin.deposit.records.update_error').toString()
      );
      throw error;
    }
  },

  async load() {
    try {
      // Import DepositService dynamically
      const { depositService } = await import('../../common/services/DepositService');
      return await depositService.find();
    } catch (error) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.deposit.records.load_error').toString()
      );
      throw error;
    }
  }
});