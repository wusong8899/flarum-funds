import Component, { ComponentAttrs } from 'flarum/common/Component';
import app from 'flarum/forum/app';
import type Mithril from 'mithril';

/**
 * MobileMoneyDisplay component for mobile navigation bar
 * Shows user's money balance with withdrawal button in mobile navigation
 */
export default class MobileMoneyDisplay extends Component<ComponentAttrs> {
  view(): Mithril.Children {
    // Note: Mobile detection and user authentication are now handled in index.ts
    // This component assumes it should render when called
    const userMoney = app.session.user?.attribute('money') || 0;
    const iconUrl = app.forum.attribute('wusong8899-withdrawal.moneyIconUrl');

    return (
      <div className="Navigation-mobileMoneyDisplay">
        <div 
          className="Navigation-moneySection"
          onclick={this.handleWithdrawalClick.bind(this)}
          title={`余额: ${userMoney} - 点击提款`}
        >
          {/* 货币图标和金额显示 */}
          <div className="Navigation-moneyText">
            {iconUrl && iconUrl.trim() && (
              <span style={{  
                borderRadius: '50%', 
                padding: '4px 6px', 
                marginRight: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={iconUrl} 
                  alt="Money icon" 
                  style={{ 
                    width: '18px', 
                    height: '18px'
                  }}
                  onError={(e: Event) => {
                    // Hide image if it fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </span>
            )}
            <span className="Navigation-moneyAmount">{userMoney}</span>
          </div>
          
          {/* 提款按钮 */}
          <div className="Navigation-withdrawalButton">
            <i className="fas fa-money-bill-transfer" />
            <span>提款</span>
          </div>
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
    console.log('MobileMoneyDisplay clicked!'); // 调试日志
    
    try {
      // Navigate to unified funds page with withdrawal tab
      window.location.href = '/funds?tab=withdrawal';
    } catch (error) {
      console.error('Navigation error:', error);
      // 备用方案
      window.location.href = '/funds?tab=withdrawal';
    }
  }
}