import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Switch from 'flarum/common/components/Switch';
import humanTime from 'flarum/common/helpers/humanTime';
import icon from 'flarum/common/helpers/icon';
import m from 'mithril';
import type Mithril from 'mithril';

// Generic platform interface that can represent both withdrawal and deposit platforms
interface GenericPlatform {
  id?: () => string | number;
  name?: () => string;
  symbol?: () => string;
  network?: () => string;
  displayName?: () => string;
  minAmount?: () => number;
  maxAmount?: () => number;
  fee?: () => number;
  address?: () => string;
  iconUrl?: () => string;
  iconClass?: () => string;
  isActive?: () => boolean;
  createdAt?: () => Date;
  [key: string]: any;
}

interface GenericPlatformListItemAttrs {
  platform: GenericPlatform;
  type: 'withdrawal' | 'deposit';
  onToggleStatus: (platform?: GenericPlatform) => Promise<void>;
  onDelete: (platform?: GenericPlatform) => Promise<void>;
  style?: 'card' | 'list';
}

export default class GenericPlatformListItem extends Component<GenericPlatformListItemAttrs> {
  view(vnode: Mithril.Vnode<GenericPlatformListItemAttrs>): Mithril.Children {
    const { platform, type, onToggleStatus, onDelete, style = 'card' } = vnode.attrs;

    if (style === 'card') {
      return this.renderCardStyle(platform, type, onToggleStatus, onDelete);
    } else {
      return this.renderListStyle(platform, type, onToggleStatus, onDelete);
    }
  }

  private renderCardStyle(
    platform: GenericPlatform,
    type: string,
    onToggleStatus: (platform?: GenericPlatform) => Promise<void>,
    onDelete: (platform?: GenericPlatform) => Promise<void>
  ): Mithril.Children {
    const platformData = this.extractPlatformData(platform);
    const translationPrefix = type === 'withdrawal' ? 'withdrawal.admin.platforms' : 'withdrawal.admin.deposit.platforms';

    return (
      <div key={platformData.id} className={`${type}Platform`}>
        <div className={`${type}Platform-info`}>
          <div className={`${type}Platform-primary`}>
            <span className={`${type}Platform-status ${platformData.isActive ? 'active' : 'inactive'}`}>
              {platformData.isActive ? '🟢' : '🔴'}
            </span>
            <span className={`${type}Platform-name`}>{platformData.displayName}</span>
            <span className="platform-id">#{platformData.id}</span>
            {platformData.network && <span className={`${type}Platform-network`}>({platformData.network})</span>}
          </div>
          <div className={`${type}Platform-details`}>
            <span className={`${type}Platform-amounts`}>
              Min: {platformData.minAmount} | Max: {platformData.maxAmount}
              {` | Fee: ${platformData.fee}`}
              {type === 'deposit' && ` | Address: ${platformData.address ? 'Static' : 'Template'}`}
            </span>
            {platformData.createdDate && (
              <span className={`${type}Platform-date`}>{platformData.dateDisplay}</span>
            )}
          </div>
        </div>
        <div className={`${type}Platform-actions`}>
          <Button
            className={`Button ${platformData.isActive ? 'Button--secondary' : 'Button--primary'}`}
            onclick={() => onToggleStatus(platform)}
          >
            {app.translator.trans(`${translationPrefix}.${platformData.isActive ? 'disable' : 'enable'}`)}
          </Button>
          <Button
            className="Button Button--danger"
            onclick={() => onDelete(platform)}
          >
            {app.translator.trans(`${translationPrefix}.delete`)}
          </Button>
        </div>
      </div>
    );
  }

  private renderListStyle(
    platform: GenericPlatform,
    type: string,
    onToggleStatus: (platform?: GenericPlatform) => Promise<void>,
    onDelete: (platform?: GenericPlatform) => Promise<void>
  ): Mithril.Children {
    const platformData = this.extractPlatformData(platform);
    const translationPrefix = type === 'withdrawal' ? 'withdrawal.admin.platforms' : 'withdrawal.admin.deposit.platforms';

    return (
      <div className={`${type}PlatformListItem`}>
        <div className={`${type}PlatformListItem-content`}>
          <div className={`${type}PlatformListItem-icon`}>
            {this.renderPlatformIcon(platform)}
          </div>
          
          <div className={`${type}PlatformListItem-info`}>
            <div className={`${type}PlatformListItem-primary`}>
              <strong>{platformData.name}</strong>
              <span className={`${type}PlatformListItem-displayName`}>
                {platformData.symbol}
                {platformData.network && ` (${platformData.network})`}
              </span>
            </div>
            
            <div className={`${type}PlatformListItem-details`}>
              <span className={`${type}PlatformListItem-detail`}>
                Min: {platformData.minAmount} {platformData.symbol}
              </span>
              {platformData.maxAmount && (
                <span className={`${type}PlatformListItem-detail`}>
                  Max: {platformData.maxAmount} {platformData.symbol}
                </span>
              )}
              {platformData.fee && (
                <span className={`${type}PlatformListItem-detail`}>
                  Fee: {platformData.fee} {platformData.symbol}
                </span>
              )}
              {type === 'deposit' && (
                <span className={`${type}PlatformListItem-detail`}>
                  Address: {platformData.address ? 'Static' : 'Template'}
                </span>
              )}
            </div>
          </div>
          
          <div className={`${type}PlatformListItem-actions`}>
            <Switch 
              state={platformData.isActive} 
              onchange={async () => {
                await onToggleStatus(platform);
                m.redraw();
              }}
            >
              {platformData.isActive 
                ? app.translator.trans(`${translationPrefix}.active`)
                : app.translator.trans(`${translationPrefix}.inactive`)
              }
            </Switch>
            
            <Button
              className="Button Button--icon Button--flat"
              icon="fas fa-trash"
              onclick={async () => {
                await onDelete(platform);
                m.redraw();
              }}
              title={app.translator.trans(`${translationPrefix}.delete`)}
            />
          </div>
        </div>
      </div>
    );
  }

  private extractPlatformData(platform: GenericPlatform) {
    // Handle both Model instances and plain objects
    const id = typeof platform.id === 'function' ? platform.id() : platform.id;
    const name = (typeof platform.name === 'function' ? platform.name() : platform.data?.attributes?.name) || 'Unknown Platform';
    const symbol = (typeof platform.symbol === 'function' ? platform.symbol() : platform.data?.attributes?.symbol) || '';
    const network = (typeof platform.network === 'function' ? platform.network() : platform.data?.attributes?.network) || null;
    const displayName = (typeof platform.displayName === 'function' ? platform.displayName() : platform.data?.attributes?.displayName) || name;
    const minAmount = (typeof platform.minAmount === 'function' ? platform.minAmount() : platform.data?.attributes?.minAmount) || 'N/A';
    const maxAmount = (typeof platform.maxAmount === 'function' ? platform.maxAmount() : platform.data?.attributes?.maxAmount) || 'N/A';
    const fee = (typeof platform.fee === 'function' ? platform.fee() : platform.data?.attributes?.fee) || 'N/A';
    const address = (typeof platform.address === 'function' ? platform.address() : platform.data?.attributes?.address) || null;
    const isActive = (typeof platform.isActive === 'function' ? platform.isActive() : platform.data?.attributes?.isActive) ?? false;
    const createdDate = (typeof platform.createdAt === 'function' ? platform.createdAt() : platform.data?.attributes?.createdAt) || null;
    
    let dateDisplay: Mithril.Children = 'N/A';
    if (createdDate) {
      try {
        dateDisplay = humanTime(createdDate);
      } catch (e) {
        console.error('Error formatting date:', e);
        dateDisplay = 'Invalid Date';
      }
    }

    return {
      id,
      name,
      symbol,
      network,
      displayName,
      minAmount,
      maxAmount,
      fee,
      address,
      isActive,
      createdDate,
      dateDisplay
    };
  }

  private renderPlatformIcon(platform: GenericPlatform): Mithril.Children {
    const iconUrl = typeof platform.iconUrl === 'function' ? platform.iconUrl() : platform.attributes?.iconUrl;
    const iconClass = typeof platform.iconClass === 'function' ? platform.iconClass() : platform.attributes?.iconClass;
    const symbol = typeof platform.symbol === 'function' ? platform.symbol() : platform.attributes?.symbol;

    if (iconUrl) {
      return <img src={iconUrl} alt={symbol} className="PlatformListItem-img" />;
    }

    if (iconClass) {
      return icon(iconClass);
    }

    // Default currency icons - now uses generic class names that work for both types
    switch (symbol) {
      case 'USDT':
        return <span className="PlatformListItem-currencyIcon usdt">₮</span>;
      case 'USDC':
        return <span className="PlatformListItem-currencyIcon usdc">$</span>;
      case 'BTC':
        return <span className="PlatformListItem-currencyIcon btc">₿</span>;
      case 'ETH':
        return <span className="PlatformListItem-currencyIcon eth">Ξ</span>;
      default:
        return icon('fas fa-coins');
    }
  }
}