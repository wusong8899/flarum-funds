import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Stream from 'flarum/common/utils/Stream';
import icon from 'flarum/common/helpers/icon';
import m from 'mithril';
import type Mithril from 'mithril';

// Withdrawal imports
import type { WithdrawalFormData } from './withdrawal/types/interfaces';
import WithdrawalPlatform from '../../common/models/WithdrawalPlatform';
import WithdrawalForm from './withdrawal/forms/WithdrawalForm';
import TransactionHistory from './shared/TransactionHistory';

// Deposit imports - 简化版本
import type { SimpleDepositFormData } from './deposit/types/interfaces';
import SimpleDepositForm from './deposit/forms/SimpleDepositForm';
import SimpleDepositRecord from '../../common/models/SimpleDepositRecord';
import simpleDepositService from '../../common/services/SimpleDepositService';

// Services
import { withdrawalService, platformService } from '../../common/services';
import { ServiceError } from '../../common/types/services';

// Utilities
import { getAttr, getIdString } from './withdrawal/utils/modelHelpers';
import { extractErrorMessage, type FlarumApiError } from '../../common/types/api';

type TabType = 'withdrawal' | 'deposit';
type SubTabType = 'form' | 'history';

interface FundsPageState {
  // Withdrawal state
  withdrawalPlatforms: WithdrawalPlatform[];
  withdrawalRequests: any[];
  userBalance: number;
  loadingBalance: boolean;
  submitting: boolean;
  
  // Simplified deposit state - 简化的存款状态
  depositRecords: SimpleDepositRecord[];
  submittingDeposit: boolean;
  
  // Shared state
  loading: boolean;
  activeTab: Stream<TabType>;
  withdrawalSubTab: Stream<SubTabType>;
  depositSubTab: Stream<SubTabType>;
}

export default class FundsPage extends Page<any, FundsPageState> {
  state: FundsPageState = {
    withdrawalPlatforms: [],
    withdrawalRequests: [],
    userBalance: 0,
    loadingBalance: true,
    submitting: false,
    depositRecords: [],
    submittingDeposit: false,
    loading: true,
    activeTab: Stream('withdrawal'),
    withdrawalSubTab: Stream('form'),
    depositSubTab: Stream('form')
  };

  // Withdrawal form data
  private withdrawalFormData: WithdrawalFormData = {
    amount: Stream(''),
    selectedPlatform: Stream<WithdrawalPlatform | null>(null),
    accountDetails: Stream(''),
    message: Stream('')
  };

  // 简化的存款表单数据不需要复杂的状态管理

  oninit(vnode: Mithril.VnodeDOM) {
    super.oninit(vnode);

    // Parse URL to determine initial tab and sub-tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    // Handle legacy URL parameters and set appropriate tab/subtab
    if (tabParam) {
      if (tabParam === 'withdrawal' || tabParam === 'withdrawal-history') {
        this.state.activeTab('withdrawal');
        this.state.withdrawalSubTab(tabParam === 'withdrawal-history' ? 'history' : 'form');
      } else if (tabParam === 'deposit' || tabParam === 'deposit-history') {
        this.state.activeTab('deposit');
        this.state.depositSubTab(tabParam === 'deposit-history' ? 'history' : 'form');
      } else if (this.isValidTab(tabParam)) {
        this.state.activeTab(tabParam as TabType);
      }
    }

    // Set page title based on active tab
    this.updatePageTitle();

    // Load data for both systems
    this.loadAllData();
  }


  private isValidTab(tab: string): boolean {
    return ['withdrawal', 'deposit'].includes(tab);
  }

  private isValidSubTab(subTab: string): boolean {
    return ['form', 'history'].includes(subTab);
  }

  private handleSubTabChange(mainTab: TabType, subTab: SubTabType): void {
    if (mainTab === 'withdrawal') {
      this.state.withdrawalSubTab(subTab);
    } else if (mainTab === 'deposit') {
      this.state.depositSubTab(subTab);
    }
    this.updateUrl();
    m.redraw();
  }

  private updateUrl(): void {
    const currentTab = this.state.activeTab();
    const params = new URLSearchParams();
    
    if (currentTab === 'withdrawal') {
      const subTab = this.state.withdrawalSubTab();
      if (subTab === 'history') {
        params.set('tab', 'withdrawal-history');
      } else {
        params.set('tab', 'withdrawal');
      }
    } else if (currentTab === 'deposit') {
      const subTab = this.state.depositSubTab();
      if (subTab === 'history') {
        params.set('tab', 'deposit-history');
      } else {
        params.set('tab', 'deposit');
      }
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }

  private updatePageTitle(): void {
    const tab = this.state.activeTab();
    let titleKey = 'funds.forum.page.title'; // default
    
    switch (tab) {
      case 'withdrawal':
      case 'withdrawal-history':
        titleKey = 'funds.forum.page.title';
        break;
      case 'deposit':
      case 'deposit-history':
        titleKey = 'funds.forum.deposit.page.title';
        break;
    }
    
    // Fixed: Convert NestedStringArray to string using toString()
    const title = app.translator.trans(titleKey);
    app.setTitle(typeof title === 'string' ? title : title.toString());
  }

  view() {
    if (this.state.loading) {
      return (
        <div className="FundsPage">
          <div className="FundsPage-loading">
            <LoadingIndicator />
          </div>
        </div>
      );
    }

    return (
      <div className="FundsPage">
        <div className="FundsPage-modal">
          {this.renderHeader()}
          <div className="FundsPage-content">
            {this.renderActiveTab()}
          </div>
        </div>
      </div>
    );
  }

  private renderHeader(): Mithril.Children {
    const activeTab = this.state.activeTab();
    
    return (
      <div className="FundsPage-header">
        <div className="FundsPage-tabs">
          <div 
            className={`FundsPage-tab ${activeTab === 'withdrawal' ? 'active' : ''}`}
            onclick={() => this.handleTabChange('withdrawal')}
          >
            {app.translator.trans('funds.forum.tabs.funds')}
          </div>
          <div 
            className={`FundsPage-tab ${activeTab === 'deposit' ? 'active' : ''}`}
            onclick={() => this.handleTabChange('deposit')}
          >
            {app.translator.trans('funds.forum.deposit.tabs.deposit')}
          </div>
        </div>
        <Button
          className="FundsPage-close"
          icon="fas fa-times"
          onclick={() => app.history.back()}
        />
      </div>
    );
  }

  private renderActiveTab(): Mithril.Children {
    const activeTab = this.state.activeTab();
    
    switch (activeTab) {
      case 'withdrawal':
        return this.renderWithdrawalTab();
      case 'deposit':
        return this.renderDepositTab();
      default:
        return this.renderWithdrawalTab();
    }
  }

  private renderWithdrawalTab(): Mithril.Children {
    const activeSubTab = this.state.withdrawalSubTab();
    
    return (
      <div className="FundsPage-withdrawalTab">
        {/* Sub-tab navigation */}
        <div className="FundsPage-subTabs">
          <div 
            className={`FundsPage-subTab ${activeSubTab === 'form' ? 'active' : ''}`}
            onclick={() => this.handleSubTabChange('withdrawal', 'form')}
          >
            {app.translator.trans('funds.forum.tabs.funds')}
          </div>
          <div 
            className={`FundsPage-subTab ${activeSubTab === 'history' ? 'active' : ''}`}
            onclick={() => this.handleSubTabChange('withdrawal', 'history')}
          >
            {app.translator.trans('funds.forum.tabs.history')}
          </div>
        </div>
        
        {/* Sub-tab content */}
        {activeSubTab === 'form' ? this.renderWithdrawalForm() : this.renderWithdrawalHistory()}
      </div>
    );
  }

  private renderWithdrawalForm(): Mithril.Children {
    const validPlatforms = (this.state.withdrawalPlatforms || []).filter(platform => !!platform);

    if (validPlatforms.length === 0) {
      return (
        <div className="FundsPage-withdrawalContent">
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
        </div>
      );
    }

    return (
      <div className="FundsPage-withdrawalContent">
        <WithdrawalForm
          platforms={this.state.withdrawalPlatforms}
          formData={this.getWithdrawalFormDataForComponent()}
          loadingBalance={this.state.loadingBalance}
          submitting={this.state.submitting}
          onFormDataChange={this.handleWithdrawalFormDataChange.bind(this)}
          onFillAllAmount={this.handleFillAllAmount.bind(this)}
          onSubmit={this.handleWithdrawalSubmit.bind(this)}
        />
      </div>
    );
  }

  private renderWithdrawalHistory(): Mithril.Children {
    return (
      <div className="FundsPage-withdrawalContent">
        <TransactionHistory
          transactions={this.state.withdrawalRequests}
          platforms={this.state.withdrawalPlatforms}
          loading={false}
          type="withdrawal"
        />
      </div>
    );
  }

  private renderDepositTab(): Mithril.Children {
    const activeSubTab = this.state.depositSubTab();
    
    return (
      <div className="FundsPage-depositTab">
        {/* Sub-tab navigation */}
        <div className="FundsPage-subTabs">
          <div 
            className={`FundsPage-subTab ${activeSubTab === 'form' ? 'active' : ''}`}
            onclick={() => this.handleSubTabChange('deposit', 'form')}
          >
            {app.translator.trans('funds.forum.deposit.tabs.deposit')}
          </div>
          <div 
            className={`FundsPage-subTab ${activeSubTab === 'history' ? 'active' : ''}`}
            onclick={() => this.handleSubTabChange('deposit', 'history')}
          >
            {app.translator.trans('funds.forum.deposit.tabs.history')}
          </div>
        </div>
        
        {/* Sub-tab content */}
        {activeSubTab === 'form' ? this.renderDepositForm() : this.renderDepositHistory()}
      </div>
    );
  }

  private renderDepositForm(): Mithril.Children {
    return (
      <div className="FundsPage-depositContent">
        <SimpleDepositForm
          onSubmit={this.handleSimpleDepositSubmit.bind(this)}
          onCancel={this.handleCancelDepositForm.bind(this)}
          submitting={this.state.submittingDeposit}
        />
      </div>
    );
  }

  private renderDepositHistory(): Mithril.Children {
    const depositRecords = this.state.depositRecords || [];

    if (depositRecords.length === 0) {
      return (
        <div className="FundsPage-depositContent">
          <div className="FundsPage-emptyState">
            <div className="FundsPage-emptyIcon">
              {icon('fas fa-history')}
            </div>
            <h3 className="FundsPage-emptyTitle">
              {app.translator.trans('funds.forum.deposit.simple.no_history', {}, '暂无存款记录')}
            </h3>
            <p className="FundsPage-emptyDescription">
              {app.translator.trans('funds.forum.deposit.simple.no_history_description', {}, '您还没有提交过任何存款申请')}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="FundsPage-depositContent">
        <div className="SimpleDepositHistory">
          {depositRecords.map((record: SimpleDepositRecord) => (
            <div key={record.id()} className="SimpleDepositHistory-item">
              <div className="SimpleDepositHistory-header">
                <span className={`Badge Badge--${record.getStatusColor()}`}>
                  <i className={record.getStatusIcon()}></i>
                  {record.statusText()}
                </span>
                <span className="SimpleDepositHistory-date">
                  {record.formattedCreatedAt()}
                </span>
              </div>
              <div className="SimpleDepositHistory-content">
                <div className="SimpleDepositHistory-address">
                  <strong>{app.translator.trans('funds.forum.deposit.simple.deposit_address', {}, '存款地址')}:</strong>
                  <code>{record.getDisplayAddress()}</code>
                </div>
                {record.hasQrCode() && (
                  <div className="SimpleDepositHistory-qr">
                    <strong>{app.translator.trans('funds.forum.deposit.simple.qr_code_url', {}, '收款二维码')}:</strong>
                    <a href={record.qrCodeUrl()} target="_blank" rel="noopener noreferrer">
                      {app.translator.trans('funds.forum.deposit.simple.view_qr', {}, '查看二维码')}
                    </a>
                  </div>
                )}
                {record.userMessage() && (
                  <div className="SimpleDepositHistory-message">
                    <strong>{app.translator.trans('funds.forum.deposit.simple.user_message', {}, '留言')}:</strong>
                    <p>{record.userMessage()}</p>
                  </div>
                )}
                {record.adminNotes() && (
                  <div className="SimpleDepositHistory-adminNotes">
                    <strong>{app.translator.trans('funds.forum.deposit.simple.admin_notes', {}, '管理员备注')}:</strong>
                    <p>{record.adminNotes()}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 移除复杂的存款选择器和信息显示 - 简化版本不再需要这些方法


  private handleTabChange(tab: TabType): void {
    this.state.activeTab(tab);
    this.updatePageTitle();
    
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    
    // Include current sub-tab in URL
    const currentSubTab = tab === 'withdrawal' ? this.state.withdrawalSubTab() : this.state.depositSubTab();
    url.searchParams.set('subtab', currentSubTab);
    
    window.history.replaceState({}, '', url.toString());
  }


  // Withdrawal methods (copied from WithdrawalPage)
  private getWithdrawalFormDataForComponent() {
    // Fixed: Added null check to prevent invoking null objects
    const selectedPlatform = this.withdrawalFormData.selectedPlatform();
    return {
      selectedPlatform: selectedPlatform,
      amount: this.withdrawalFormData.amount(),
      accountDetails: this.withdrawalFormData.accountDetails(),
      message: this.withdrawalFormData.message()
    };
  }

  private handleWithdrawalFormDataChange(data: Partial<WithdrawalFormData>): void {
    if (data.selectedPlatform !== undefined) {
      this.withdrawalFormData.selectedPlatform(data.selectedPlatform);
    }
    if (data.amount !== undefined) {
      this.withdrawalFormData.amount(data.amount);
    }
    if (data.accountDetails !== undefined) {
      this.withdrawalFormData.accountDetails(data.accountDetails);
    }
    if (data.message !== undefined) {
      this.withdrawalFormData.message(data.message);
    }
  }

  private async handleFillAllAmount(): Promise<void> {
    const selectedPlatform = this.withdrawalFormData.selectedPlatform();
    if (!selectedPlatform) return;

    if (this.state.loadingBalance) return;

    try {
      await this.loadUserBalance(true);

      const fee = getAttr(selectedPlatform, 'fee') || 0;
      const maxAmount = getAttr(selectedPlatform, 'maxAmount') || Infinity;
      let availableAmount = this.state.userBalance - fee;
      
      if (maxAmount < Infinity && availableAmount > maxAmount) {
        availableAmount = maxAmount;
      }
      
      if (availableAmount > 0) {
        this.withdrawalFormData.amount(availableAmount.toString());
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

  private async handleWithdrawalSubmit(): Promise<void> {
    if (this.state.submitting) return;

    const selectedPlatform = this.withdrawalFormData.selectedPlatform();
    const amount = this.withdrawalFormData.amount();
    const accountDetails = this.withdrawalFormData.accountDetails();

    if (!selectedPlatform || !amount || !accountDetails) {
      return;
    }

    // Basic validation
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      app.alerts.show(
        { type: 'warning', dismissible: true },
        app.translator.trans('funds.forum.invalid_amount')
      );
      return;
    }

    this.state.submitting = true;

    try {
      await withdrawalService.submitRequest({
        platformId: parseInt(getIdString(selectedPlatform), 10),
        amount: amountNum,
        accountDetails,
        message: this.withdrawalFormData.message()
      });

      // Clear form
      this.withdrawalFormData.amount('');
      this.withdrawalFormData.accountDetails('');
      this.withdrawalFormData.message('');
      this.withdrawalFormData.selectedPlatform(null);

      // Refresh data
      await Promise.all([
        this.loadUserBalance(true),
        this.loadWithdrawalRequests()
      ]);

      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('funds.forum.submit_success')
      );

    } catch (error: unknown) {
      console.error('Withdrawal request failed:', error);
      
      let errorMessage = app.translator.trans('funds.forum.error').toString();
      
      if (error instanceof ServiceError) {
        errorMessage = error.message;
      } else {
        errorMessage = extractErrorMessage(
          error as FlarumApiError, 
          errorMessage
        );
      }
      
      app.alerts.show(
        { type: 'error', dismissible: true },
        errorMessage
      );
    } finally {
      this.state.submitting = false;
    }
  }

  // Deposit methods - simplified platform selection
  
  // 简化的存款处理方法
  private handleCancelDepositForm(): void {
    // 简单的取消操作，可以添加清空表单逻辑
    m.redraw();
  }

  private async handleSimpleDepositSubmit(data: SimpleDepositFormData): Promise<void> {
    if (this.state.submittingDeposit) return;

    this.state.submittingDeposit = true;
    m.redraw();

    try {
      await simpleDepositService.create(data);
      
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('funds.forum.deposit.simple.submit_success', {}, '存款申请提交成功，请等待管理员审核')
      );

      // 重新加载存款记录
      await this.loadSimpleDepositRecords();

      // 切换到历史标签页显示刚提交的记录
      this.state.depositSubTab('history');

    } catch (error: unknown) {
      console.error('Simple deposit submission failed:', error);
      
      let errorMessage = app.translator.trans('funds.forum.deposit.simple.submit_error', {}, '提交失败，请重试').toString();
      
      if (error instanceof ServiceError) {
        errorMessage = error.message;
      } else {
        errorMessage = extractErrorMessage(
          error as FlarumApiError,
          errorMessage
        );
      }
      
      app.alerts.show(
        { type: 'error', dismissible: true },
        errorMessage
      );
    } finally {
      this.state.submittingDeposit = false;
      m.redraw();
    }
  }


  // Data loading methods
  private async loadAllData(): Promise<void> {
    try {
      await Promise.all([
        this.loadWithdrawalData(),
        this.loadSimpleDepositRecords(),
        this.loadUserBalance()
      ]);
      
      this.state.loading = false;
      m.redraw();
    } catch (error) {
      console.error('Error loading data:', error);
      this.state.loading = false;
      m.redraw();
    }
  }

  /**
   * Load funds platforms and user requests using service layer
   */
  private async loadWithdrawalData(): Promise<void> {
    try {
      const [platforms, requests] = await Promise.all([
        platformService.getActive('withdrawal'),
        withdrawalService.getUserHistory()
      ]);

      this.state.withdrawalPlatforms = platforms as WithdrawalPlatform[];
      this.state.withdrawalRequests = requests;
    } catch (error) {
      console.error('Error loading funds data:', error);
      // Fallback to empty arrays
      this.state.withdrawalPlatforms = [];
      this.state.withdrawalRequests = [];
    }
  }

  /**
   * 加载简化的存款记录
   */
  private async loadSimpleDepositRecords(): Promise<void> {
    try {
      const records = await simpleDepositService.getUserHistory();
      this.state.depositRecords = records;
    } catch (error) {
      console.error('Error loading simple deposit records:', error);
      this.state.depositRecords = [];
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
        
        // Refresh user data through the store
        const updatedUser = await app.store.find('users', userId);
        
        if (updatedUser) {
          this.state.userBalance = parseFloat(updatedUser.attribute('money')) || 0;
        } else {
          this.state.userBalance = 0;
        }
      } else {
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
      const requests = await withdrawalService.getUserHistory();
      this.state.withdrawalRequests = requests;
    } catch (error) {
      console.error('Error loading funds requests:', error);
      this.state.withdrawalRequests = [];
    }
  }

  // 移除复杂的地址生成逻辑 - 简化版本不再需要这个方法
}