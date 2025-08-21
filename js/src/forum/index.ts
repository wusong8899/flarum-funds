import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import LinkButton from 'flarum/common/components/LinkButton';
import ItemList from 'flarum/common/utils/ItemList';
import HeaderSecondary from 'flarum/forum/components/HeaderSecondary';
import HeaderPrimary from 'flarum/forum/components/HeaderPrimary';
import WithdrawalPage from './components/WithdrawalPage';
import WithdrawalPlatform from '../common/models/WithdrawalPlatform';
import WithdrawalRequest from '../common/models/WithdrawalRequest';
import MoneyDisplay from './components/MoneyDisplay';
import { ConfigManager } from './utils/ConfigManager';
import { MobileDetector } from './utils/MobileDetector';

app.initializers.add('wusong8899-withdrawal', () => {
  // Register models in store
  app.store.models['withdrawal-platforms'] = WithdrawalPlatform;
  app.store.models['withdrawal-requests'] = WithdrawalRequest;
  
  app.routes.withdrawal = { path: '/withdrawal', component: WithdrawalPage };

  extend(HeaderSecondary.prototype, 'items', function (items: ItemList<any>) {
    if (app.session.user) {
      items.add(
        'withdrawal',
        LinkButton.component(
          {
            href: app.route('withdrawal'),
            icon: 'fas fa-money-bill-transfer',
          },
          app.translator.trans('withdrawal.forum.header.withdrawal_button')
        ),
        10
      );
    }
  });

  // Add money display to header primary (desktop)
  extend(HeaderPrimary.prototype, 'view', function (vnode) {
    // Only add on tags page for logged-in users and on desktop
    const configManager = ConfigManager.getInstance();
    if (app.session.user && configManager.isTagsPage() && !MobileDetector.isMobile()) {
      // Add money display to the header primary view
      vnode.children.push(MoneyDisplay.component());
    }
  });

  // Add mobile money display to navigation using DOM insertion
  extend(HeaderPrimary.prototype, 'oncreate', function () {
    // Only for mobile users and logged-in users
    if (app.session.user && MobileDetector.isMobile()) {
      this.insertMobileMoneyDisplay();
    }
  });

  // Add method to HeaderPrimary for inserting mobile money display
  HeaderPrimary.prototype.insertMobileMoneyDisplay = function() {
    // Wait for DOM to be ready
    setTimeout(() => {
      const navigationEl = document.querySelector('#app-navigation .Navigation.ButtonGroup.App-backControl');
      if (navigationEl && !navigationEl.querySelector('.Navigation-mobileMoneyDisplay')) {
        // Create the mobile money display element
        const mobileDisplay = document.createElement('div');
        mobileDisplay.className = 'Navigation-mobileMoneyDisplay';
        
        const userMoney = app.session.user?.attribute('money') || 0;
        
        mobileDisplay.innerHTML = `
          <div class="Navigation-moneySection" title="余额: ${userMoney} - 点击提款">
            <div class="Navigation-moneyText">
              <i class="fab fa-bitcoin" style="color: #f7931a; margin-right: 4px;"></i>
              <span class="Navigation-moneyAmount">${userMoney}</span>
            </div>
            <div class="Navigation-withdrawalButton">
              <i class="fas fa-money-bill-transfer"></i>
              <span>提款</span>
            </div>
          </div>
        `;
        
        // Add click handler
        mobileDisplay.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Mobile money display clicked!'); // 调试日志
          
          // 尝试多种导航方式
          try {
            // 方式1: 直接设置URL
            window.location.href = '/withdrawal';
            
            // 方式2: 使用 app.route (备用)
            // if (app.route && typeof app.route === 'function') {
            //   app.route('withdrawal');
            // }
          } catch (error) {
            console.error('Navigation error:', error);
            // 最后的备用方案
            window.location.href = '/withdrawal';
          }
        });
        
        navigationEl.appendChild(mobileDisplay);
      }
    }, 200);
  };
});