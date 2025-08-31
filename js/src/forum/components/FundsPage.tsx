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

// Deposit imports
import type { DepositFormData, DepositAddressData } from './deposit/types/interfaces';
import type DepositPlatform from '../../common/models/DepositPlatform';
import DepositPlatformDropdown from './deposit/selectors/DepositPlatformDropdown';
import AddressDisplay from './deposit/components/AddressDisplay';
import ImageDisplay from './deposit/components/ImageDisplay';
import DepositRecordForm from './deposit/forms/DepositRecordForm';
import type { DepositRecordFormData } from './deposit/forms/DepositRecordForm';

// Services
import { withdrawalService, depositService, platformService } from '../../common/services';
import { ServiceError } from '../../common/types/services';

// Utilities
import { getAttr, getIdString, getDateFromAttr } from './withdrawal/utils/modelHelpers';
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
  
  // Deposit state
  depositPlatforms: DepositPlatform[];
  depositRecords: any[];
  submittingDepositRecord: boolean;
  
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
    depositPlatforms: [],
    depositRecords: [],
    submittingDepositRecord: false,
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

  // Deposit form data and address - Fixed: Added missing userMessage property
  private depositFormData: DepositFormData = {
    selectedPlatform: Stream<DepositPlatform | null>(null),
    userMessage: Stream('')
  };

  private depositAddressData: DepositAddressData = {
    address: '',
    platform: null as any,
    loading: false
  };

  // Platform-based selection for deposits  
  private availablePlatforms: DepositPlatform[] = [];

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
    const availablePlatforms = (this.state.depositPlatforms || []).filter(platform => 
      platform && getAttr(platform, 'isActive')
    );

    if (availablePlatforms.length === 0) {
      return (
        <div className="FundsPage-depositContent">
          <div className="FundsPage-emptyState">
            <div className="FundsPage-emptyIcon">
              {icon('fas fa-coins')}
            </div>
            <h3 className="FundsPage-emptyTitle">
              {app.translator.trans('funds.forum.deposit.no_platforms')}
            </h3>
            <p className="FundsPage-emptyDescription">
              {app.translator.trans('funds.forum.deposit.no_platforms_description')}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="FundsPage-depositContent">
        {this.renderDepositSelectors()}
        {this.renderDepositInfo()}
      </div>
    );
  }

  private renderDepositHistory(): Mithril.Children {
    // Use only deposit records for history
    const allDepositHistory = [...this.state.depositRecords];
    
    // Sort by creation date (newest first)
    allDepositHistory.sort((a, b) => {
      const dateA = getDateFromAttr(a, 'createdAt') || new Date(0);
      const dateB = getDateFromAttr(b, 'createdAt') || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    return (
      <div className="FundsPage-depositContent">
        <TransactionHistory
          transactions={allDepositHistory}
          platforms={this.state.depositPlatforms}
          loading={false}
          type="deposit"
        />
      </div>
    );
  }

  private renderDepositSelectors(): Mithril.Children {
    return (
      <div className="FundsPage-selectors">
        <DepositPlatformDropdown
          platforms={this.availablePlatforms}
          selectedPlatform={this.depositFormData.selectedPlatform()}
          onPlatformSelect={(platform: DepositPlatform) => this.handlePlatformSelect(platform)}
        />
      </div>
    );
  }

  private renderDepositInfo(): Mithril.Children {
    const platform = this.depositFormData.selectedPlatform();
    
    if (!platform) {
      return (
        <div className="FundsPage-selectPrompt">
          <p>{app.translator.trans('funds.forum.deposit.select_platform')}</p>
        </div>
      );
    }

    const minAmount = getAttr(platform, 'minAmount') || 0;
    const warningText = getAttr(platform, 'warningText') || 
      app.translator.trans('funds.forum.deposit.default_warning', {
        currency: getAttr(platform, 'symbol'),
        network: getAttr(platform, 'network'),
        minAmount
      });

    return (
      <div className="FundsPage-depositInfo">
        <p className="FundsPage-instructionText">
          {app.translator.trans('funds.forum.deposit.scan_or_use_address')}
        </p>
        
        <AddressDisplay
          address={this.depositAddressData.address}
          loading={this.depositAddressData.loading}
          onCopy={this.handleCopyAddress.bind(this)}
        />
        
        <p className="FundsPage-minAmountText">
          {app.translator.trans('funds.forum.deposit.min_amount', {
            amount: minAmount,
            currency: getAttr(platform, 'symbol')
          })}
        </p>
        
        {(() => {
          const fee = getAttr(platform, 'fee') || 0;
          if (fee > 0) {
            return (
              <p className="FundsPage-feeText">
                {app.translator.trans('funds.forum.deposit.fee', {
                  fee: fee,
                  currency: getAttr(platform, 'symbol')
                })}
              </p>
            );
          }
          return null;
        })()}
        
        {/* Only show image container if platform has qrCodeImageUrl */}
        {this.depositAddressData.platform && this.depositAddressData.platform.qrCodeImageUrl && this.depositAddressData.platform.qrCodeImageUrl() && (
          <div className="FundsPage-imageContainer">
            <ImageDisplay
              platform={this.depositAddressData.platform}
              loading={this.depositAddressData.loading}
              size={160}
            />
          </div>
        )}
        
        <div className="FundsPage-infoPanel">
          <i className="fas fa-info-circle"></i>
          <span>{warningText}</span>
        </div>

        {/* Deposit Record Submission Section */}
        <div className="FundsPage-recordSection">
          <div className="FundsPage-recordHeader">
            <h4>{app.translator.trans('funds.forum.deposit.record.section_title')}</h4>
          </div>
          
          <DepositRecordForm
            platform={platform}
            onSubmit={this.handleDepositRecordSubmit.bind(this)}
            onCancel={this.handleCancelDepositRecordForm.bind(this)}
            submitting={this.state.submittingDepositRecord}
          />
        </div>
      </div>
    );
  }


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
  
  private handlePlatformSelect(platform: DepositPlatform): void {
    this.depositFormData.selectedPlatform(platform);
    this.loadDepositAddress(platform);
  }

  private handleCopyAddress(): void {
    if (this.depositAddressData.address) {
      navigator.clipboard.writeText(this.depositAddressData.address).then(() => {
        app.alerts.show(
          { type: 'success', dismissible: true },
          app.translator.trans('funds.forum.deposit.address_copied')
        );
      }).catch(() => {
        app.alerts.show(
          { type: 'error', dismissible: true },
          app.translator.trans('funds.forum.deposit.copy_failed')
        );
      });
    }
  }

  private handleCancelDepositRecordForm(): void {
    // Just clear the form - form remains visible
    m.redraw();
  }

  private async handleDepositRecordSubmit(data: DepositRecordFormData): Promise<void> {
    if (this.state.submittingDepositRecord) return;

    this.state.submittingDepositRecord = true;
    m.redraw();

    try {
      await depositService.create({
        platformId: data.platformId,
        platformAccount: data.platformAccount,
        realName: data.realName,
        amount: data.amount,
        depositTime: data.depositTime.toISOString(),
        screenshotUrl: data.screenshotUrl,
        userMessage: data.userMessage,
        status: 'pending'
      });

      // Show success message (form remains visible for new submissions)
      
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('funds.forum.deposit.record.submit_success')
      );

      // Reload deposit history
      await this.loadDepositRecords();

    } catch (error: unknown) {
      console.error('Deposit record submission failed:', error);
      
      let errorMessage = app.translator.trans('funds.forum.deposit.record.submit_error').toString();
      
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
      this.state.submittingDepositRecord = false;
      m.redraw();
    }
  }


  // Data loading methods
  private async loadAllData(): Promise<void> {
    try {
      await Promise.all([
        this.loadWithdrawalData(),
        this.loadDepositData(),
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
   * Load deposit platforms and user records using service layer
   */
  private async loadDepositData(): Promise<void> {
    try {
      const [platforms, records] = await Promise.all([
        platformService.getActive('deposit'),
        depositService.getUserHistory()
      ]);

      this.state.depositPlatforms = platforms as DepositPlatform[];
      this.state.depositRecords = records;
      
      // Filter active platforms
      this.availablePlatforms = platforms.filter(platform => getAttr(platform, 'isActive')) as DepositPlatform[];
    } catch (error) {
      console.error('Error loading deposit data:', error);
      // Fallback to empty arrays
      this.state.depositPlatforms = [];
      this.state.depositRecords = [];
      this.availablePlatforms = [];
    }
  }

  private async loadDepositRecords(): Promise<void> {
    try {
      const records = await depositService.getUserHistory();
      this.state.depositRecords = records;
    } catch (error) {
      console.error('Error loading deposit records:', error);
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

  private async loadDepositAddress(platform: DepositPlatform): Promise<void> {
    this.depositAddressData.loading = true;
    m.redraw();

    try {
      const address = await depositService.generateAddress(parseInt(getAttr(platform, 'id'), 10));
      
      this.depositAddressData = {
        address,
        platform,
        loading: false
      };

      m.redraw();
    } catch (error) {
      console.error('Error loading deposit address:', error);
      this.depositAddressData.loading = false;
      
      let errorMessage = app.translator.trans('funds.forum.deposit.address_load_error').toString();
      
      if (error instanceof ServiceError) {
        errorMessage = error.message;
      }
      
      app.alerts.show(
        { type: 'error', dismissible: true },
        errorMessage
      );
      
      m.redraw();
    }
  }
}