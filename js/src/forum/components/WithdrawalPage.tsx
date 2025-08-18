import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Stream from 'flarum/common/utils/Stream';
import icon from 'flarum/common/helpers/icon';
import type Mithril from 'mithril';

interface WithdrawalPlatform {
  id: number;
  attributes: {
    name: string;
    symbol: string;
    minAmount: number;
    maxAmount: number;
    fee: number;
    iconUrl?: string;
    iconClass?: string;
  };
}

interface WithdrawalRequest {
  id: number;
  attributes: {
    amount: number;
    accountDetails: string;
    status: string;
    createdAt: string;
  };
  relationships: {
    platform: {
      data: { id: number };
    };
  };
}

export default class WithdrawalPage extends Page {
  private platforms: WithdrawalPlatform[] = [];
  private requests: WithdrawalRequest[] = [];
  private loading = true;
  private submitting = false;
  private loadingBalance = true;
  private userBalance = 0;
  private showDropdown = false;

  private amount = Stream('');
  private selectedPlatform = Stream<WithdrawalPlatform | null>(null);
  private accountDetails = Stream('');
  private saveAddress = Stream(false);

  oninit(vnode: Mithril.VnodeDOM) {
    super.oninit(vnode);

    app.setTitle(app.translator.trans('withdrawal.forum.page.title'));

    this.loadData();
    this.loadUserBalance();
  }

  view() {
    if (this.loading) {
      return (
        <div className="WithdrawalPage">
          <div className="WithdrawalPage-loading">
            <LoadingIndicator />
          </div>
        </div>
      );
    }

    // Check if no platforms are available
    // Accept any truthy platform object - this handles both Model instances and plain objects
    const validPlatforms = (this.platforms || []).filter(platform => !!platform);

    if (validPlatforms.length === 0) {
      return (
        <div className="WithdrawalPage">
          <div className="WithdrawalPage-modal">
            <div className="WithdrawalPage-header">
              <div className="WithdrawalPage-tabs">
                <div className="WithdrawalPage-tab active">
                  {app.translator.trans('withdrawal.forum.tabs.withdrawal')}
                </div>
              </div>
              <button className="WithdrawalPage-close" onclick={() => window.history.back()}>
                {icon('fas fa-times')}
              </button>
            </div>
            
            <div className="WithdrawalPage-content">
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
          </div>
        </div>
      );
    }

    return (
      <div className="WithdrawalPage">
        <div className="WithdrawalPage-modal">
          <div className="WithdrawalPage-header">
            <div className="WithdrawalPage-tabs">
              <div className="WithdrawalPage-tab active">
                {app.translator.trans('withdrawal.forum.tabs.crypto')}
              </div>
            </div>
            <button className="WithdrawalPage-close" onclick={() => window.history.back()}>
              {icon('fas fa-times')}
            </button>
          </div>

          <div className="WithdrawalPage-content">
            {this.renderPlatformSelector()}
            {this.renderAmountSection()}
            {this.renderAddressSection()}
            {this.renderSubmitButton()}
          </div>
        </div>
      </div>
    );
  }


  private renderPlatformSelector(): Mithril.Children {
    const selected = this.selectedPlatform();
    
    return (
      <div className="WithdrawalPage-platformSelector">
        <div className="WithdrawalPage-platformDropdown" onclick={() => this.showDropdown = !this.showDropdown}>
          <div className="WithdrawalPage-platformSelected">
            <div className="WithdrawalPage-platformInfo">
              <div className="WithdrawalPage-platformIcon">
                {selected ? this.renderPlatformIcon(selected) : icon('fas fa-bitcoin', { className: 'default-icon' })}
              </div>
              <div className="WithdrawalPage-platformDetails">
                <div className="WithdrawalPage-platformSymbol">
                  {selected ? ((typeof selected.symbol === 'function' ? selected.symbol() : selected.attributes?.symbol) || 'N/A') : 'N/A'}
                </div>
                <div className="WithdrawalPage-platformFlow">
                  {app.translator.trans('withdrawal.forum.remaining_flow', { amount: '0.00000000' })}
                </div>
              </div>
            </div>
            <div className="WithdrawalPage-platformName">
              {selected ? (typeof selected.name === 'function' ? selected.name() : selected.attributes?.name) : 'No Platform Selected'}
            </div>
          </div>
          {icon('fas fa-chevron-down', { className: 'WithdrawalPage-dropdownIcon' })}
        </div>

        {this.showDropdown && this.renderPlatformDropdown()}
      </div>
    );
  }

  private renderPlatformDropdown(): Mithril.Children {
    // Ensure platforms array is valid and filter out invalid items
    const validPlatforms = (this.platforms || []).filter(platform => !!platform);

    if (validPlatforms.length === 0) {
      return (
        <div className="WithdrawalPage-dropdownMenu">
          <div className="WithdrawalPage-dropdownItem WithdrawalPage-noData">
            {app.translator.trans('withdrawal.forum.no_platforms')}
          </div>
        </div>
      );
    }

    return (
      <div className="WithdrawalPage-dropdownMenu">
        {validPlatforms.map(platform => (
          <div 
            key={platform.id}
            className="WithdrawalPage-dropdownItem"
            onclick={() => {
              this.selectedPlatform(platform);
              this.showDropdown = false;
              this.amount(''); // Clear amount when switching platforms
            }}
          >
            <div className="WithdrawalPage-platformIcon">
              {this.renderPlatformIcon(platform)}
            </div>
            <div className="WithdrawalPage-platformDetails">
              <div className="WithdrawalPage-platformSymbol">
                {(typeof platform.symbol === 'function' ? platform.symbol() : platform.attributes?.symbol) || 'N/A'}
              </div>
              <div className="WithdrawalPage-platformName">
                {typeof platform.name === 'function' ? platform.name() : platform.attributes?.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  private renderPlatformIcon(platform: WithdrawalPlatform): Mithril.Children {
    // Add null checks to prevent errors
    if (!platform) {
      return icon('fas fa-coins', { className: 'crypto-icon default' });
    }

    // Handle both Model instances and plain objects
    const iconUrl = typeof platform.iconUrl === 'function' ? platform.iconUrl() : platform.attributes?.iconUrl;
    const iconClass = typeof platform.iconClass === 'function' ? platform.iconClass() : platform.attributes?.iconClass;
    const name = typeof platform.name === 'function' ? platform.name() : platform.attributes?.name;
    const symbol = typeof platform.symbol === 'function' ? platform.symbol() : platform.attributes?.symbol;

    // Priority: iconUrl > iconClass > default
    if (iconUrl) {
      return (
        <img 
          src={iconUrl} 
          alt={name || 'Platform'}
          className="platform-icon-image"
          onerror={(e) => {
            // Fallback to iconClass or default icon if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallbackIcon = document.createElement('i');
            const fallbackIconClass = iconClass || 'fas fa-coins';
            fallbackIcon.className = `${fallbackIconClass} crypto-icon`;
            target.parentElement?.appendChild(fallbackIcon);
          }}
        />
      );
    }

    // Use Font Awesome icon class if specified, otherwise default
    const finalIconClass = iconClass || 'fas fa-coins';
    const finalSymbol = symbol?.toLowerCase() || 'default';
    return icon(finalIconClass, { className: `crypto-icon ${finalSymbol}` });
  }

  private renderAmountSection(): Mithril.Children {
    const selected = this.selectedPlatform();
    const minAmount = selected ? (typeof selected.minAmount === 'function' ? selected.minAmount() : selected.attributes?.minAmount) : 0.001;
    const maxAmount = selected ? (typeof selected.maxAmount === 'function' ? selected.maxAmount() : selected.attributes?.maxAmount) : 10;
    const fee = selected ? (typeof selected.fee === 'function' ? selected.fee() : selected.attributes?.fee) : 0.0005;

    return (
      <div className="WithdrawalPage-amountSection">
        <div className="WithdrawalPage-formGroup">
          <div className="WithdrawalPage-balanceHeader">
            <span className="WithdrawalPage-label">
              {app.translator.trans('withdrawal.forum.form.amount')}
            </span>
            <span className="WithdrawalPage-balance">
              {app.translator.trans('withdrawal.forum.available_balance', { 
                amount: this.loadingBalance ? '0.00000000' : this.userBalance.toFixed(8) 
              })}
            </span>
          </div>

          <div className="WithdrawalPage-amountInput">
            <input
              type="text"
              className="WithdrawalPage-input"
              placeholder="0.00000000"
              value={this.amount()}
              oninput={(e: Event) => this.amount((e.target as HTMLInputElement).value)}
            />
            <Button
              className="WithdrawalPage-allButton"
              onclick={this.fillAllAmount.bind(this)}
            >
              {app.translator.trans('withdrawal.forum.form.all_button')}
            </Button>
          </div>

          <div className="WithdrawalPage-amountLimits">
            <div className="WithdrawalPage-limitRow">
              <span className="WithdrawalPage-limitLabel">
                {app.translator.trans('withdrawal.forum.limits.min_max')}
              </span>
              <span className="WithdrawalPage-limitValue">
                {icon('fas fa-coins')} {minAmount} ~ {maxAmount}
              </span>
            </div>
            <div className="WithdrawalPage-limitRow">
              <span className="WithdrawalPage-limitLabel">
                {app.translator.trans('withdrawal.forum.limits.fee')}
              </span>
              <span className="WithdrawalPage-limitValue">
                {icon('fas fa-coins')} {fee}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private renderAddressSection(): Mithril.Children {
    const selected = this.selectedPlatform();
    const symbol = selected ? (typeof selected.symbol === 'function' ? selected.symbol() : selected.attributes?.symbol) : '';

    return (
      <div className="WithdrawalPage-addressSection">
        <div className="WithdrawalPage-formGroup">
          <div className="WithdrawalPage-addressHeader">
            <span className="WithdrawalPage-label">
              {app.translator.trans('withdrawal.forum.form.address', { symbol })}
              <span className="WithdrawalPage-required">*</span>
            </span>
            <div className="WithdrawalPage-saveAddress" onclick={() => this.saveAddress(!this.saveAddress())}>
              {icon('fas fa-bookmark')}
              {app.translator.trans('withdrawal.forum.form.save_address')}
            </div>
          </div>

          <div className="WithdrawalPage-addressInput">
            <input
              type="text"
              className="WithdrawalPage-input"
              placeholder={app.translator.trans('withdrawal.forum.form.address_placeholder')}
              value={this.accountDetails()}
              oninput={(e: Event) => this.accountDetails((e.target as HTMLInputElement).value)}
            />
            <button className="WithdrawalPage-pasteButton" onclick={this.pasteFromClipboard.bind(this)}>
              {icon('fas fa-paste')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  private renderSubmitButton(): Mithril.Children {
    const amount = parseFloat(this.amount()) || 0;
    const selected = this.selectedPlatform();
    const fee = selected ? (typeof selected.fee === 'function' ? selected.fee() : selected.attributes?.fee) : 0;
    const finalAmount = Math.max(0, amount - fee);
    const symbol = selected ? (typeof selected.symbol === 'function' ? selected.symbol() : selected.attributes?.symbol) : '';

    return (
      <div className="WithdrawalPage-submitSection">
        <Button
          className="WithdrawalPage-submitButton"
          loading={this.submitting}
          disabled={!this.canSubmit()}
          onclick={this.submit.bind(this)}
        >
          {app.translator.trans('withdrawal.forum.form.submit')}
        </Button>

        {amount > 0 && (
          <div className="WithdrawalPage-finalAmount">
            {app.translator.trans('withdrawal.forum.final_amount', { 
              amount: finalAmount.toFixed(8), 
              symbol 
            })}
          </div>
        )}
      </div>
    );
  }

  private canSubmit(): boolean {
    return !!(
      this.selectedPlatform() &&
      this.amount() &&
      this.accountDetails() &&
      !this.submitting &&
      parseFloat(this.amount()) > 0
    );
  }

  private fillAllAmount(): void {
    if (this.loadingBalance) return;
    this.amount(this.userBalance.toFixed(8));
  }

  private async pasteFromClipboard(): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        this.accountDetails(text.trim());
        m.redraw();
      }
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      app.alerts.show({
        type: 'error',
        dismissible: true
      }, app.translator.trans('withdrawal.forum.clipboard_error'));
    }
  }


  private async submit(): Promise<void> {
    if (!this.canSubmit()) return;

    this.submitting = true;

    try {
      const platform = this.selectedPlatform()!;
      
      const response = await app.request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/withdrawal-requests',
        body: {
          data: {
            type: 'withdrawal-requests',
            attributes: {
              platformId: typeof platform.id === 'function' ? platform.id() : platform.id,
              amount: parseFloat(this.amount()),
              accountDetails: this.accountDetails()
            }
          }
        }
      });
      
      if (response && response.data) {
        app.store.pushPayload(response);
      }

      app.alerts.show({
        type: 'success',
        dismissible: true
      }, app.translator.trans('withdrawal.forum.form.success'));

      // Reset form
      this.amount('');
      this.accountDetails('');
      this.saveAddress(false);

      // Reload data
      this.loadRequests();
    } catch (error) {
      console.error('Error submitting withdrawal request:', error);
      app.alerts.show({
        type: 'error',
        dismissible: true
      }, app.translator.trans('withdrawal.forum.form.error'));
    } finally {
      this.submitting = false;
      m.redraw();
    }
  }

  private async loadData(): Promise<void> {
    try {
      await Promise.all([
        this.loadPlatforms(),
        this.loadRequests()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.loading = false;
      m.redraw();
    }
  }

  private async loadPlatforms(): Promise<void> {
    try {
      console.log('Loading withdrawal platforms...');
      const response = await app.store.find('withdrawal-platforms');
      console.log('Platform response:', response);
      
      this.platforms = Array.isArray(response) ? response.filter(p => p !== null) : (response ? [response] : []);
      console.log('Processed platforms:', this.platforms);
      
      // Auto-select first platform if available
      if (this.platforms.length > 0 && !this.selectedPlatform()) {
        this.selectedPlatform(this.platforms[0]);
      }
    } catch (error) {
      console.error('Error loading platforms:', error);
      this.platforms = [];
    }
  }

  private async loadRequests(): Promise<void> {
    try {
      const response = await app.store.find('withdrawal-requests');
      this.requests = Array.isArray(response) ? response.filter(r => r !== null) : (response ? [response] : []);
    } catch (error) {
      console.error('Error loading requests:', error);
      this.requests = [];
    }
  }

  private async loadUserBalance(): Promise<void> {
    try {
      // Integration with antoinefr/flarum-ext-money extension
      this.userBalance = app.session.user?.attribute('money') || 0;
      this.loadingBalance = false;
      m.redraw();
    } catch (error) {
      console.error('Error loading user balance:', error);
      this.loadingBalance = false;
      m.redraw();
    }
  }
}