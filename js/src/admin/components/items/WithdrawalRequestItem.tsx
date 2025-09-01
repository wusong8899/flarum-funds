import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import humanTime from 'flarum/common/helpers/humanTime';
import type Mithril from 'mithril';
import WithdrawalRequest from '../../../common/models/WithdrawalRequest';

export interface WithdrawalRequestItemAttrs {
  request: WithdrawalRequest;
  showActions: boolean;
  showDelete?: boolean;
  onUpdateStatus?: (request: WithdrawalRequest, status: string) => Promise<void>;
  onDelete?: (request: WithdrawalRequest) => void;
}

export default class WithdrawalRequestItem extends Component<WithdrawalRequestItemAttrs> {
  view(): Mithril.Children {
    const request = this.attrs.request;
    const { showActions, showDelete = false } = this.attrs;
    
    // Use model methods directly
    const requestId = request.id();
    const amount = request.amount();
    const status = request.status();
    const accountDetails = request.accountDetails();
    const createdDate = request.createdAt();
    
    // Get user info
    const userData = request.user();
    const userName = userData ? userData.displayName() : 'Unknown User';
    
    // Get platform info
    const platform = request.platform();
    const platformName = platform ? platform.name() : 'Unknown Platform';
    const platformSymbol = platform ? platform.symbol() : 'N/A';
    
    const statusClass = `status-${status}`;
    
    let dateDisplay: Mithril.Children = 'N/A';
    if (createdDate) {
      try {
        dateDisplay = humanTime(createdDate);
      } catch (e) {
        console.error('Error formatting request date:', e);
        dateDisplay = 'Invalid Date';
      }
    }

    return (
      <div key={requestId} className={`WithdrawalRequest ${statusClass}`}>
        <div className="WithdrawalRequest-info">
          <div className="WithdrawalRequest-user">
            <strong>{userName}</strong>
            <span className="request-id">#{requestId}</span>
          </div>
          <div className="WithdrawalRequest-details">
            <span className="amount">{amount}</span>
            <span className="platform">{platformName}</span>
            <span className="symbol">{platformSymbol}</span>
            <span className="date">{dateDisplay}</span>
          </div>
          <div className="WithdrawalRequest-account">
            <strong>{app.translator.trans('funds.admin.requests.account_details')}:</strong>
            <span>{accountDetails}</span>
          </div>
          <div className="WithdrawalRequest-status">
            <span className={`Badge Badge--${status}`}>
              {app.translator.trans(`funds.admin.requests.status.${status}`)}
            </span>
          </div>
        </div>
        
        {(showActions || showDelete) && (
          <div className="WithdrawalRequest-actions">
            {showActions && this.attrs.onUpdateStatus && (
              <>
                <Button
                  className="Button Button--primary"
                  onclick={() => this.attrs.onUpdateStatus!(request, 'approved')}
                >
                  {app.translator.trans('funds.admin.requests.approve')}
                </Button>
                <Button
                  className="Button Button--danger"
                  onclick={() => this.attrs.onUpdateStatus!(request, 'rejected')}
                >
                  {app.translator.trans('funds.admin.requests.reject')}
                </Button>
              </>
            )}
            {this.attrs.onDelete && (
              <Button
                className="Button Button--link"
                onclick={() => this.attrs.onDelete!(request)}
              >
                <i className="fas fa-trash"></i>
                {app.translator.trans('funds.admin.requests.delete')}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
}