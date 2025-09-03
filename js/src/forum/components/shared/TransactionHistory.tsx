import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import icon from 'flarum/common/helpers/icon';
import humanTime from 'flarum/common/helpers/humanTime';
import type Mithril from 'mithril';
import WithdrawalRequest from '../../../common/models/WithdrawalRequest';
import WithdrawalPlatform from '../../../common/models/WithdrawalPlatform';
import type DepositPlatform from '../../../common/models/DepositPlatform';
import type DepositRecord from '../../../common/models/DepositRecord';
import { getAttr, findPlatformById, getDateFromAttr, getIdString } from '../withdrawal/utils/modelHelpers';
import PlatformIcon from '../withdrawal/common/PlatformIcon';
import StatusBadge from '../withdrawal/common/StatusBadge';
import EmptyState from '../withdrawal/common/EmptyState';
import LoadingState from '../withdrawal/common/LoadingState';

// Generic transaction type that can represent withdrawal requests or deposit records
interface Transaction {
  id?: () => string | number;
  amount?: () => number;
  status?: () => string;
  createdAt?: () => Date;
  platform?: () => any;
  platformId?: () => string | number;
  // Withdrawal request specific fields
  accountDetails?: () => string;
  // Deposit record specific fields
  screenshotUrl?: () => string;
  userMessage?: () => string;
  processedAt?: () => Date;
  adminNotes?: () => string;
  creditedAmount?: () => number;
  [key: string]: any;
}

interface TransactionHistoryAttrs {
  transactions: (WithdrawalRequest | DepositRecord)[];
  platforms: (WithdrawalPlatform | DepositPlatform)[];
  loading: boolean;
  type: 'withdrawal' | 'deposit';
}

export default class TransactionHistory extends Component<TransactionHistoryAttrs> {
  view(vnode: Mithril.Vnode<TransactionHistoryAttrs>): Mithril.Children {
    const { transactions, platforms, loading, type } = vnode.attrs;

    if (loading) {
      return <LoadingState className={`${type}History-loading`} />;
    }

    if (!transactions || transactions.length === 0) {
      return (
        <EmptyState
          iconName={type === 'withdrawal' ? 'fas fa-history' : 'fas fa-inbox'}
          title={app.translator.trans('funds.forum.history.empty.title')}
          description={app.translator.trans('funds.forum.history.empty.description')}
          className={`${type}History-empty`}
        />
      );
    }

    return (
      <div className={`${type}History`}>
        <div
          className={`${type}History-header`}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h3>{type === 'withdrawal' ? '提款历史' : '存款历史'}</h3>
          <span 
            className={`${type}History-count`}
            style={{
              color: '#888',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {transactions.length} {type === 'withdrawal' ? '次提款' : '次存款'}
          </span>
        </div>
        
        <div className={`${type}History-list`}>
          {transactions.map(transaction => this.renderTransaction(transaction as Transaction, platforms, type))}
        </div>
      </div>
    );
  }

  private renderTransaction(transaction: Transaction, platforms: any[], type: string): Mithril.Children {
    const transactionId = this.getTransactionId(transaction);
    const platform = this.getPlatform(transaction, platforms);
    const amount = getAttr(transaction, 'amount') || 0;
    const status = getAttr(transaction, 'status') || 'pending';
    const statusColor = getAttr(transaction, 'statusColor') || this.getStatusColor(status);
    const createdAt = getDateFromAttr(transaction, 'createdAt');

    if (type === 'deposit') {
      // Only deposit records now
      return this.renderDepositRecord(transaction, platform, amount, status, statusColor, createdAt, transactionId);
    } else {
      return this.renderWithdrawalTransaction(transaction, platform, amount, status, createdAt, transactionId);
    }
  }

  private renderWithdrawalTransaction(
    transaction: Transaction, 
    platform: any, 
    amount: number, 
    status: string, 
    createdAt: Date, 
    transactionId: string
  ): Mithril.Children {
    const accountDetails = getAttr(transaction, 'accountDetails') || '';

    return (
      <div key={transactionId} className="FundsPage-withdrawal-HistoryItem">
        <div className="FundsPage-withdrawal-HistoryHeader">
          <div className="FundsPage-withdrawal-HistoryPlatform">
            <div className="FundsPage-withdrawal-PlatformIcon">
              <PlatformIcon platform={platform} size="small" />
            </div>
            <div className="FundsPage-withdrawal-HistoryInfo">
              <div className="FundsPage-withdrawal-HistoryPlatformName">
                {this.getPlatformName(platform)}
              </div>
              <div className="FundsPage-withdrawal-HistoryDate">
                {createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString()}
              </div>
            </div>
          </div>
          <StatusBadge status={status as any} />
        </div>
        <div className="FundsPage-withdrawal-HistoryDetails">
          <div className="FundsPage-withdrawal-HistoryAmount">
            <span className="FundsPage-withdrawal-HistoryLabel">
              {app.translator.trans('funds.forum.history.amount')}:
            </span>
            <span className="FundsPage-withdrawal-HistoryValue">
              {amount} {this.getPlatformSymbol(platform)}
            </span>
          </div>
          <div className="FundsPage-withdrawal-HistoryAddress">
            <span className="FundsPage-withdrawal-HistoryLabel">
              {app.translator.trans('funds.forum.history.address')}:
            </span>
            <span className="FundsPage-withdrawal-HistoryValue">
              {accountDetails}
            </span>
          </div>
        </div>
      </div>
    );
  }

  private renderDepositRecord(
    transaction: Transaction,
    platform: any,
    amount: number,
    status: string,
    statusColor: string,
    createdAt: Date,
    transactionId: string
  ): Mithril.Children {
    
    const screenshotUrl = getAttr(transaction, 'screenshotUrl');
    const userMessage = getAttr(transaction, 'userMessage');
    const processedAt = getDateFromAttr(transaction, 'processedAt');
    const adminNotes = getAttr(transaction, 'adminNotes');
    const creditedAmount = getAttr(transaction, 'creditedAmount');

    return (
      <div key={transactionId} className="DepositRecord-item">
        <div className="DepositRecord-itemHeader">
          <div className="DepositRecord-itemPlatform">
            {platform && (
              <>
                <div className="DepositRecord-itemIcon">
                  {this.renderPlatformIcon(platform)}
                </div>
                <div className="DepositRecord-itemInfo">
                  <span className="DepositRecord-itemCurrency">
                    {getAttr(platform, 'symbol')} {getAttr(platform, 'network') && `(${getAttr(platform, 'network')})`}
                  </span>
                  <span className="DepositRecord-itemType">
                    Manual Deposit
                  </span>
                </div>
              </>
            )}
          </div>
          
          <div className="DepositRecord-itemAmount">
            <span className="DepositRecord-itemAmountValue">
              +{amount} {platform ? getAttr(platform, 'symbol') : ''}
            </span>
            <div className={`DepositRecord-itemStatus status-${statusColor}`}>
              {this.getStatusIcon(status)}
              {this.getStatusText(status)}
            </div>
          </div>
        </div>

        <div className="DepositRecord-itemDetails">
          <div className="DepositRecord-itemMeta">
            <span className="DepositRecord-itemTime">
              Submitted: {createdAt ? humanTime(createdAt) : 'Unknown time'}
            </span>
            
            
          </div>

          <div className="DepositRecord-itemInfo">
            
            
            {userMessage && (
              <div className="DepositRecord-itemRow">
                <span className="DepositRecord-itemLabel">Message:</span>
                <span className="DepositRecord-itemValue">{userMessage}</span>
              </div>
            )}
            
            {screenshotUrl && (
              <div className="DepositRecord-itemRow">
                <span className="DepositRecord-itemLabel">Screenshot:</span>
                <a href={screenshotUrl} target="_blank" rel="noopener noreferrer" className="DepositRecord-itemLink">
                  View Screenshot {icon('fas fa-external-link-alt')}
                </a>
              </div>
            )}
          </div>

          {processedAt && (
            <div className="DepositRecord-itemProcessed">
              <div className="DepositRecord-itemProcessedTime">
                Processed: {humanTime(processedAt)}
              </div>
              
              {creditedAmount && creditedAmount !== amount && (
                <div className="DepositRecord-itemCredited">
                  Credited Amount: {creditedAmount} {platform ? getAttr(platform, 'symbol') : ''}
                </div>
              )}
              
              {adminNotes && (
                <div className="DepositRecord-itemNotes">
                  <span className="DepositRecord-itemLabel">Admin Notes:</span>
                  <span className="DepositRecord-itemValue">{adminNotes}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }


  private getTransactionId(transaction: Transaction): string {
    if (typeof transaction.id === 'function') {
      return `transaction-${transaction.id()}`;
    }
    return `transaction-${getIdString(transaction) || Math.random()}`;
  }

  private getPlatform(transaction: Transaction, platforms: any[]): any {
    const platformId = this.getPlatformId(transaction);
    return findPlatformById(platforms, platformId);
  }

  private getPlatformId(transaction: Transaction): string | number {
    return getAttr(transaction, 'platformId') || 
           (transaction.relationships?.platform?.data?.id) || '';
  }

  private getPlatformName(platform: any): string {
    if (!platform) return 'Unknown Platform';
    return getAttr(platform, 'name') || 'Unknown Platform';
  }

  private getPlatformSymbol(platform: any): string {
    if (!platform) return '';
    return getAttr(platform, 'symbol') || '';
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
      case 'confirmed':
      case 'completed':
        return 'success';
      case 'rejected':
      case 'failed':
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  private renderPlatformIcon(platform: any): Mithril.Children {
    const iconUrl = getAttr(platform, 'iconUrl');
    const iconClass = getAttr(platform, 'iconClass');
    const symbol = getAttr(platform, 'symbol');

    if (iconUrl) {
      return <img src={iconUrl} alt={symbol} className="DepositHistory-platformImg" />;
    }

    if (iconClass) {
      return icon(iconClass);
    }

    // Fallback to generic icon - use platform-configurable icons only
    return icon('fas fa-coins');
  }

  private getStatusIcon(status: string): Mithril.Children {
    switch (status) {
      case 'pending':
        return icon('fas fa-clock');
      case 'approved':
      case 'confirmed':
        return icon('fas fa-check-circle');
      case 'completed':
        return icon('fas fa-check-double');
      case 'rejected':
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
      case 'approved':
        return 'Approved';
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Rejected';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

}