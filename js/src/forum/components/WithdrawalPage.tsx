import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Stream from 'flarum/common/utils/Stream';
import icon from 'flarum/common/helpers/icon';
import m from 'mithril';
import type Mithril from 'mithril';
import type { WithdrawalPlatform, WithdrawalFormData, WithdrawalPageState } from './withdrawal/types/interfaces';
import WithdrawalForm from './withdrawal/forms/WithdrawalForm';
import TransactionHistory from './shared/TransactionHistory';
import { getAttr, getIdString } from './withdrawal/utils/modelHelpers';

export default class WithdrawalPage extends Page {
  private state: WithdrawalPageState = {
    platforms: [],
    requests: [],
    loading: true,
    loadingBalance: true,
    userBalance: 0,
    submitting: false,
    activeTab: Stream('withdrawal')
  };

  private formData: WithdrawalFormData = {
    amount: Stream(''),
    selectedPlatform: Stream<WithdrawalPlatform | null>(null),
    accountDetails: Stream(''),
    message: Stream(''),
    saveAddress: Stream(false)
  };

  oninit(vnode: Mithril.VnodeDOM) {
    super.oninit(vnode);

    app.setTitle(app.translator.trans('withdrawal.forum.page.title'));

    this.loadData();
    this.loadUserBalance();
  }

  view() {
    if (this.state.loading) {
      return (
        <div className="WithdrawalPage">
          <div className="WithdrawalPage-loading">
            <LoadingIndicator />
          </div>
        </div>
      );
    }

    return (
      <div className="WithdrawalPage">
        <div className="WithdrawalPage-modal">
          {this.renderHeader()}
          <div className="WithdrawalPage-content">
            {this.state.activeTab() === 'withdrawal' ? this.renderWithdrawalTab() : this.renderHistoryTab()}
          </div>
        </div>
      </div>
    );
  }

  private renderHeader(): Mithril.Children {
    return (
      <div className="WithdrawalPage-header">
        <div className="WithdrawalPage-tabs">
          <div 
            className={`WithdrawalPage-tab ${this.state.activeTab() === 'withdrawal' ? 'active' : ''}`}
            onclick={() => this.handleTabChange('withdrawal')}
          >
            {app.translator.trans('withdrawal.forum.tabs.withdrawal')}
          </div>
          <div 
            className={`WithdrawalPage-tab ${this.state.activeTab() === 'history' ? 'active' : ''}`}
            onclick={() => this.handleTabChange('history')}
          >
            {app.translator.trans('withdrawal.forum.tabs.history')}
          </div>
        </div>
        <Button
          className="WithdrawalPage-close"
          icon="fas fa-times"
          onclick={() => app.history.back()}
        />
      </div>
    );
  }

  private renderWithdrawalTab(): Mithril.Children {
    const validPlatforms = (this.state.platforms || []).filter(platform => !!platform);

    if (validPlatforms.length === 0) {
      return (
        <div className="WithdrawalPage-emptyState">
          <div className="WithdrawalPage-emptyIcon">
            {icon('fas fa-coins')}
          </div>
          <h3 className="WithdrawalPage-emptyTitle">
            {app.translator.trans('withdrawal.forum.no_platforms')}
          </h3>
          <p className="WithdrawalPage-emptyDescription">
            {app.translator.trans('withdrawal.forum.no_platforms_description')}
          </p>
        </div>
      );
    }

    return (
      <WithdrawalForm
        platforms={this.state.platforms}
        formData={this.getFormDataForComponent()}
        loadingBalance={this.state.loadingBalance}
        submitting={this.state.submitting}
        onFormDataChange={this.handleFormDataChange.bind(this)}
        onFillAllAmount={this.handleFillAllAmount.bind(this)}
        onSubmit={this.handleSubmit.bind(this)}
      />
    );
  }

  private renderHistoryTab(): Mithril.Children {
    return (
      <TransactionHistory
        transactions={this.state.requests}
        platforms={this.state.platforms}
        loading={false}
        type="withdrawal"
      />
    );
  }

  private handleTabChange(tab: 'withdrawal' | 'history'): void {
    this.state.activeTab(tab);
  }

  private getFormDataForComponent() {
    return {
      selectedPlatform: this.formData.selectedPlatform(),
      amount: this.formData.amount(),
      accountDetails: this.formData.accountDetails(),
      saveAddress: this.formData.saveAddress()
    };
  }

  private handleFormDataChange(data: Partial<WithdrawalFormData>): void {
    if (data.selectedPlatform !== undefined) {
      this.formData.selectedPlatform(data.selectedPlatform);
    }
    if (data.amount !== undefined) {
      this.formData.amount(data.amount);
    }
    if (data.accountDetails !== undefined) {
      this.formData.accountDetails(data.accountDetails);
    }
    if (data.saveAddress !== undefined) {
      this.formData.saveAddress(data.saveAddress);
    }
  }

  private async handleFillAllAmount(): Promise<void> {
    const selectedPlatform = this.formData.selectedPlatform();
    if (!selectedPlatform) return;

    // 防止重复点击
    if (this.state.loadingBalance) return;

    try {
      // 从服务器重新获取最新余额
      await this.loadUserBalance(true);

      const fee = getAttr(selectedPlatform, 'fee') || 0;
      const maxAmount = getAttr(selectedPlatform, 'maxAmount') || Infinity;
      let availableAmount = this.state.userBalance - fee;
      
      if (maxAmount < Infinity && availableAmount > maxAmount) {
        availableAmount = maxAmount;
      }
      
      if (availableAmount > 0) {
        this.formData.amount(availableAmount.toString());
      } else {
        app.alerts.show(
          { type: 'warning', dismissible: true },
          app.translator.trans('withdrawal.forum.insufficient_balance')
        );
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.forum.balance_refresh_error')
      );
    }
  }

  private async handleSubmit(): Promise<void> {
    if (this.state.submitting) return;

    const selectedPlatform = this.formData.selectedPlatform();
    const amount = this.formData.amount();
    const accountDetails = this.formData.accountDetails();

    if (!selectedPlatform || !amount || !accountDetails) {
      return;
    }

    // 前端预验证
    const amountNum = parseFloat(amount);
    
    // 检查金额是否有效
    if (isNaN(amountNum) || amountNum <= 0) {
      app.alerts.show(
        { type: 'warning', dismissible: true },
        app.translator.trans('withdrawal.forum.invalid_amount')
      );
      return;
    }
    
    // 检查平台限额
    const minAmount = getAttr(selectedPlatform, 'minAmount') || 0;
    const maxAmount = getAttr(selectedPlatform, 'maxAmount') || Infinity;
    
    if (amountNum < minAmount) {
      app.alerts.show(
        { type: 'warning', dismissible: true },
        app.translator.trans('withdrawal.forum.amount_below_minimum', { 
          amount: amountNum, 
          minimum: minAmount,
          platform: getAttr(selectedPlatform, 'name') 
        })
      );
      return;
    }
    
    if (amountNum > maxAmount) {
      app.alerts.show(
        { type: 'warning', dismissible: true },
        app.translator.trans('withdrawal.forum.amount_above_maximum', { 
          amount: amountNum, 
          maximum: maxAmount,
          platform: getAttr(selectedPlatform, 'name') 
        })
      );
      return;
    }
    
    // 检查余额
    const fee = getAttr(selectedPlatform, 'fee') || 0;
    const totalRequired = amountNum + fee;
    
    if (this.state.userBalance < totalRequired) {
      const feeText = fee > 0 ? app.translator.trans('withdrawal.forum.including_fee', { fee }) : '';
      app.alerts.show(
        { type: 'warning', dismissible: true },
        app.translator.trans('withdrawal.forum.insufficient_balance_detailed', {
          required: totalRequired,
          available: this.state.userBalance,
          feeText
        })
      );
      return;
    }

    this.state.submitting = true;

    try {
      const response = await app.request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/withdrawal-requests',
        body: {
          data: {
            type: 'withdrawal-requests',
            attributes: {
              platformId: getIdString(selectedPlatform),
              amount: parseFloat(amount),
              accountDetails,
              message: this.formData.message(),
              saveAddress: this.formData.saveAddress()
            }
          }
        }
      });

      app.store.pushPayload(response);

      this.formData.amount('');
      this.formData.accountDetails('');
      this.formData.message('');
      if (!this.formData.saveAddress()) {
        this.formData.selectedPlatform(null);
      }

      this.loadUserBalance();
      this.loadWithdrawalRequests();

      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('withdrawal.forum.submit_success')
      );

    } catch (error) {
      console.error('Withdrawal request failed:', error);
      
      // 尝试解析后端验证错误消息
      let errorMessage = app.translator.trans('withdrawal.forum.error');
      
      if (error && error.response && error.response.errors) {
        const errors = error.response.errors;
        if (Array.isArray(errors) && errors.length > 0) {
          // 获取第一个错误的详细信息
          const firstError = errors[0];
          if (firstError.detail) {
            errorMessage = firstError.detail;
          } else if (firstError.source && firstError.source.pointer) {
            // 尝试从source.pointer获取字段名
            const field = firstError.source.pointer.split('/').pop();
            errorMessage = `${field}: ${firstError.title || firstError.detail || 'Validation error'}`;
          }
        }
      } else if (error && error.responseText) {
        // 检查是否是HTML错误响应（PHP Fatal Error）
        if (error.responseText.includes('<b>Fatal error</b>') || error.responseText.includes('<!DOCTYPE')) {
          errorMessage = app.translator.trans('withdrawal.forum.server_error');
        } else {
          try {
            const response = JSON.parse(error.responseText);
            if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
              const firstError = response.errors[0];
              if (firstError.detail) {
                errorMessage = firstError.detail;
              }
            }
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError);
            // 如果解析失败，使用通用错误消息
            errorMessage = app.translator.trans('withdrawal.forum.server_error');
          }
        }
      }
      
      app.alerts.show(
        { type: 'error', dismissible: true },
        errorMessage
      );
    } finally {
      this.state.submitting = false;
    }
  }

  private async loadData(): Promise<void> {
    try {
      console.log('Starting to load withdrawal data...');
      
      const [platformsResponse, requestsResponse] = await Promise.all([
        app.request({
          method: 'GET',
          url: app.forum.attribute('apiUrl') + '/withdrawal-platforms'
        }),
        app.request({
          method: 'GET', 
          url: app.forum.attribute('apiUrl') + '/withdrawal-requests'
        })
      ]);

      console.log('Platforms response:', platformsResponse);
      console.log('Requests response:', requestsResponse);

      app.store.pushPayload(platformsResponse);
      app.store.pushPayload(requestsResponse);

      this.state.platforms = app.store.all('withdrawal-platforms');
      this.state.requests = app.store.all('withdrawal-requests');
      
      console.log('Loaded platforms:', this.state.platforms);
      console.log('Loaded requests:', this.state.requests);
      
      this.state.loading = false;
      m.redraw();
    } catch (error) {
      console.error('Error loading data:', error);
      this.state.loading = false;
      m.redraw();
    }
  }

  private async loadUserBalance(forceRefresh = false): Promise<void> {
    try {
      this.state.loadingBalance = true;
      
      if (forceRefresh && app.session.user) {
        // 从服务器获取最新用户数据
        const response = await app.request({
          method: 'GET',
          url: `${app.forum.attribute('apiUrl')}/users/${app.session.user.id()}`
        });
        
        app.store.pushPayload(response);
        
        // 更新当前用户实例
        const updatedUser = app.store.getById('users', app.session.user.id());
        if (updatedUser) {
          this.state.userBalance = parseFloat(updatedUser.attribute('money')) || 0;
        } else {
          this.state.userBalance = 0;
        }
      } else {
        // 使用当前缓存的用户数据
        this.state.userBalance = parseFloat(app.session.user?.attribute('money')) || 0;
      }
      
      this.state.loadingBalance = false;
      m.redraw();
    } catch (error) {
      console.error('Error loading user balance:', error);
      this.state.loadingBalance = false;
      m.redraw();
    }
  }

  private async loadWithdrawalRequests(): Promise<void> {
    try {
      const response = await app.request({
        method: 'GET',
        url: app.forum.attribute('apiUrl') + '/withdrawal-requests'
      });

      app.store.pushPayload(response);
      this.state.requests = app.store.all('withdrawal-requests');
    } catch (error) {
      console.error('Error loading withdrawal requests:', error);
    }
  }
}
