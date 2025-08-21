import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Stream from 'flarum/common/utils/Stream';
import type Mithril from 'mithril';
import type { WithdrawalPlatform, WithdrawalFormData, WithdrawalPageState } from './withdrawal/types/interfaces';
import WithdrawalForm from './withdrawal/forms/WithdrawalForm';
import WithdrawalHistory from './withdrawal/history/WithdrawalHistory';
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
      <WithdrawalHistory
        requests={this.state.requests}
        platforms={this.state.platforms}
        loading={false}
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

  private handleFillAllAmount(): void {
    const selectedPlatform = this.formData.selectedPlatform();
    if (!selectedPlatform) return;

    const fee = getAttr(selectedPlatform, 'fee') || 0;
    const maxAmount = getAttr(selectedPlatform, 'maxAmount') || Infinity;
    let availableAmount = this.state.userBalance - fee;
    
    if (maxAmount < Infinity && availableAmount > maxAmount) {
      availableAmount = maxAmount;
    }
    
    if (availableAmount > 0) {
      this.formData.amount(availableAmount.toString());
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
              saveAddress: this.formData.saveAddress()
            }
          }
        }
      });

      app.store.pushPayload(response);

      this.formData.amount('');
      this.formData.accountDetails('');
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
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.forum.submit_error')
      );
    } finally {
      this.state.submitting = false;
    }
  }

  private async loadData(): Promise<void> {
    try {
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

      app.store.pushPayload(platformsResponse);
      app.store.pushPayload(requestsResponse);

      this.state.platforms = app.store.all('withdrawal-platforms');
      this.state.requests = app.store.all('withdrawal-requests');
      this.state.loading = false;
    } catch (error) {
      console.error('Error loading data:', error);
      this.state.loading = false;
    }
  }

  private async loadUserBalance(): Promise<void> {
    try {
      this.state.loadingBalance = true;
      this.state.userBalance = app.session.user?.attribute('money') || 0;
      this.state.loadingBalance = false;
    } catch (error) {
      console.error('Error loading user balance:', error);
      this.state.loadingBalance = false;
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
