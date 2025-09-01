import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Stream from 'flarum/common/utils/Stream';
import icon from 'flarum/common/helpers/icon';
import m from 'mithril';
import type Mithril from 'mithril';
import type { WithdrawalFormData, WithdrawalPageState } from './withdrawal/types/interfaces';
import WithdrawalPlatform from '../../common/models/WithdrawalPlatform';
import WithdrawalForm from './withdrawal/forms/WithdrawalForm';
import TransactionHistory from './shared/TransactionHistory';
import { getAttr, getIdString } from './withdrawal/utils/modelHelpers';
import { extractErrorMessage, type FlarumApiError } from '../../common/types/api';
import { withdrawalService } from '../../common/services';
import { ServiceError } from '../../common/types/services';

export default class WithdrawalPage extends Page<any, any> {
  state: WithdrawalPageState = {
    platforms: [],
    requests: [],
    loading: true,
    loadingBalance: true,
    userBalance: 0,
    submitting: false,
    activeTab: Stream('funds')
  };

  private formData: WithdrawalFormData = {
    amount: Stream(''),
    selectedPlatform: Stream<WithdrawalPlatform | null>(null),
    accountDetails: Stream(''),
    message: Stream('')
  };

  oninit(vnode: Mithril.VnodeDOM) {
    super.oninit(vnode);

    app.setTitle(app.translator.trans('funds.forum.page.title').toString());

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
            {this.state.activeTab() === 'funds' ? this.renderWithdrawalTab() : this.renderHistoryTab()}
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
            className={`WithdrawalPage-tab ${this.state.activeTab() === 'funds' ? 'active' : ''}`}
            onclick={() => this.handleTabChange('funds')}
          >
            {app.translator.trans('funds.forum.tabs.funds')}
          </div>
          <div 
            className={`WithdrawalPage-tab ${this.state.activeTab() === 'history' ? 'active' : ''}`}
            onclick={() => this.handleTabChange('history')}
          >
            {app.translator.trans('funds.forum.tabs.history')}
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
            {app.translator.trans('funds.forum.no_platforms')}
          </h3>
          <p className="WithdrawalPage-emptyDescription">
            {app.translator.trans('funds.forum.no_platforms_description')}
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

  private handleTabChange(tab: 'funds' | 'history'): void {
    this.state.activeTab(tab);
  }

  private getFormDataForComponent() {
    return {
      selectedPlatform: this.formData.selectedPlatform(),
      amount: this.formData.amount(),
      accountDetails: this.formData.accountDetails()
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
          app.translator.trans('funds.forum.insufficient_balance')
        );
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('funds.forum.balance_refresh_error')
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
        app.translator.trans('funds.forum.invalid_amount')
      );
      return;
    }
    
    // 检查平台限额
    const minAmount = getAttr(selectedPlatform, 'minAmount') || 0;
    const maxAmount = getAttr(selectedPlatform, 'maxAmount') || Infinity;
    
    if (amountNum < minAmount) {
      app.alerts.show(
        { type: 'warning', dismissible: true },
        app.translator.trans('funds.forum.amount_below_minimum', { 
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
        app.translator.trans('funds.forum.amount_above_maximum', { 
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
      const feeText = fee > 0 ? app.translator.trans('funds.forum.including_fee', { fee }) : '';
      app.alerts.show(
        { type: 'warning', dismissible: true },
        app.translator.trans('funds.forum.insufficient_balance_detailed', {
          required: totalRequired,
          available: this.state.userBalance,
          feeText
        })
      );
      return;
    }

    this.state.submitting = true;

    try {
      await withdrawalService.submitRequest({
        platformId: parseInt(getIdString(selectedPlatform)),
        amount: parseFloat(amount),
        accountDetails,
        message: this.formData.message()
      });

      this.formData.amount('');
      this.formData.accountDetails('');
      this.formData.message('');
      this.formData.selectedPlatform(null);

      this.loadUserBalance();
      this.loadWithdrawalRequests();

      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('funds.forum.submit_success')
      );

    } catch (error: unknown) {
      console.error('Withdrawal request failed:', error);
      
      const errorMessage = error instanceof ServiceError 
        ? error.message 
        : extractErrorMessage(
            error as FlarumApiError, 
            app.translator.trans('funds.forum.error').toString()
          );
      
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
      console.log('Starting to load funds data...');
      
      const [platforms, requests] = await Promise.all([
        withdrawalService.getPlatforms(),
        withdrawalService.getUserHistory()
      ]);

      this.state.platforms = platforms;
      this.state.requests = requests;
      
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
        const userId = app.session.user.id();
        if (!userId) {
          throw new Error('User ID not available');
        }
        
        // 从服务器获取最新用户数据
        const updatedUser = await app.store.find('users', userId);
        
        if (updatedUser) {
          this.state.userBalance = parseFloat(updatedUser.attribute('money')) || 0;
        } else {
          this.state.userBalance = 0;
        }
      } else {
        // 使用当前缓存的用户数据
        this.state.userBalance = parseFloat(app.session.user?.attribute('money') || '0');
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
      this.state.requests = await withdrawalService.getUserHistory();
    } catch (error) {
      console.error('Error loading funds requests:', error);
    }
  }
}
