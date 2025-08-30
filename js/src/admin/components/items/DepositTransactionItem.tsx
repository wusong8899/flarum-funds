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

    // Extract data safely from Flarum model or plain object
    const amount = this.getAttribute(transaction, 'amount') || 0;
    const status = this.getAttribute(transaction, 'status') || 'pending';
    const createdAt = this.getAttribute(transaction, 'createdAt') || this.getAttribute(transaction, 'depositTime');
    const user = this.getRelationship(transaction, 'user');
    const platform = this.getRelationship(transaction, 'platform');
    const adminNotes = this.getAttribute(transaction, 'adminNotes');
    const transactionHash = this.getAttribute(transaction, 'transactionHash');
    const explorerUrl = this.getAttribute(transaction, 'explorerUrl');
    const fromAddress = this.getAttribute(transaction, 'fromAddress');
    const confirmations = this.getAttribute(transaction, 'confirmations');
    const requiredConfirmations = this.getAttribute(transaction, 'requiredConfirmations');
    const hasEnoughConfirmations = this.getAttribute(transaction, 'hasEnoughConfirmations');
    const canBeCompleted = this.getAttribute(transaction, 'canBeCompleted');
    
    // Get platform info safely
    const platformName = platform ? this.getAttribute(platform, 'name') || 'Unknown Platform' : 'Unknown Platform';
    const platformSymbol = platform ? this.getAttribute(platform, 'symbol') || 'N/A' : 'N/A';
    const platformNetwork = platform ? this.getAttribute(platform, 'network') || '' : '';

    return (
      <div className="DepositTransactionItem">
        <div className="DepositTransactionItem-header">
          <div className="DepositTransactionItem-user">
            <strong>{this.getUserDisplayName(user)}</strong>
            <span className="DepositTransactionItem-time">
              {createdAt ? humanTime(createdAt) : 'N/A'}
            </span>
          </div>
          
          <div className="DepositTransactionItem-amount">
            <span className="DepositTransactionItem-amountValue">
              {amount} {platformSymbol}
            </span>
            <div className={`DepositTransactionItem-status status-${this.getStatusColor(status)}`}>
              {this.getStatusIcon(status)}
              {this.getStatusText(status)}
            </div>
          </div>
        </div>

        <div className="DepositTransactionItem-details">
          <div className="DepositTransactionItem-platform">
            <span className="DepositTransactionItem-label">Platform:</span>
            <span>{platformName}{platformNetwork ? ` (${platformNetwork})` : ''}</span>
          </div>

          {transactionHash && (
            <div className="DepositTransactionItem-hash">
              <span className="DepositTransactionItem-label">Hash:</span>
              {explorerUrl ? (
                <a 
                  href={explorerUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="DepositTransactionItem-hashLink"
                >
                  {this.formatHash(transactionHash)}
                  {icon('fas fa-external-link-alt')}
                </a>
              ) : (
                <span className="DepositTransactionItem-hashText">
                  {this.formatHash(transactionHash)}
                </span>
              )}
            </div>
          )}

          {fromAddress && (
            <div className="DepositTransactionItem-fromAddress">
              <span className="DepositTransactionItem-label">From:</span>
              <span className="DepositTransactionItem-address">
                {this.formatHash(fromAddress)}
              </span>
            </div>
          )}

          {confirmations !== undefined && (
            <div className="DepositTransactionItem-confirmations">
              <span className="DepositTransactionItem-label">Confirmations:</span>
              <span>
                {confirmations}/{requiredConfirmations}
                {hasEnoughConfirmations && 
                  <span className="DepositTransactionItem-confirmed"> ✓</span>
                }
              </span>
            </div>
          )}

          {adminNotes && (
            <div className="DepositTransactionItem-notes">
              <span className="DepositTransactionItem-label">Notes:</span>
              <span>{adminNotes}</span>
            </div>
          )}
        </div>

        {showActions && this.renderActions(status, canBeCompleted, onUpdateStatus)}
      </div>
    );
  }

  private renderActions(status: string, canBeCompleted: boolean, onUpdateStatus: (status: string) => void): Mithril.Children {
    const actions = [];

    if (status === 'pending') {
      actions.push(
        <Button
          key="approve"
          className="Button Button--primary Button--sm"
          onclick={() => onUpdateStatus('approved')}
        >
          {app.translator.trans('withdrawal.admin.deposit.records.approve')}
        </Button>
      );
    }

    if (status === 'confirmed' && canBeCompleted) {
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

    if (status === 'pending' || status === 'confirmed') {
      actions.push(
        <Button
          key="reject"
          className="Button Button--danger Button--sm"
          onclick={() => onUpdateStatus('rejected')}
        >
          {app.translator.trans('withdrawal.admin.deposit.records.reject')}
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

  private getAttribute(obj: any, attr: string): any {
    if (!obj) return null;
    
    // Handle Flarum Model instances (method-based access)
    if (typeof obj[attr] === 'function') {
      return obj[attr]();
    }
    
    // Handle plain objects with attributes property
    if (obj.attributes && obj.attributes.hasOwnProperty(attr)) {
      return obj.attributes[attr];
    }
    
    // Handle direct property access
    if (obj.hasOwnProperty(attr)) {
      return obj[attr];
    }
    
    return null;
  }

  private getRelationship(obj: any, relationName: string): any {
    if (!obj) return null;
    
    // Handle Flarum Model instances (method-based access)
    if (typeof obj[relationName] === 'function') {
      return obj[relationName]();
    }
    
    // Handle plain objects with relationships
    if (obj.relationships && obj.relationships[relationName]) {
      return obj.relationships[relationName].data;
    }
    
    // Handle direct property access
    if (obj[relationName]) {
      return obj[relationName];
    }
    
    return null;
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'cancelled':
        return 'secondary';
      default:
        return 'secondary';
    }
  }
}