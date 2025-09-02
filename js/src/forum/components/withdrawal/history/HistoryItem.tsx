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
      <div key={getIdString(request)} className="FundsPage-withdrawal-HistoryItem">
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
                {date.toLocaleDateString()} {date.toLocaleTimeString()}
              </div>
            </div>
          </div>
          <StatusBadge status={status} />
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

  private getPlatformId(request: WithdrawalRequest): string | number {
    const platform = request.platform();
    return getAttr(request, 'platformId') || 
          (platform && typeof platform === 'object' ? platform.id() : '') || '';
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