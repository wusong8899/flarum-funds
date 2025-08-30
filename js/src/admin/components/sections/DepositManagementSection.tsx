import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import type Mithril from 'mithril';
import type DepositPlatform from '../../../common/models/DepositPlatform';
import type { DepositTransaction } from '../types/AdminTypes';
import AddDepositPlatformForm from '../forms/AddDepositPlatformForm';
import GenericPlatformListItem from '../shared/GenericPlatformListItem';
import DepositTransactionItem from '../items/DepositTransactionItem';

export interface DepositManagementSectionAttrs {
  platforms: DepositPlatform[];
  transactions: DepositTransaction[];
  submittingPlatform: boolean;
  onAddPlatform: (formData: any) => Promise<void>;
  onTogglePlatformStatus: (platform: DepositPlatform) => Promise<void>;
  onDeletePlatform: (platform: DepositPlatform) => Promise<void>;
  onUpdateTransactionStatus: (transaction: DepositTransaction, status: string) => Promise<void>;
}

export default class DepositManagementSection extends Component<DepositManagementSectionAttrs> {
  private showPlatformForm = false;
  private activeTransactionTab = 'pending';

  view(vnode: Mithril.Vnode<DepositManagementSectionAttrs>) {
    const { 
      platforms, 
      transactions, 
      submittingPlatform,
      onAddPlatform,
      onTogglePlatformStatus,
      onDeletePlatform,
      onUpdateTransactionStatus
    } = vnode.attrs;

    const pendingTransactions = transactions.filter(t => t.status === 'pending' || t.status === 'confirmed');
    const completedTransactions = transactions.filter(t => t.status === 'completed' || t.status === 'failed' || t.status === 'cancelled');

    return (
      <div className="DepositManagementSection">
        <div className="Form-group">
          <h3>{app.translator.trans('withdrawal.admin.deposit.platforms.title')}</h3>
          
          <div className="DepositPlatforms">
            <div className="DepositPlatforms-header">
              <Button
                className="Button Button--primary"
                onclick={() => { this.showPlatformForm = !this.showPlatformForm; }}
              >
                {app.translator.trans('withdrawal.admin.deposit.platforms.add_button')}
              </Button>
            </div>

            {this.showPlatformForm && (
              <AddDepositPlatformForm
                submitting={submittingPlatform}
                onSubmit={onAddPlatform}
                onCancel={() => { this.showPlatformForm = false; }}
              />
            )}

            <div className="DepositPlatforms-list">
              {platforms.length === 0 ? (
                <p className="DepositPlatforms-empty">
                  {app.translator.trans('withdrawal.admin.deposit.platforms.empty')}
                </p>
              ) : (
                platforms.map(platform => (
                  <GenericPlatformListItem
                    key={platform.id}
                    platform={platform}
                    type="deposit"
                    style="list"
                    onToggleStatus={() => onTogglePlatformStatus(platform)}
                    onDelete={() => onDeletePlatform(platform)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="Form-group">
          <h3>{app.translator.trans('withdrawal.admin.deposit.transactions.title')}</h3>
          
          <div className="DepositTransactions">
            <div className="DepositTransactions-tabs">
              <button
                className={`DepositTransactions-tab ${this.activeTransactionTab === 'pending' ? 'active' : ''}`}
                onclick={() => { this.activeTransactionTab = 'pending'; }}
              >
                {app.translator.trans('withdrawal.admin.deposit.transactions.pending_title')} ({pendingTransactions.length})
              </button>
              <button
                className={`DepositTransactions-tab ${this.activeTransactionTab === 'completed' ? 'active' : ''}`}
                onclick={() => { this.activeTransactionTab = 'completed'; }}
              >
                {app.translator.trans('withdrawal.admin.deposit.transactions.completed_title')} ({completedTransactions.length})
              </button>
            </div>

            <div className="DepositTransactions-content">
              {this.activeTransactionTab === 'pending' ? (
                <div className="DepositTransactions-pending">
                  {pendingTransactions.length === 0 ? (
                    <p className="DepositTransactions-empty">
                      {app.translator.trans('withdrawal.admin.deposit.transactions.no_pending')}
                    </p>
                  ) : (
                    pendingTransactions.map(transaction => (
                      <DepositTransactionItem
                        key={transaction.id}
                        transaction={transaction}
                        onUpdateStatus={(status) => onUpdateTransactionStatus(transaction, status)}
                        showActions={true}
                      />
                    ))
                  )}
                </div>
              ) : (
                <div className="DepositTransactions-completed">
                  {completedTransactions.length === 0 ? (
                    <p className="DepositTransactions-empty">
                      {app.translator.trans('withdrawal.admin.deposit.transactions.no_completed')}
                    </p>
                  ) : (
                    completedTransactions.map(transaction => (
                      <DepositTransactionItem
                        key={transaction.id}
                        transaction={transaction}
                        onUpdateStatus={(status) => onUpdateTransactionStatus(transaction, status)}
                        showActions={false}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}