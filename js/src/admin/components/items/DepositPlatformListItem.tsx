import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Switch from 'flarum/common/components/Switch';
import icon from 'flarum/common/helpers/icon';
import type Mithril from 'mithril';
import type DepositPlatform from '../../../common/models/DepositPlatform';

export interface DepositPlatformListItemAttrs {
  platform: DepositPlatform;
  onToggleStatus: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export default class DepositPlatformListItem extends Component<DepositPlatformListItemAttrs> {
  view(vnode: Mithril.Vnode<DepositPlatformListItemAttrs>) {
    const { platform, onToggleStatus, onDelete } = vnode.attrs;

    return (
      <div className="DepositPlatformListItem">
        <div className="DepositPlatformListItem-content">
          <div className="DepositPlatformListItem-icon">
            {this.renderPlatformIcon(platform)}
          </div>
          
          <div className="DepositPlatformListItem-info">
            <div className="DepositPlatformListItem-primary">
              <strong>{platform.name()}</strong>
              <span className="DepositPlatformListItem-displayName">
                {platform.symbol()} ({platform.network()})
              </span>
            </div>
            
            <div className="DepositPlatformListItem-details">
              <span className="DepositPlatformListItem-detail">
                Min: {platform.minAmount()} {platform.symbol()}
              </span>
              {platform.maxAmount && (
                <span className="DepositPlatformListItem-detail">
                  Max: {platform.maxAmount()} {platform.symbol()}
                </span>
              )}
              <span className="DepositPlatformListItem-detail">
                Address: {platform.address() ? 'Static' : 'Template'}
              </span>
            </div>
          </div>
          
          <div className="DepositPlatformListItem-actions">
            <Switch 
              state={platform.isActive()} 
              onchange={onToggleStatus}
            >
              {platform.isActive() 
                ? app.translator.trans('withdrawal.admin.deposit.platforms.active')
                : app.translator.trans('withdrawal.admin.deposit.platforms.inactive')
              }
            </Switch>
            
            <Button
              className="Button Button--icon Button--flat"
              icon="fas fa-trash"
              onclick={onDelete}
              title={app.translator.trans('withdrawal.admin.deposit.platforms.delete')}
            />
          </div>
        </div>
      </div>
    );
  }

  private renderPlatformIcon(platform: DepositPlatform): Mithril.Children {
    if (platform.iconUrl()) {
      return <img src={platform.iconUrl()} alt={platform.symbol()} className="DepositPlatformListItem-img" />;
    }

    if (platform.iconClass()) {
      return icon(platform.iconClass());
    }

    // Default currency icons
    switch (platform.symbol()) {
      case 'USDT':
        return <span className="DepositPlatformListItem-currencyIcon usdt">₮</span>;
      case 'USDC':
        return <span className="DepositPlatformListItem-currencyIcon usdc">$</span>;
      case 'BTC':
        return <span className="DepositPlatformListItem-currencyIcon btc">₿</span>;
      case 'ETH':
        return <span className="DepositPlatformListItem-currencyIcon eth">Ξ</span>;
      default:
        return icon('fas fa-coins');
    }
  }
}