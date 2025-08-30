import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import m from 'mithril';
import type Mithril from 'mithril';
import ConfirmModal from '../../common/components/shared/ConfirmModal';

// Generic interfaces for platform management
export interface GenericPlatform {
  id?: () => string | number;
  name?: () => string;
  isActive?: () => boolean;
  [key: string]: any;
}

export interface GenericTransaction {
  id?: () => string | number;
  status?: () => string;
  [key: string]: any;
}

export interface PlatformOperations<T extends GenericPlatform> {
  create: (data: any) => Promise<T>;
  toggleStatus: (platform: T) => Promise<void>;
  delete: (platform: T) => Promise<void>;
  load: () => Promise<T[]>;
}

export interface TransactionOperations<T extends GenericTransaction> {
  updateStatus: (transaction: T, status: string) => Promise<void>;
  load: () => Promise<T[]>;
}

export interface TabConfiguration {
  key: string;
  label: string;
  component: Mithril.ComponentTypes<any>;
  props?: () => any;
}

export interface GenericManagementPageConfig<
  TPlatform extends GenericPlatform,
  TTransaction extends GenericTransaction
> {
  pageTitle: string;
  extensionId: string;
  
  // Platform configuration
  platformOperations: PlatformOperations<TPlatform>;
  transactionOperations?: TransactionOperations<TTransaction>;
  
  // Tab configuration
  tabs: TabConfiguration[];
  
  // Optional settings section
  settingsComponent?: Mithril.ComponentTypes<any>;
  
  // Translation prefixes
  translations: {
    platformPrefix: string;
    transactionPrefix?: string;
  };
}

export default abstract class GenericManagementPage<
  TPlatform extends GenericPlatform,
  TTransaction extends GenericTransaction
> extends ExtensionPage {
  
  // State management
  protected platforms: TPlatform[] = [];
  protected transactions: TTransaction[] = [];
  protected loading = true;
  protected submittingPlatform = false;
  protected activeTab: string;
  
  // Abstract configuration - must be implemented by subclasses
  protected abstract getConfig(): GenericManagementPageConfig<TPlatform, TTransaction>;
  
  constructor() {
    super();
    const config = this.getConfig();
    this.activeTab = config.tabs[0]?.key || '';
  }

  oninit(vnode: Mithril.VnodeDOM) {
    super.oninit(vnode);
    this.loadData();
  }

  content() {
    if (this.loading) {
      return <LoadingIndicator />;
    }

    const config = this.getConfig();

    return (
      <div className={`${config.extensionId}ManagementPage`}>
        <div className="container">
          <h2>{config.pageTitle}</h2>
          
          {config.settingsComponent && (
            <div className="SettingsSection">
              {m(config.settingsComponent, { 
                onSettingChange: this.saveSetting.bind(this) 
              })}
            </div>
          )}
          
          {config.tabs.length > 1 && (
            <div className="AdminTabs">
              <div className="AdminTabs-nav">
                {config.tabs.map(tab => (
                  <button 
                    key={tab.key}
                    className={`AdminTabs-tab ${this.activeTab === tab.key ? 'active' : ''}`}
                    onclick={() => { this.activeTab = tab.key; }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              
              <div className="AdminTabs-content">
                {this.renderActiveTabContent()}
              </div>
            </div>
          )}
          
          {config.tabs.length === 1 && (
            <div className="SingleTabContent">
              {this.renderActiveTabContent()}
            </div>
          )}
        </div>
      </div>
    );
  }

  protected renderActiveTabContent(): Mithril.Children {
    const config = this.getConfig();
    const activeTab = config.tabs.find(tab => tab.key === this.activeTab);
    
    if (!activeTab) return null;

    const props = {
      // Common platform management props
      platforms: this.platforms,
      transactions: this.transactions,
      submittingPlatform: this.submittingPlatform,
      
      // Platform management callbacks
      onAddPlatform: this.addPlatform.bind(this),
      onTogglePlatformStatus: this.togglePlatformStatus.bind(this),
      onDeletePlatform: this.deletePlatform.bind(this),
      
      // Transaction management callbacks
      ...(config.transactionOperations && {
        onUpdateTransactionStatus: this.updateTransactionStatus.bind(this),
      }),
      
      // Additional props from tab configuration
      ...(activeTab.props ? activeTab.props() : {})
    };

    return m(activeTab.component, props);
  }

  // Generic platform management methods
  protected async addPlatform(formData: any): Promise<void> {
    if (this.submittingPlatform) return;

    this.submittingPlatform = true;
    const config = this.getConfig();

    try {
      await config.platformOperations.create(formData);
      await this.loadPlatforms();
    } catch (error) {
      console.error('Error adding platform:', error);
      // Error handling is done by the platform operations
    } finally {
      this.submittingPlatform = false;
      m.redraw();
    }
  }

  protected async togglePlatformStatus(platform: TPlatform): Promise<void> {
    const config = this.getConfig();
    try {
      await config.platformOperations.toggleStatus(platform);
      await this.loadPlatforms();
      m.redraw();
    } catch (error) {
      console.error('Error toggling platform status:', error);
    }
  }

  protected deletePlatform(platform: TPlatform): void {
    const config = this.getConfig();
    const platformName = (typeof platform.name === 'function' ? platform.name() : platform.name) || 'Unknown Platform';
    
    app.modal.show(ConfirmModal, {
      title: app.translator.trans(`${config.translations.platformPrefix}.delete_confirm_title`),
      message: app.translator.trans(`${config.translations.platformPrefix}.delete_confirm_message`, { name: platformName }),
      confirmText: app.translator.trans(`${config.translations.platformPrefix}.delete_confirm_button`),
      cancelText: app.translator.trans(`${config.translations.platformPrefix}.delete_cancel_button`),
      dangerous: true,
      icon: 'fas fa-trash',
      onConfirm: async () => {
        try {
          await config.platformOperations.delete(platform);
          await this.loadPlatforms();
          m.redraw();
          
          app.alerts.show(
            { type: 'success', dismissible: true },
            app.translator.trans(`${config.translations.platformPrefix}.delete_success`)
          );
        } catch (error) {
          console.error('Error deleting platform:', error);
          app.alerts.show(
            { type: 'error', dismissible: true },
            app.translator.trans(`${config.translations.platformPrefix}.delete_error`)
          );
        }
      },
      onCancel: () => {
        app.modal.close();
      }
    });
  }

  // Generic transaction management methods
  protected async updateTransactionStatus(transaction: TTransaction, status: string): Promise<void> {
    const config = this.getConfig();
    if (!config.transactionOperations) return;

    try {
      await config.transactionOperations.updateStatus(transaction, status);
      await this.loadTransactions();
      
      const prefix = config.translations.transactionPrefix || config.translations.platformPrefix;
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans(`${prefix}.${status}_success`)
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
      const prefix = config.translations.transactionPrefix || config.translations.platformPrefix;
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans(`${prefix}.update_error`)
      );
    }
  }

  // Data loading methods
  protected async loadData(): Promise<void> {
    try {
      await this.loadPlatforms();
      if (this.getConfig().transactionOperations) {
        await this.loadTransactions();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.loading = false;
      m.redraw();
    }
  }

  protected async loadPlatforms(): Promise<void> {
    const config = this.getConfig();
    try {
      this.platforms = await config.platformOperations.load();
      console.log('Loaded platforms:', this.platforms);
    } catch (error) {
      console.error('Error loading platforms:', error);
      this.platforms = [];
    }
  }

  protected async loadTransactions(): Promise<void> {
    const config = this.getConfig();
    if (!config.transactionOperations) return;

    try {
      this.transactions = await config.transactionOperations.load();
      console.log('Loaded transactions:', this.transactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      this.transactions = [];
    }
  }

  // Settings management
  protected async saveSetting(key: string, value: string): Promise<void> {
    try {
      await app.request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/settings',
        body: { [key]: value }
      });
      
      // Update the forum attribute immediately so the UI reflects the change
      app.forum.pushAttributes({ [key]: value });
      
    } catch (error) {
      console.error('Error saving setting:', error);
      app.alerts.show(
        { type: 'error', dismissible: true },
        'Failed to save setting'
      );
    }
  }
}