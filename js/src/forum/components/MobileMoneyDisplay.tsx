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

    return (
      <div className="Navigation-mobileMoneyDisplay">
        <div 
          className="Navigation-moneySection"
          onclick={this.handleWithdrawalClick.bind(this)}
          title={`余额: ${userMoney} - 点击提款`}
        >
          {/* BTC图标和金额显示 */}
          <div className="Navigation-moneyText">
            <i className="fab fa-bitcoin" style={{ color: '#f7931a', marginRight: '4px' }} />
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