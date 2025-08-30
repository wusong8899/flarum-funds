import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import icon from 'flarum/common/helpers/icon';
import humanTime from 'flarum/common/helpers/humanTime';
import type Mithril from 'mithril';
import type { DepositTransaction } from '../types/AdminTypes';

export interface DepositTransactionItemAttrs {
  transaction: DepositTransaction;
  showActions: boolean;
  onUpdateStatus: (status: string) => Promise<void>;
}

export default class DepositTransactionItem extends Component<DepositTransactionItemAttrs> {
  view(vnode: Mithril.Vnode<DepositTransactionItemAttrs>) {
    const { transaction, showActions, onUpdateStatus } = vnode.attrs;

    return (
      <div className="DepositTransactionItem">
        <div className="DepositTransactionItem-header">
          <div className="DepositTransactionItem-user">
            <strong>{this.getUserDisplayName(transaction.user)}</strong>
            <span className="DepositTransactionItem-time">
              {humanTime(transaction.createdAt)}
            </span>
          </div>
          
          <div className="DepositTransactionItem-amount">
            <span className="DepositTransactionItem-amountValue">
              {transaction.amount} {transaction.platform.symbol}
            </span>
            <div className={`DepositTransactionItem-status status-${transaction.statusColor}`}>
              {this.getStatusIcon(transaction.status)}
              {this.getStatusText(transaction.status)}
            </div>
          </div>
        </div>

        <div className="DepositTransactionItem-details">
          <div className="DepositTransactionItem-platform">
            <span className="DepositTransactionItem-label">Platform:</span>
            <span>{transaction.platform.name} ({transaction.platform.network})</span>
          </div>

          {transaction.transactionHash && (
            <div className="DepositTransactionItem-hash">
              <span className="DepositTransactionItem-label">Hash:</span>
              {transaction.explorerUrl ? (
                <a 
                  href={transaction.explorerUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="DepositTransactionItem-hashLink"
                >
                  {this.formatHash(transaction.transactionHash)}
                  {icon('fas fa-external-link-alt')}
                </a>
              ) : (
                <span className="DepositTransactionItem-hashText">
                  {this.formatHash(transaction.transactionHash)}
                </span>
              )}
            </div>
          )}

          {transaction.fromAddress && (
            <div className="DepositTransactionItem-fromAddress">
              <span className="DepositTransactionItem-label">From:</span>
              <span className="DepositTransactionItem-address">
                {this.formatHash(transaction.fromAddress)}
              </span>
            </div>
          )}

          {transaction.confirmations !== undefined && (
            <div className="DepositTransactionItem-confirmations">
              <span className="DepositTransactionItem-label">Confirmations:</span>
              <span>
                {transaction.confirmations}/{transaction.requiredConfirmations}
                {transaction.hasEnoughConfirmations && 
                  <span className="DepositTransactionItem-confirmed"> ✓</span>
                }
              </span>
            </div>
          )}

          {transaction.adminNotes && (
            <div className="DepositTransactionItem-notes">
              <span className="DepositTransactionItem-label">Notes:</span>
              <span>{transaction.adminNotes}</span>
            </div>
          )}
        </div>

        {showActions && this.renderActions(transaction, onUpdateStatus)}
      </div>
    );
  }

  private renderActions(transaction: DepositTransaction, onUpdateStatus: (status: string) => void): Mithril.Children {
    const actions = [];

    if (transaction.status === 'pending') {
      actions.push(
        <Button
          key="confirm"
          className="Button Button--primary Button--sm"
          onclick={() => onUpdateStatus('confirmed')}
        >
          {app.translator.trans('withdrawal.admin.deposit.transactions.confirm')}
        </Button>
      );
    }

    if (transaction.status === 'confirmed' && transaction.canBeCompleted) {
      actions.push(
        <Button
          key="complete"
          className="Button Button--success Button--sm"
          onclick={() => onUpdateStatus('completed')}
        >
          {app.translator.trans('withdrawal.admin.deposit.transactions.complete')}
        </Button>
      );
    }

    if (transaction.status === 'pending' || transaction.status === 'confirmed') {
      actions.push(
        <Button
          key="reject"
          className="Button Button--danger Button--sm"
          onclick={() => onUpdateStatus('failed')}
        >
          {app.translator.trans('withdrawal.admin.deposit.transactions.reject')}
        </Button>
      );
    }

    return actions.length > 0 ? (
      <div className="DepositTransactionItem-actions">
        {actions}
      </div>
    ) : null;
  }

  private getStatusIcon(status: string): Mithril.Children {
    switch (status) {
      case 'pending':
        return icon('fas fa-clock');
      case 'confirmed':
        return icon('fas fa-check-circle');
      case 'completed':
        return icon('fas fa-check-double');
      case 'failed':
        return icon('fas fa-times-circle');
      case 'cancelled':
        return icon('fas fa-ban');
      default:
        return icon('fas fa-question-circle');
    }
  }

  private getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        // Fixed: Convert NestedStringArray to string
        return app.translator.trans('withdrawal.admin.deposit.transactions.status.pending').toString();
      case 'confirmed':
        return app.translator.trans('withdrawal.admin.deposit.transactions.status.confirmed').toString();
      case 'completed':
        return app.translator.trans('withdrawal.admin.deposit.transactions.status.completed').toString();
      case 'failed':
        return app.translator.trans('withdrawal.admin.deposit.transactions.status.failed').toString();
      case 'cancelled':
        return app.translator.trans('withdrawal.admin.deposit.transactions.status.cancelled').toString();
      default:
        return status;
    }
  }

  private formatHash(hash: string): string {
    if (hash.length <= 16) return hash;
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  }

  private getUserDisplayName(user: any): string {
    if (!user) return 'Unknown User';
    
    // Handle Flarum User model (has displayName method)
    if (typeof user.displayName === 'function') {
      return user.displayName();
    }
    
    // Handle plain User object from AdminTypes
    if (user.attributes && user.attributes.displayName) {
      return user.attributes.displayName;
    }
    
    // Handle direct displayName property
    if (user.displayName) {
      return user.displayName;
    }
    
    // Fallback to ID or 'Unknown'
    return user.id ? `User #${user.id}` : 'Unknown User';
  }
}