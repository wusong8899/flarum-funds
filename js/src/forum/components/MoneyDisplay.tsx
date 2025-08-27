import Component, { ComponentAttrs } from 'flarum/common/Component';
import app from 'flarum/forum/app';
import type Mithril from 'mithril';

/**
 * MoneyDisplay component shows the user's money balance with withdrawal button
 */
export default class MoneyDisplay extends Component<ComponentAttrs> {
  view(): Mithril.Children {
    if (!app.session.user) {
      return null;
    }

    const moneyName = app.forum.attribute('antoinefr-money.moneyname') || '[money]';
    const userMoneyText = moneyName.replace('[money]', app.session.user.attribute("money"));
    const iconUrl = app.forum.attribute('wusong8899-withdrawal.moneyIconUrl') || 'https://i.mji.rip/2025/08/28/cd18932c68e9bbee9502b1fb6317cba9.png';

    return (
      <div
        id="moneyDisplayContainer"
        className="client1-header-adv-wrapper clientCustomizeWithdrawalHeaderTotalMoney"
      >
        <div className="clientCustomizeWithdrawalHeaderText">
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
                // Fallback to default icon if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallbackIcon = document.createElement('i');
                fallbackIcon.className = 'fas fa-yen-sign';
                fallbackIcon.style.color = '#ffffff';
                fallbackIcon.style.fontSize = '14px';
                target.parentNode?.appendChild(fallbackIcon);
              }}
            />
          </span>
          {userMoneyText}
        </div>
        
        <div className="clientCustomizeWithdrawalHeaderIcon">
          <i className="fas fa-wallet" />
        </div>

        <div
          className="clientCustomizeWithdrawalButton"
          onclick={this.handleWithdrawalClick.bind(this)}
          title="提款"
        >
          <i className="fas fa-money-bill-transfer" />
          <span style={{ marginLeft: '4px', fontSize: '12px' }}>提款</span>
        </div>
      </div>
    );
  }

  /**
   * Handle withdrawal button click
   */
  private handleWithdrawalClick(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to withdrawal page
    window.location.href = '/withdrawal';
  }
}