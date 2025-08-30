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
import ImageDisplay from './deposit/components/QRCodeDisplay';
import DepositRecordForm from './deposit/forms/DepositRecordForm';
import type { DepositRecordFormData } from './deposit/forms/DepositRecordForm';

// Utilities
import { getAttr, getIdString, getDateFromAttr } from './withdrawal/utils/modelHelpers';
import { extractErrorMessage, assertApiPayload, type FlarumApiError } from '../../common/types/api';

type TabType = 'withdrawal' | 'deposit' | 'withdrawal-history' | 'deposit-history';

interface FundsPageState {
  // Withdrawal state
  withdrawalPlatforms: WithdrawalPlatform[];
  withdrawalRequests: any[];
  userBalance: number;
  loadingBalance: boolean;
  submitting: boolean;
  
  // Deposit state
  depositPlatforms: DepositPlatform[];
  depositTransactions: any[];
  depositRecords: any[];
  showDepositRecordForm: boolean;
  submittingDepositRecord: boolean;
  
  // Shared state
  loading: boolean;
  activeTab: Stream<TabType>;
}

export default class FundsPage extends Page<any, FundsPageState> {
  state: FundsPageState = {
    withdrawalPlatforms: [],
    withdrawalRequests: [],
    userBalance: 0,
    loadingBalance: true,
    submitting: false,
    depositPlatforms: [],
    depositTransactions: [],
    depositRecords: [],
    showDepositRecordForm: false,
    submittingDepositRecord: false,
    loading: true,
    activeTab: Stream('withdrawal')
  };

  // Withdrawal form data
  private withdrawalFormData: WithdrawalFormData = {
    amount: Stream(''),
    selectedPlatform: Stream<WithdrawalPlatform | null>(null),
    accountDetails: Stream(''),
    message: Stream(''),
    saveAddress: Stream(false)
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

    // Parse URL to determine initial tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const pathTab = this.getTabFromPath();
    
    if (pathTab) {
      this.state.activeTab(pathTab);
    } else if (tabParam && this.isValidTab(tabParam)) {
      this.state.activeTab(tabParam as TabType);
    }

    // Set page title based on active tab
    this.updatePageTitle();

    // Load data for both systems
    this.loadAllData();
  }

  private getTabFromPath(): TabType | null {
    const path = window.location.pathname;
    if (path.includes('/funds/withdrawal')) return 'withdrawal';
    if (path.includes('/funds/deposit')) return 'deposit';
    if (path.includes('/funds/withdrawal-history')) return 'withdrawal-history';
    if (path.includes('/funds/deposit-history')) return 'deposit-history';
    return null;
  }

  private isValidTab(tab: string): boolean {
    return ['withdrawal', 'deposit', 'withdrawal-history', 'deposit-history'].includes(tab);
  }

  private updatePageTitle(): void {
    const tab = this.state.activeTab();
    let titleKey = 'withdrawal.forum.page.title'; // default
    
    switch (tab) {
      case 'withdrawal':
      case 'withdrawal-history':
        titleKey = 'withdrawal.forum.page.title';
        break;
      case 'deposit':
      case 'deposit-history':
        titleKey = 'withdrawal.forum.deposit.page.title';
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
            {app.translator.trans('withdrawal.forum.tabs.withdrawal')}
          </div>
          <div 
            className={`FundsPage-tab ${activeTab === 'deposit' ? 'active' : ''}`}
            onclick={() => this.handleTabChange('deposit')}
          >
            {app.translator.trans('withdrawal.forum.deposit.tabs.deposit')}
          </div>
          <div 
            className={`FundsPage-tab ${activeTab === 'withdrawal-history' ? 'active' : ''}`}
            onclick={() => this.handleTabChange('withdrawal-history')}
          >
            {app.translator.trans('withdrawal.forum.tabs.history')}
          </div>
          <div 
            className={`FundsPage-tab ${activeTab === 'deposit-history' ? 'active' : ''}`}
            onclick={() => this.handleTabChange('deposit-history')}
          >
            {app.translator.trans('withdrawal.forum.deposit.tabs.history')}
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
      case 'withdrawal-history':
        return this.renderWithdrawalHistoryTab();
      case 'deposit-history':
        return this.renderDepositHistoryTab();
      default:
        return this.renderWithdrawalTab();
    }
  }

  private renderWithdrawalTab(): Mithril.Children {
    const validPlatforms = (this.state.withdrawalPlatforms || []).filter(platform => !!platform);

    if (validPlatforms.length === 0) {
      return (
        <div className="FundsPage-withdrawalTab">
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
        </div>
      );
    }

    return (
      <div className="FundsPage-withdrawalTab">
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

  private renderDepositTab(): Mithril.Children {
    const availablePlatforms = (this.state.depositPlatforms || []).filter(platform => 
      platform && getAttr(platform, 'isActive')
    );

    if (availablePlatforms.length === 0) {
      return (
        <div className="FundsPage-emptyState">
          <div className="FundsPage-emptyIcon">
            {icon('fas fa-coins')}
          </div>
          <h3 className="FundsPage-emptyTitle">
            {app.translator.trans('withdrawal.forum.deposit.no_platforms')}
          </h3>
          <p className="FundsPage-emptyDescription">
            {app.translator.trans('withdrawal.forum.deposit.no_platforms_description')}
          </p>
        </div>
      );
    }

    return (
      <div className="FundsPage-depositTab">
        {this.renderDepositSelectors()}
        {this.renderDepositInfo()}
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
          <p>{app.translator.trans('withdrawal.forum.deposit.select_platform')}</p>
        </div>
      );
    }

    const minAmount = getAttr(platform, 'minAmount') || 0;
    const warningText = getAttr(platform, 'warningText') || 
      app.translator.trans('withdrawal.forum.deposit.default_warning', {
        currency: getAttr(platform, 'symbol'),
        network: getAttr(platform, 'network'),
        minAmount
      });

    return (
      <div className="FundsPage-depositInfo">
        <p className="FundsPage-instructionText">
          {app.translator.trans('withdrawal.forum.deposit.scan_or_use_address')}
        </p>
        
        <AddressDisplay
          address={this.depositAddressData.address}
          loading={this.depositAddressData.loading}
          onCopy={this.handleCopyAddress.bind(this)}
        />
        
        <p className="FundsPage-minAmountText">
          {app.translator.trans('withdrawal.forum.deposit.min_amount', {
            amount: minAmount,
            currency: getAttr(platform, 'symbol')
          })}
        </p>
        
        {(() => {
          const fee = getAttr(platform, 'fee') || 0;
          if (fee > 0) {
            return (
              <p className="FundsPage-feeText">
                {app.translator.trans('withdrawal.forum.deposit.fee', {
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
            <h4>{app.translator.trans('withdrawal.forum.deposit.record.section_title')}</h4>
            <Button
              className="Button Button--primary FundsPage-recordButton"
              onclick={this.handleToggleDepositRecordForm.bind(this)}
              disabled={this.state.submittingDepositRecord}
            >
              {this.state.showDepositRecordForm 
                ? app.translator.trans('withdrawal.forum.deposit.record.hide_form')
                : app.translator.trans('withdrawal.forum.deposit.record.show_form')
              }
            </Button>
          </div>
          
          {this.state.showDepositRecordForm && (
            <DepositRecordForm
              platform={platform}
              onSubmit={this.handleDepositRecordSubmit.bind(this)}
              onCancel={this.handleCancelDepositRecordForm.bind(this)}
              submitting={this.state.submittingDepositRecord}
            />
          )}
        </div>
      </div>
    );
  }

  private renderWithdrawalHistoryTab(): Mithril.Children {
    return (
      <div className="FundsPage-withdrawalTab">
        <TransactionHistory
          transactions={this.state.withdrawalRequests}
          platforms={this.state.withdrawalPlatforms}
          loading={false}
          type="withdrawal"
        />
      </div>
    );
  }

  private renderDepositHistoryTab(): Mithril.Children {
    // Combine deposit transactions and deposit records
    const allDepositHistory = [...this.state.depositTransactions, ...this.state.depositRecords];
    
    // Sort by creation date (newest first)
    allDepositHistory.sort((a, b) => {
      const dateA = getDateFromAttr(a, 'createdAt') || new Date(0);
      const dateB = getDateFromAttr(b, 'createdAt') || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    return (
      <TransactionHistory
        transactions={allDepositHistory}
        platforms={this.state.depositPlatforms}
        loading={false}
        type="deposit"
      />
    );
  }

  private handleTabChange(tab: TabType): void {
    this.state.activeTab(tab);
    this.updatePageTitle();
    
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
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
      message: this.withdrawalFormData.message(),
      saveAddress: this.withdrawalFormData.saveAddress()
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
    if (data.saveAddress !== undefined) {
      this.withdrawalFormData.saveAddress(data.saveAddress);
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

  private async handleWithdrawalSubmit(): Promise<void> {
    if (this.state.submitting) return;

    const selectedPlatform = this.withdrawalFormData.selectedPlatform();
    const amount = this.withdrawalFormData.amount();
    const accountDetails = this.withdrawalFormData.accountDetails();

    if (!selectedPlatform || !amount || !accountDetails) {
      return;
    }

    // Validation logic (copied from WithdrawalPage)
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      app.alerts.show(
        { type: 'warning', dismissible: true },
        app.translator.trans('withdrawal.forum.invalid_amount')
      );
      return;
    }
    
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
              message: this.withdrawalFormData.message(),
              saveAddress: this.withdrawalFormData.saveAddress()
            }
          }
        }
      });

      app.store.pushPayload(assertApiPayload(response));

      this.withdrawalFormData.amount('');
      this.withdrawalFormData.accountDetails('');
      this.withdrawalFormData.message('');
      if (!this.withdrawalFormData.saveAddress()) {
        this.withdrawalFormData.selectedPlatform(null);
      }

      this.loadUserBalance();
      this.loadWithdrawalRequests();

      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('withdrawal.forum.submit_success')
      );

    } catch (error: unknown) {
      console.error('Withdrawal request failed:', error);
      
      const errorMessage = extractErrorMessage(
        error as FlarumApiError, 
        app.translator.trans('withdrawal.forum.error').toString()
      );
      
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
          app.translator.trans('withdrawal.forum.deposit.address_copied')
        );
      }).catch(() => {
        app.alerts.show(
          { type: 'error', dismissible: true },
          app.translator.trans('withdrawal.forum.deposit.copy_failed')
        );
      });
    }
  }

  private handleToggleDepositRecordForm(): void {
    this.state.showDepositRecordForm = !this.state.showDepositRecordForm;
    m.redraw();
  }

  private handleCancelDepositRecordForm(): void {
    this.state.showDepositRecordForm = false;
    m.redraw();
  }

  private async handleDepositRecordSubmit(data: DepositRecordFormData): Promise<void> {
    if (this.state.submittingDepositRecord) return;

    this.state.submittingDepositRecord = true;
    m.redraw();

    try {
      const response = await app.request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/deposit-records',
        body: {
          data: {
            type: 'deposit-records',
            attributes: {
              platformId: data.platformId,
              platformAccount: data.platformAccount,
              realName: data.realName,
              amount: data.amount,
              depositTime: data.depositTime.toISOString(),
              screenshotUrl: data.screenshotUrl,
              userMessage: data.userMessage
            }
          }
        }
      });

      app.store.pushPayload(assertApiPayload(response));

      // Hide form and show success message
      this.state.showDepositRecordForm = false;
      
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('withdrawal.forum.deposit.record.submit_success')
      );

      // Reload deposit history
      this.loadDepositRecords();

    } catch (error: unknown) {
      console.error('Deposit record submission failed:', error);
      
      const errorMessage = extractErrorMessage(
        error as FlarumApiError, 
        app.translator.trans('withdrawal.forum.deposit.record.submit_error').toString()
      );
      
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

  private async loadWithdrawalData(): Promise<void> {
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

    app.store.pushPayload(assertApiPayload(platformsResponse));
    app.store.pushPayload(assertApiPayload(requestsResponse));

    this.state.withdrawalPlatforms = app.store.all('withdrawal-platforms');
    this.state.withdrawalRequests = app.store.all('withdrawal-requests');
  }

  private async loadDepositData(): Promise<void> {
    const [platformsResponse, transactionsResponse, recordsResponse] = await Promise.all([
      app.request({
        method: 'GET',
        url: app.forum.attribute('apiUrl') + '/deposit-platforms'
      }),
      app.request({
        method: 'GET',
        url: app.forum.attribute('apiUrl') + '/deposit-transactions'
      }),
      app.request({
        method: 'GET',
        url: app.forum.attribute('apiUrl') + '/deposit-records'
      })
    ]);

    app.store.pushPayload(assertApiPayload(platformsResponse));
    app.store.pushPayload(assertApiPayload(transactionsResponse));
    app.store.pushPayload(assertApiPayload(recordsResponse));
    
    this.state.depositPlatforms = app.store.all('deposit-platforms');
    this.state.depositTransactions = app.store.all('deposit-transactions');
    this.state.depositRecords = app.store.all('deposit-records');
    
    // Filter active platforms
    this.availablePlatforms = this.state.depositPlatforms.filter(platform => getAttr(platform, 'isActive'));
  }

  private async loadDepositRecords(): Promise<void> {
    try {
      const response = await app.request({
        method: 'GET',
        url: app.forum.attribute('apiUrl') + '/deposit-records'
      });

      app.store.pushPayload(assertApiPayload(response));
      this.state.depositRecords = app.store.all('deposit-records');
      
    } catch (error) {
      console.error('Error loading deposit records:', error);
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
        
        const response = await app.request({
          method: 'GET',
          url: `${app.forum.attribute('apiUrl')}/users/${userId}`
        });
        
        app.store.pushPayload(assertApiPayload(response));
        
        const updatedUser = app.store.getById('users', userId);
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
      const response = await app.request({
        method: 'GET',
        url: app.forum.attribute('apiUrl') + '/withdrawal-requests'
      });

      app.store.pushPayload(assertApiPayload(response));
      this.state.withdrawalRequests = app.store.all('withdrawal-requests');
    } catch (error) {
      console.error('Error loading withdrawal requests:', error);
    }
  }

  private async loadDepositAddress(platform: DepositPlatform): Promise<void> {
    this.depositAddressData.loading = true;
    m.redraw();

    try {
      const response: any = await app.request({
        method: 'GET',
        url: app.forum.attribute('apiUrl') + '/deposit-address',
        params: {
          platform_id: getAttr(platform, 'id')
        }
      });

      const addressData = response.data;
      this.depositAddressData = {
        address: addressData.attributes.address,
        addressTag: addressData.attributes.addressTag,
        platform,
        loading: false
      };

      m.redraw();
    } catch (error) {
      console.error('Error loading deposit address:', error);
      this.depositAddressData.loading = false;
      
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.forum.deposit.address_load_error')
      );
      
      m.redraw();
    }
  }
}