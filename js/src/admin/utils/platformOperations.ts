import app from 'flarum/admin/app';
import { apiPost, apiPatch, apiDelete, apiGet } from '../../common/utils/apiRequestUtils';
import type { PlatformOperations, TransactionOperations } from '../components/shared/GenericManagementPage';

// Withdrawal platform operations
export const createWithdrawalPlatformOperations = (): PlatformOperations<any> => ({
  async create(formData: any) {
    const platformData = {
      type: 'withdrawal-platforms',
      attributes: {
        name: formData.name,
        symbol: formData.symbol,
        network: formData.network || null,
        minAmount: parseFloat(formData.minAmount),
        maxAmount: parseFloat(formData.maxAmount),
        fee: parseFloat(formData.fee || '0'),
        iconUrl: formData.iconUrl || null,
        iconClass: formData.iconClass || null,
        isActive: true
      }
    };
    
    return apiPost('/withdrawal-platforms', { data: platformData }, {
      showSuccessAlert: true,
      successMessage: app.translator.trans('withdrawal.admin.platforms.add_success').toString(),
      errorMessage: app.translator.trans('withdrawal.admin.platforms.add_error').toString(),
      onSuccess: (response) => {
        app.store.pushPayload(response);
      }
    });
  },

  async toggleStatus(platform: any) {
    const platformId = typeof platform.id === 'function' ? platform.id() : platform.id;
    const currentStatus = (typeof platform.isActive === 'function' ? platform.isActive() : platform.attributes?.isActive) ?? false;
    const record = app.store.getById('withdrawal-platforms', platformId);
    
    if (record) {
      await record.save({ isActive: !currentStatus });
      
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans(`withdrawal.admin.platforms.${!currentStatus ? 'enable' : 'disable'}_success`)
      );
    }
  },

  async delete(platform: any) {
    const platformId = typeof platform.id === 'function' ? platform.id() : platform.id;
    const record = app.store.getById('withdrawal-platforms', platformId);
    if (record) {
      await record.delete();
    }
  },

  async load() {
    return apiGet('/withdrawal-platforms', undefined, {
      errorMessage: app.translator.trans('withdrawal.admin.platforms.load_error').toString(),
      transformResponse: (response) => {
        app.store.pushPayload(response);
        return app.store.all('withdrawal-platforms');
      }
    });
  }
});

// Deposit platform operations
export const createDepositPlatformOperations = (): PlatformOperations<any> => ({
  async create(formData: any) {
    const platformData = {
      type: 'deposit-platforms',
      attributes: {
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
      }
    };
    
    return apiPost('/deposit-platforms', { data: platformData }, {
      showSuccessAlert: true,
      successMessage: app.translator.trans('withdrawal.admin.deposit.platforms.add_success').toString(),
      errorMessage: app.translator.trans('withdrawal.admin.deposit.platforms.add_error').toString(),
      onSuccess: (response) => {
        app.store.pushPayload(response);
      }
    });
  },

  async toggleStatus(platform: any) {
    const platformId = typeof platform.id === 'function' ? platform.id() : platform.id;
    const currentStatus = (typeof platform.isActive === 'function' ? platform.isActive() : platform.attributes?.isActive) ?? false;
    
    return apiPatch(`/deposit-platforms/${platformId}`, {
      data: {
        type: 'deposit-platforms',
        attributes: {
          isActive: !currentStatus
        }
      }
    }, {
      showSuccessAlert: true,
      successMessage: app.translator.trans(`withdrawal.admin.deposit.platforms.${!currentStatus ? 'enable' : 'disable'}_success`).toString(),
      errorMessage: app.translator.trans('withdrawal.admin.deposit.platforms.toggle_error').toString(),
      onSuccess: (response) => {
        app.store.pushPayload(response);
      }
    });
  },

  async delete(platform: any) {
    const platformId = typeof platform.id === 'function' ? platform.id() : platform.id;
    
    return apiDelete(`/deposit-platforms/${platformId}`, {
      errorMessage: app.translator.trans('withdrawal.admin.deposit.platforms.delete_error').toString()
    });
  },

  async load() {
    return apiGet('/deposit-platforms', undefined, {
      errorMessage: app.translator.trans('withdrawal.admin.deposit.platforms.load_error').toString(),
      transformResponse: (response) => {
        app.store.pushPayload(response);
        return app.store.all('deposit-platforms');
      }
    });
  }
});

// Withdrawal request operations
export const createWithdrawalRequestOperations = (): TransactionOperations<any> => ({
  async updateStatus(request: any, status: string) {
    const requestId = typeof request.id === 'function' ? request.id() : request.id;
    const record = app.store.getById('withdrawal-requests', requestId);
    
    if (record) {
      await record.save({ status });
      
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans(`withdrawal.admin.requests.${status}_success`).toString()
      );
    }
  },

  async load() {
    return apiGet('/withdrawal-requests', { include: 'user,platform' }, {
      errorMessage: app.translator.trans('withdrawal.admin.requests.load_error').toString(),
      transformResponse: (response) => {
        app.store.pushPayload(response);
        return Array.isArray(response.data) 
          ? response.data.filter((r: any) => r !== null)
          : (response.data ? [response.data] : []);
      }
    });
  }
});

// Deposit transaction operations
export const createDepositTransactionOperations = (): TransactionOperations<any> => ({
  async updateStatus(transaction: any, status: string) {
    const transactionId = typeof transaction.id === 'function' ? transaction.id() : transaction.id;
    
    return apiPatch(`/deposit-transactions/${transactionId}`, {
      data: {
        type: 'deposit-transactions',
        attributes: {
          status: status
        }
      }
    }, {
      showSuccessAlert: true,
      successMessage: app.translator.trans(`withdrawal.admin.deposit.transactions.${status}_success`).toString(),
      errorMessage: app.translator.trans('withdrawal.admin.deposit.transactions.update_error').toString(),
      onSuccess: (response) => {
        app.store.pushPayload(response);
      }
    });
  },

  async load() {
    return apiGet('/deposit-transactions', undefined, {
      errorMessage: app.translator.trans('withdrawal.admin.deposit.transactions.load_error').toString(),
      transformResponse: (response) => {
        app.store.pushPayload(response);
        return app.store.all('deposit-transactions');
      }
    });
  }
});