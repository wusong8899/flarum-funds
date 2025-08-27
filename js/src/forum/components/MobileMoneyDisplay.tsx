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
    const iconUrl = app.forum.attribute('wusong8899-withdrawal.moneyIconUrl') || 'https://i.mji.rip/2025/08/28/63ef70196bd4a72d61206edad826aea5.png';

    return (
      <div className="Navigation-mobileMoneyDisplay">
        <div 
          className="Navigation-moneySection"
          onclick={this.handleWithdrawalClick.bind(this)}
          title={`余额: ${userMoney} - 点击提款`}
        >
          {/* 货币图标和金额显示 */}
          <div className="Navigation-moneyText">
            <span style={{ 
              backgroundColor: '#ffd700', 
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
                  width: '12px', 
                  height: '12px', 
                  filter: 'brightness(0) invert(1)' // Makes image white
                }}
                onError={(e: Event) => {
                  // Fallback to default icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallbackIcon = document.createElement('i');
                  fallbackIcon.className = 'fas fa-yen-sign';
                  fallbackIcon.style.color = '#ffffff';
                  fallbackIcon.style.fontSize = '12px';
                  target.parentNode?.appendChild(fallbackIcon);
                }}
              />
            </span>
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
      // 直接导航到提现页面
      window.location.href = '/withdrawal';
    } catch (error) {
      console.error('Navigation error:', error);
      // 备用方案
      window.location.href = '/withdrawal';
    }
  }
}