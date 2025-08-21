import Component, { ComponentAttrs } from 'flarum/common/Component';
import app from 'flarum/forum/app';
import { ConfigManager } from '../utils/ConfigManager';
import type Mithril from 'mithril';

/**
 * MoneyDisplay component shows the user's money balance with withdrawal button
 */
export default class MoneyDisplay extends Component<ComponentAttrs> {
  private configManager = ConfigManager.getInstance();

  view(): Mithril.Children {
    // Only show for logged-in users on tags page
    if (!app.session.user || !this.configManager.isTagsPage()) {
      return null;
    }

    const moneyName = app.forum.attribute('antoinefr-money.moneyname') || '[money]';
    const userMoneyText = moneyName.replace('[money]', app.session.user.attribute("money"));

    return (
      <div
        id="moneyDisplayContainer"
        className="client1-header-adv-wrapper clientCustomizeWithdrawalHeaderTotalMoney"
      >
        <div className="clientCustomizeWithdrawalHeaderText">
          <span>
            <i className="fab fa-bitcoin" style={{ paddingRight: '8px', color: 'gold' }} />
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