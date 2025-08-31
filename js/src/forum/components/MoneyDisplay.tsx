import Component, { ComponentAttrs } from 'flarum/common/Component';
import app from 'flarum/forum/app';
import type Mithril from 'mithril';

/**
 * MoneyDisplay component shows the user's money balance with funds button
 */
export default class MoneyDisplay extends Component<ComponentAttrs> {
  view(): Mithril.Children {
    if (!app.session.user) {
      return null;
    }

    const moneyName: string = app.forum.attribute('antoinefr-money.moneyname') || '[money]';
    const userMoneyText: string = moneyName.replace('[money]', app.session.user.attribute("money"));
    const iconUrl: string | null = app.forum.attribute('wusong8899-funds.moneyIconUrl');

    return (
      <div
        id="moneyDisplayContainer"
        className="client1-header-adv-wrapper clientCustomizeWithdrawalHeaderTotalMoney"
      >
        <div className="clientCustomizeWithdrawalHeaderText">
          {iconUrl && iconUrl.trim() && (
            <span style={{  
              borderRadius: '50%', 
              padding: '6px 8px', 
              marginRight: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={iconUrl} 
                alt="Money icon" 
                style={{ 
                  width: '20px', 
                  height: '20px'
                }}
                onError={(e: Event) => {
                  // Hide image if it fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </span>
          )}
          {userMoneyText}
        </div>
        
        <div className="clientCustomizeWithdrawalHeaderIcon">
          <i className="fas fa-wallet" />
        </div>

        <div className="clientCustomizeWithdrawalButtons">
          <div
            className="clientCustomizeWithdrawalButton"
            onclick={this.handleWithdrawalClick.bind(this)}
            title="提款"
          >
            <i className="fas fa-money-bill-transfer" />
            <span style={{ marginLeft: '4px', fontSize: '12px' }}>提款</span>
          </div>
          <div
            className="clientCustomizeDepositButton"
            onclick={this.handleDepositClick.bind(this)}
            title="存款"
            style={{ marginLeft: '8px' }}
          >
            <i className="fas fa-coins" />
            <span style={{ marginLeft: '4px', fontSize: '12px' }}>存款</span>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Handle funds button click
   */
  private handleWithdrawalClick(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to funds page with funds tab
    window.location.href = '/funds?tab=funds';
  }

  /**
   * Handle deposit button click
   */
  private handleDepositClick(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to funds page with deposit tab
    window.location.href = '/funds?tab=deposit';
  }
}