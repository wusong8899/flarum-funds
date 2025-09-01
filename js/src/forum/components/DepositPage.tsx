import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Stream from 'flarum/common/utils/Stream';
import icon from 'flarum/common/helpers/icon';
import m from 'mithril';
import type Mithril from 'mithril';
import type { DepositPageState, DepositFormData, DepositAddressData } from './deposit/types/interfaces';
import type DepositPlatform from '../../common/models/DepositPlatform';
import AddressDisplay from './deposit/components/AddressDisplay';
import ImageDisplay from './deposit/components/ImageDisplay';
import TransactionHistory from './shared/TransactionHistory';
import DepositPlatformDropdown from './deposit/selectors/DepositPlatformDropdown';
import { getAttr } from './withdrawal/utils/modelHelpers';
import { depositService, platformService } from '../../common/services';
import { 
  createPlatformSelectionState, 
  handleCurrencyChange, 
  handleNetworkChange,
  type PlatformSelectionState 
} from '../../common/utils/platformSelectionLogic';

export default class DepositPage extends Page<any, DepositPageState> {
  state: DepositPageState = {
    platforms: [],
    transactions: [],
    loading: true,
    submitting: false,
    activeTab: Stream('deposit')
  };

  private formData: DepositFormData = {
    selectedPlatform: Stream<DepositPlatform | null>(null),
    userMessage: Stream(''),
    depositAddress: ''
  };

  private addressData: DepositAddressData = {
    address: '',
    platform: null as any,
    loading: false
  };

  private currencies: string[] = [];
  private networks: string[] = [];
  private selectedCurrency = Stream<string>('');
  private selectedNetwork = Stream<string>('');
  private platformState: PlatformSelectionState<DepositPlatform> = {
    currencyGroups: {},
    availablePlatforms: [],
    currencies: []
  };

  oninit(vnode: Mithril.VnodeDOM) {
    super.oninit(vnode);

    app.setTitle(app.translator.trans('funds.forum.deposit.page.title').toString());

    this.loadPlatforms();
    this.loadTransactions();
  }

  view() {
    if (this.state.loading) {
      return (
        <div className="DepositPage">
          <div className="DepositPage-loading">
            <LoadingIndicator />
          </div>
        </div>
      );
    }

    return (
      <div className="DepositPage">
        <div className="DepositPage-modal">
          {this.renderHeader()}
          <div className="DepositPage-content">
            {this.state.activeTab() === 'deposit' ? this.renderDepositTab() : this.renderHistoryTab()}
          </div>
        </div>
      </div>
    );
  }

  private renderHeader(): Mithril.Children {
    return (
      <div className="DepositPage-header">
        <div className="DepositPage-tabs">
          <div 
            className={`DepositPage-tab ${this.state.activeTab() === 'deposit' ? 'active' : ''}`}
            onclick={() => this.handleTabChange('deposit')}
          >
            {app.translator.trans('funds.forum.deposit.tabs.deposit')}
          </div>
          <div 
            className={`DepositPage-tab ${this.state.activeTab() === 'history' ? 'active' : ''}`}
            onclick={() => this.handleTabChange('history')}
          >
            {app.translator.trans('funds.forum.deposit.tabs.history')}
          </div>
        </div>
        <Button
          className="DepositPage-close"
          icon="fas fa-times"
          onclick={() => app.history.back()}
        />
      </div>
    );
  }

  private renderDepositTab(): Mithril.Children {
    console.log('renderDepositTab: this.state.platforms =', this.state.platforms);
    const availablePlatforms = (this.state.platforms || []).filter(platform => {
      const isActive = getAttr(platform, 'isActive');
      console.log(`renderDepositTab: Platform ${getAttr(platform, 'name')}: isActive = ${isActive}`);
      return platform && isActive;
    });
    
    console.log('renderDepositTab: availablePlatforms.length =', availablePlatforms.length);

    if (availablePlatforms.length === 0) {
      console.log('renderDepositTab: Showing empty state');
      return (
        <div className="DepositPage-emptyState">
          <div className="DepositPage-emptyIcon">
            {icon('fas fa-coins')}
          </div>
          <h3 className="DepositPage-emptyTitle">
            {app.translator.trans('funds.forum.deposit.no_platforms')}
          </h3>
          <p className="DepositPage-emptyDescription">
            {app.translator.trans('funds.forum.deposit.no_platforms_description')}
          </p>
        </div>
      );
    }

    return (
      <div className="DepositPage-depositTab">
        {this.renderSelectors()}
        {this.renderDepositInfo()}
      </div>
    );
  }

  private renderSelectors(): Mithril.Children {
    return (
      <div className="DepositPage-selectors">
        <DepositPlatformDropdown
          platforms={this.state.platforms}
          selectedPlatform={this.selectedPlatform()}
          onPlatformSelect={(platform: DepositPlatform) => this.handlePlatformSelect(platform)}
        />
      </div>
    );
  }

  private renderDepositInfo(): Mithril.Children {
    const platform = this.formData.selectedPlatform();
    
    if (!platform) {
      return (
        <div className="DepositPage-selectPrompt">
          <p>{app.translator.trans('funds.forum.deposit.select_currency_network')}</p>
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
      <div className="DepositPage-depositInfo">
        <p className="DepositPage-instructionText">
          {app.translator.trans('funds.forum.deposit.scan_or_use_address')}
        </p>
        
        <AddressDisplay
          address={this.addressData.address}
          loading={this.addressData.loading}
          onCopy={this.handleCopyAddress.bind(this)}
        />
        
        <p className="DepositPage-minAmountText">
          {app.translator.trans('funds.forum.deposit.min_amount', {
            amount: minAmount,
            currency: getAttr(platform, 'symbol')
          })}
        </p>
        
        <div className="DepositPage-imageContainer">
          <ImageDisplay
            platform={this.addressData.platform}
            loading={this.addressData.loading}
            size={160}
          />
        </div>
        
        <div className="DepositPage-infoPanel">
          <i className="fas fa-info-circle"></i>
          <span>{warningText}</span>
        </div>
      </div>
    );
  }

  private renderHistoryTab(): Mithril.Children {
    return (
      <TransactionHistory
        transactions={this.state.transactions}
        platforms={this.state.platforms}
        loading={false}
        type="deposit"
      />
    );
  }

  private handleTabChange(tab: 'deposit' | 'history'): void {
    this.state.activeTab(tab);
  }

  private handleCurrencyChange(currency: string): void {
    this.selectedCurrency(currency);
    this.selectedNetwork('');
    this.formData.selectedPlatform(null);
    this.addressData.address = '';
    this.addressData.loading = false;
    
    // 使用共享逻辑处理货币变更
    const result = handleCurrencyChange(this.platformState.currencyGroups, currency);
    this.networks = result.networks;
    
    // 自动选择平台（如果适用）
    if (result.autoSelectedPlatform) {
      this.handlePlatformSelect(result.autoSelectedPlatform);
    }
  }

  private handleNetworkChange(network: string): void {
    this.selectedNetwork(network);
    this.formData.selectedPlatform(null);
    this.addressData.address = '';
    this.addressData.loading = false;
    
    // 使用共享逻辑处理网络变更
    const autoSelectedPlatform = handleNetworkChange(
      this.platformState.currencyGroups, 
      this.selectedCurrency(), 
      network
    );
    
    if (autoSelectedPlatform) {
      this.handlePlatformSelect(autoSelectedPlatform);
    }
  }

  private selectedPlatform(): DepositPlatform | null {
    return this.formData.selectedPlatform();
  }

  private handlePlatformSelect(platform: DepositPlatform): void {
    this.formData.selectedPlatform(platform);
    this.loadDepositAddress(platform);
  }

  private handleCopyAddress(): void {
    if (this.addressData.address) {
      navigator.clipboard.writeText(this.addressData.address).then(() => {
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

  // 这个方法现在由 handleCurrencyChange 中的共享逻辑处理，无需单独调用


  private async loadPlatforms(): Promise<void> {
    try {
      console.log('Loading deposit platforms...');
      this.state.platforms = await platformService.find('deposit');
      console.log('Loaded platforms:', this.state.platforms);
      console.log('Number of platforms:', this.state.platforms.length);
      
      // Log each platform's details
      this.state.platforms.forEach((platform, index) => {
        console.log(`Platform ${index}:`, {
          id: platform.id ? platform.id() : 'no id',
          name: platform.name ? platform.name() : 'no name',
          symbol: platform.symbol ? platform.symbol() : 'no symbol',
          isActive: platform.isActive ? platform.isActive() : 'no isActive field'
        });
      });
      
      // 使用共享逻辑创建平台选择状态
      this.platformState = createPlatformSelectionState(this.state.platforms);
      this.currencies = this.platformState.currencies;
      console.log('Platform state currencies:', this.currencies);
      console.log('Currency groups:', this.platformState.currencyGroups);

      this.state.loading = false;
      m.redraw();
    } catch (error) {
      console.error('Error loading deposit platforms:', error);
      this.state.loading = false;
      m.redraw();
    }
  }

  private async loadTransactions(): Promise<void> {
    try {
      this.state.transactions = await depositService.getUserHistory();
    } catch (error) {
      console.error('Error loading deposit records:', error);
    }
  }

  private loadDepositAddress(platform: DepositPlatform): void {
    this.addressData.loading = true;
    m.redraw();

    try {
      // Get address directly from platform configuration
      const address = platform.address();
      if (!address) {
        throw new Error('Platform does not have a configured deposit address');
      }

      this.addressData = {
        address,
        platform,
        loading: false
      };

      m.redraw();
    } catch (error) {
      console.error('Error loading deposit address:', error);
      this.addressData.loading = false;
      
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('funds.forum.deposit.address_load_error')
      );
      
      m.redraw();
    }
  }
}