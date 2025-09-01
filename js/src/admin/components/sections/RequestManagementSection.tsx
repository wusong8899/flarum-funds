import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import type Mithril from 'mithril';
import WithdrawalRequest from '../../../common/models/WithdrawalRequest';
import WithdrawalRequestItem from '../items/WithdrawalRequestItem';

export interface RequestManagementSectionAttrs {
  requests: WithdrawalRequest[];
  onUpdateRequestStatus: (request: WithdrawalRequest, status: string) => Promise<void>;
  onDeleteRequest: (request: WithdrawalRequest) => void;
}

export default class RequestManagementSection extends Component<RequestManagementSectionAttrs> {
  view(): Mithril.Children {
    const { requests, onUpdateRequestStatus, onDeleteRequest } = this.attrs;

    const pendingRequests = requests.filter(r => r.status() === 'pending');
    const processedRequests = requests.filter(r => r.status() !== 'pending');

    return (
      <div className="WithdrawalManagementPage-section">
        <h3>{app.translator.trans('funds.admin.requests.title')}</h3>
        
        <div className="WithdrawalManagementPage-pendingRequests">
          <h4>{app.translator.trans('funds.admin.requests.pending_title')}</h4>
          {pendingRequests.length === 0 ? (
            <p>{app.translator.trans('funds.admin.requests.no_pending')}</p>
          ) : (
            pendingRequests.map((request) => (
              <WithdrawalRequestItem
                key={request.id()}
                request={request}
                showActions={true}
                showDelete={true}
                onUpdateStatus={onUpdateRequestStatus}
                onDelete={onDeleteRequest}
              />
            ))
          )}
        </div>

        <div className="WithdrawalManagementPage-processedRequests">
          <h4>{app.translator.trans('funds.admin.requests.processed_title')}</h4>
          {processedRequests.length === 0 ? (
            <p>{app.translator.trans('funds.admin.requests.no_processed')}</p>
          ) : (
            processedRequests.map((request) => (
              <WithdrawalRequestItem
                key={request.id()}
                request={request}
                showActions={false}
                showDelete={true}
                onDelete={onDeleteRequest}
              />
            ))
          )}
        </div>
      </div>
    );
  }
}