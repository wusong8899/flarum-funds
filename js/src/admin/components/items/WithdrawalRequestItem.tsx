import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import humanTime from 'flarum/common/helpers/humanTime';
import type Mithril from 'mithril';
import { WithdrawalRequest } from '../types/AdminTypes';

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
    
    // Handle Flarum Model instances
    const requestId = typeof request.id === 'function' ? request.id() : request.id;
    const amount = typeof request.amount === 'function' ? request.amount() : (request.attributes?.amount || 0);
    const status = typeof request.status === 'function' ? request.status() : (request.attributes?.status || 'pending');
    const accountDetails = typeof request.accountDetails === 'function' ? request.accountDetails() : 
      (request.attributes?.accountDetails || request.attributes?.account_details || 'N/A');
    const createdDate = typeof request.createdAt === 'function' ? request.createdAt() : (request.attributes?.createdAt || null);
    
    // Get user info
    let userName = 'Unknown User';
    if (typeof request.user === 'function') {
      const userData = request.user();
      if (userData && typeof userData.displayName === 'function') {
        userName = userData.displayName();
      } else if (userData && userData.attributes?.displayName) {
        userName = userData.attributes.displayName;
      }
    }
    
    // Get platform info - simplified approach using Flarum Model relationships
    let platformName = 'Unknown Platform';
    let platformSymbol = 'N/A';
    
    if (typeof request.platform === 'function') {
      const platform = request.platform();
      if (platform) {
        platformName = typeof platform.name === 'function' ? platform.name() : (platform.attributes?.name || 'Unknown Platform');
        platformSymbol = typeof platform.symbol === 'function' ? platform.symbol() : (platform.attributes?.symbol || 'N/A');
      }
    }
    
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
            <strong>{app.translator.trans('withdrawal.admin.requests.account_details')}:</strong>
            <span>{accountDetails}</span>
          </div>
          <div className="WithdrawalRequest-status">
            <span className={`Badge Badge--${status}`}>
              {app.translator.trans(`withdrawal.admin.requests.status.${status}`)}
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
                  {app.translator.trans('withdrawal.admin.requests.approve')}
                </Button>
                <Button
                  className="Button Button--danger"
                  onclick={() => this.attrs.onUpdateStatus!(request, 'rejected')}
                >
                  {app.translator.trans('withdrawal.admin.requests.reject')}
                </Button>
              </>
            )}
            {this.attrs.onDelete && (
              <Button
                className="Button Button--link"
                onclick={() => this.attrs.onDelete!(request)}
              >
                <i className="fas fa-trash"></i>
                {app.translator.trans('withdrawal.admin.requests.delete')}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
}