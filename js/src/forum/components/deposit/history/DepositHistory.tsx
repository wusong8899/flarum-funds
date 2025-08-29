import Component from 'flarum/common/Component';
import icon from 'flarum/common/helpers/icon';
import humanTime from 'flarum/common/helpers/humanTime';
import m from 'mithril';
import type Mithril from 'mithril';
import type DepositTransaction from '../../../common/models/DepositTransaction';
import type DepositPlatform from '../../../common/models/DepositPlatform';
import { getAttr } from '../../withdrawal/utils/modelHelpers';

export interface DepositHistoryAttrs {
  transactions: DepositTransaction[];
  platforms: DepositPlatform[];
  loading: boolean;
}

export default class DepositHistory extends Component<DepositHistoryAttrs> {
  view(vnode: Mithril.Vnode<DepositHistoryAttrs>) {
    const { transactions, loading } = vnode.attrs;

    if (loading) {
      return (
        <div className="DepositHistory">
          <div className="DepositHistory-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Loading deposit history...</span>
          </div>
        </div>
      );
    }

    if (!transactions || transactions.length === 0) {
      return (
        <div className="DepositHistory">
          <div className="DepositHistory-empty">
            <div className="DepositHistory-emptyIcon">
              {icon('fas fa-inbox')}
            </div>
            <h3>No deposits yet</h3>
            <p>Your deposit transactions will appear here once you make a deposit.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="DepositHistory">
        <div className="DepositHistory-header">
          <h3>Deposit History</h3>
          <span className="DepositHistory-count">{transactions.length} transactions</span>
        </div>
        
        <div className="DepositHistory-list">
          {transactions.map(transaction => this.renderTransaction(transaction))}
        </div>
      </div>
    );
  }

  private renderTransaction(transaction: DepositTransaction): Mithril.Children {
    const platform = transaction.platform?.();
    const amount = getAttr(transaction, 'amount') || 0;
    const status = getAttr(transaction, 'status') || '';
    const statusColor = getAttr(transaction, 'statusColor') || 'secondary';
    const transactionHash = getAttr(transaction, 'transactionHash');
    const explorerUrl = getAttr(transaction, 'explorerUrl');
    const createdAt = getAttr(transaction, 'createdAt');
    const completedAt = getAttr(transaction, 'completedAt');
    const confirmations = getAttr(transaction, 'confirmations') || 0;
    const requiredConfirmations = getAttr(transaction, 'requiredConfirmations') || 1;

    return (
      <div key={getAttr(transaction, 'id')} className="DepositHistory-item">
        <div className="DepositHistory-itemHeader">
          <div className="DepositHistory-itemPlatform">
            {platform && (
              <>
                <div className="DepositHistory-itemIcon">
                  {this.renderPlatformIcon(platform)}
                </div>
                <div className="DepositHistory-itemInfo">
                  <span className="DepositHistory-itemCurrency">
                    {getAttr(platform, 'symbol')}
                  </span>
                  <span className="DepositHistory-itemNetwork">
                    {getAttr(platform, 'network')}
                  </span>
                </div>
              </>
            )}
          </div>
          
          <div className="DepositHistory-itemAmount">
            <span className="DepositHistory-itemAmountValue">
              +{amount} {platform ? getAttr(platform, 'symbol') : ''}
            </span>
            <div className={`DepositHistory-itemStatus status-${statusColor}`}>
              {this.getStatusIcon(status)}
              {this.getStatusText(status)}
            </div>
          </div>
        </div>

        <div className="DepositHistory-itemDetails">
          <div className="DepositHistory-itemMeta">
            <span className="DepositHistory-itemTime">
              {createdAt ? humanTime(createdAt) : 'Unknown time'}
            </span>
            
            {status === 'confirmed' || status === 'completed' ? (
              <span className="DepositHistory-itemConfirmations">
                {confirmations}/{requiredConfirmations} confirmations
              </span>
            ) : null}
          </div>

          {transactionHash && (
            <div className="DepositHistory-itemHash">
              <span className="DepositHistory-itemHashLabel">Transaction:</span>
              {explorerUrl ? (
                <a 
                  href={explorerUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="DepositHistory-itemHashLink"
                >
                  {this.formatHash(transactionHash)}
                  {icon('fas fa-external-link-alt')}
                </a>
              ) : (
                <span className="DepositHistory-itemHashText">
                  {this.formatHash(transactionHash)}
                </span>
              )}
            </div>
          )}

          {completedAt && (
            <div className="DepositHistory-itemCompleted">
              <span>Credited: {humanTime(completedAt)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  private renderPlatformIcon(platform: DepositPlatform): Mithril.Children {
    const iconUrl = getAttr(platform, 'iconUrl');
    const iconClass = getAttr(platform, 'iconClass');
    const symbol = getAttr(platform, 'symbol');

    if (iconUrl) {
      return <img src={iconUrl} alt={symbol} className="DepositHistory-platformImg" />;
    }

    if (iconClass) {
      return icon(iconClass);
    }

    // Default currency icons
    switch (symbol) {
      case 'USDT':
        return <span className="DepositHistory-currencyIcon usdt">₮</span>;
      case 'USDC':
        return <span className="DepositHistory-currencyIcon usdc">$</span>;
      case 'BTC':
        return <span className="DepositHistory-currencyIcon btc">₿</span>;
      case 'ETH':
        return <span className="DepositHistory-currencyIcon eth">Ξ</span>;
      default:
        return icon('fas fa-coins');
    }
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
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  private formatHash(hash: string): string {
    if (hash.length <= 16) return hash;
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  }
}