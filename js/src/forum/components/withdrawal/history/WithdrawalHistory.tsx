import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import type Mithril from 'mithril';
import type { WithdrawalPlatform, WithdrawalRequest } from '../types/interfaces';
import HistoryItem from './HistoryItem';
import EmptyState from '../common/EmptyState';
import LoadingState from '../common/LoadingState';

interface WithdrawalHistoryProps {
  requests: WithdrawalRequest[];
  platforms: WithdrawalPlatform[];
  loading: boolean;
}

export default class WithdrawalHistory extends Component<WithdrawalHistoryProps> {
  view(): Mithril.Children {
    const { requests, platforms, loading } = this.attrs;

    if (loading) {
      return <LoadingState className="WithdrawalPage-historyLoading" />;
    }

    if (!requests || requests.length === 0) {
      return (
        <EmptyState
          iconName="fas fa-history"
          title={app.translator.trans('withdrawal.forum.history.empty.title')}
          description={app.translator.trans('withdrawal.forum.history.empty.description')}
          className="WithdrawalPage-historyEmpty"
        />
      );
    }

    return (
      <div className="WithdrawalPage-historyList">
        {requests.map(request => (
          <HistoryItem
            key={this.getRequestKey(request)}
            request={request}
            platforms={platforms}
          />
        ))}
      </div>
    );
  }

  private getRequestKey(request: WithdrawalRequest): string {
    // Handle both Flarum Model instances and plain objects
    if (typeof request.id === 'function') {
      return `request-${request.id()}`;
    }
    return `request-${request.id || Math.random()}`;
  }
}