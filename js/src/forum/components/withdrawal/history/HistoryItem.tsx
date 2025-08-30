import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import type Mithril from 'mithril';
import type { StatusType } from '../types/interfaces';
import WithdrawalPlatform from '../../../../common/models/WithdrawalPlatform';
import WithdrawalRequest from '../../../../common/models/WithdrawalRequest';
import PlatformIcon from '../common/PlatformIcon';
import StatusBadge from '../common/StatusBadge';
import { getAttr, findPlatformById, getDateFromAttr, getIdString } from '../utils/modelHelpers';

interface HistoryItemProps {
  request: WithdrawalRequest;
  platforms: WithdrawalPlatform[];
}

export default class HistoryItem extends Component<HistoryItemProps> {
  view(): Mithril.Children {
    const { request, platforms } = this.attrs;

    // Add null checks and handle both Model instances and plain objects
    if (!request) {
      return null;
    }

    const platformId = this.getPlatformId(request);
    const platform = findPlatformById(platforms, platformId);
    
    const status = (getAttr(request, 'status') || 'pending') as StatusType;
    const date = getDateFromAttr(request, 'createdAt');
    const amount = getAttr(request, 'amount') || 0;
    const accountDetails = getAttr(request, 'accountDetails') || '';

    console.log('Looking for platform with ID:', platformId, 'Available platforms:', platforms.map(p => ({ id: getIdString(p), name: getAttr(p, 'name') })));

    return (
      <div key={getIdString(request)} className="WithdrawalPage-historyItem">
        <div className="WithdrawalPage-historyHeader">
          <div className="WithdrawalPage-historyPlatform">
            <div className="WithdrawalPage-platformIcon">
              <PlatformIcon platform={platform} size="small" />
            </div>
            <div className="WithdrawalPage-historyInfo">
              <div className="WithdrawalPage-historyPlatformName">
                {this.getPlatformName(platform)}
              </div>
              <div className="WithdrawalPage-historyDate">
                {date.toLocaleDateString()} {date.toLocaleTimeString()}
              </div>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
        <div className="WithdrawalPage-historyDetails">
          <div className="WithdrawalPage-historyAmount">
            <span className="WithdrawalPage-historyLabel">
              {app.translator.trans('withdrawal.forum.history.amount')}:
            </span>
            <span className="WithdrawalPage-historyValue">
              {amount} {this.getPlatformSymbol(platform)}
            </span>
          </div>
          <div className="WithdrawalPage-historyAddress">
            <span className="WithdrawalPage-historyLabel">
              {app.translator.trans('withdrawal.forum.history.address')}:
            </span>
            <span className="WithdrawalPage-historyValue">
              {accountDetails}
            </span>
          </div>
        </div>
      </div>
    );
  }

  private getPlatformId(request: WithdrawalRequest): string | number {
    return getAttr(request, 'platformId') || 
          (request.relationships?.platform?.data?.id) || '';
  }

  private getPlatformName(platform: WithdrawalPlatform | null): string {
    if (!platform) return 'Unknown Platform';
    return getAttr(platform, 'name') || 'Unknown Platform';
  }

  private getPlatformSymbol(platform: WithdrawalPlatform | null): string {
    if (!platform) return '';
    return getAttr(platform, 'symbol') || '';
  }
}