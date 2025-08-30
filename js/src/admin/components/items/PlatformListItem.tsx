import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import humanTime from 'flarum/common/helpers/humanTime';
import type Mithril from 'mithril';
import { WithdrawalPlatform } from '../types/AdminTypes';

export interface PlatformListItemAttrs {
  platform: WithdrawalPlatform;
  onToggleStatus: (platform: WithdrawalPlatform) => Promise<void>;
  onDelete: (platform: WithdrawalPlatform) => void;
}

export default class PlatformListItem extends Component<PlatformListItemAttrs> {
  view(): Mithril.Children {
    const platform = this.attrs.platform;
    
    // Handle both Model instances and plain objects
    const platformId = typeof platform.id === 'function' ? platform.id() : platform.id;
    const platformName = (typeof platform.name === 'function' ? platform.name() : platform.attributes?.name) || 'Unknown Platform';
    const network = (typeof platform.network === 'function' ? platform.network() : platform.attributes?.network) || null;
    const displayName = (typeof platform.displayName === 'function' ? platform.displayName() : platform.attributes?.displayName) || platformName;
    const minAmount = (typeof platform.minAmount === 'function' ? platform.minAmount() : platform.attributes?.minAmount) || 'N/A';
    const maxAmount = (typeof platform.maxAmount === 'function' ? platform.maxAmount() : platform.attributes?.maxAmount) || 'N/A';
    const fee = (typeof platform.fee === 'function' ? platform.fee() : platform.attributes?.fee) || 'N/A';
    const isActive = (typeof platform.isActive === 'function' ? platform.isActive() : platform.attributes?.isActive) ?? false;
    const createdDate = (typeof platform.createdAt === 'function' ? platform.createdAt() : platform.attributes?.createdAt) || null;
    
    let dateDisplay: Mithril.Children = 'N/A';
    if (createdDate) {
      try {
        dateDisplay = humanTime(createdDate);
      } catch (e) {
        console.error('Error formatting date:', e);
        dateDisplay = 'Invalid Date';
      }
    }
    
    return (
      <div key={platformId} className="WithdrawalPlatform">
        <div className="WithdrawalPlatform-info">
          <div className="WithdrawalPlatform-primary">
            <span className={`WithdrawalPlatform-status ${isActive ? 'active' : 'inactive'}`}>
              {isActive ? '🟢' : '🔴'}
            </span>
            <span className="WithdrawalPlatform-name">{displayName}</span>
            <span className="platform-id">#{platformId}</span>
            {network && <span className="WithdrawalPlatform-network">({network})</span>}
          </div>
          <div className="WithdrawalPlatform-details">
            <span className="WithdrawalPlatform-amounts">
              Min: {minAmount} | Max: {maxAmount} | Fee: {fee}
            </span>
            <span className="WithdrawalPlatform-date">{dateDisplay}</span>
          </div>
        </div>
        <div className="WithdrawalPlatform-actions">
          <Button
            className={`Button ${isActive ? 'Button--secondary' : 'Button--primary'}`}
            onclick={() => this.attrs.onToggleStatus(platform)}
          >
            {app.translator.trans(`withdrawal.admin.platforms.${isActive ? 'disable' : 'enable'}`)}
          </Button>
          <Button
            className="Button Button--danger"
            onclick={() => this.attrs.onDelete(platform)}
          >
            {app.translator.trans('withdrawal.admin.platforms.delete')}
          </Button>
        </div>
      </div>
    );
  }
}