import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import HeaderPrimary from 'flarum/forum/components/HeaderPrimary';
import Navigation from 'flarum/common/components/Navigation';
import FundsPage from './components/FundsPage';
import WithdrawalPlatform from '../common/models/WithdrawalPlatform';
import WithdrawalRequest from '../common/models/WithdrawalRequest';
import DepositPlatform from '../common/models/DepositPlatform';
import DepositAddress from '../common/models/DepositAddress';
import DepositTransaction from '../common/models/DepositTransaction';
import DepositRecord from '../common/models/DepositRecord';
import MoneyDisplay from './components/MoneyDisplay';
import MobileMoneyDisplay from './components/MobileMoneyDisplay';
import { ConfigManager } from './utils/ConfigManager';
import { MobileDetector } from './utils/MobileDetector';

app.initializers.add('wusong8899-withdrawal', () => {
  // Register models in store
  app.store.models['withdrawal-platforms'] = WithdrawalPlatform;
  app.store.models['withdrawal-requests'] = WithdrawalRequest;
  app.store.models['deposit-platforms'] = DepositPlatform;
  app.store.models['deposit-addresses'] = DepositAddress;
  app.store.models['deposit-transactions'] = DepositTransaction;
  app.store.models['deposit-records'] = DepositRecord;

  // New unified funds page
  app.routes.funds = { path: '/funds', component: FundsPage };
  
  // Legacy routes for backward compatibility - redirect to funds page
  app.routes.withdrawal = { path: '/withdrawal', component: FundsPage };
  app.routes.deposit = { path: '/deposit', component: FundsPage };


  // Add money display to header primary (desktop)
  extend(HeaderPrimary.prototype, 'view', function (vnode) {
    // Only add on tags page for logged-in users and on desktop
    const configManager = ConfigManager.getInstance();
    if (app.session.user && configManager.isTagsPage() && !MobileDetector.isMobile()) {
      // Add money display to the header primary view
      vnode.children.push(MoneyDisplay.component());
    }
  });

  // Add mobile money display to navigation using component extension
  extend(Navigation.prototype, 'view', function (vnode) {
    // Only work on mobile devices (viewport width <= 768px)
    if (window.innerWidth > 768) {
      return;
    }

    // Only work on homepage
    const routeName = app.current.get('routeName');
    if (routeName !== 'tags') {
      return;
    }

    // Only work for logged-in users
    if (!app.session.user) {
      return;
    }

    if (!vnode || !vnode.children || !Array.isArray(vnode.children)) {
      return;
    }

    // Check if we already added the money display component to avoid duplication
    const hasMoneyDisplay = vnode.children.some((child: any) =>
      child && child.attrs && child.attrs.className &&
      child.attrs.className.includes('Navigation-mobileMoneyDisplay')
    );

    if (!hasMoneyDisplay) {
      // Add MobileMoneyDisplay component to navigation
      vnode.children.push(MobileMoneyDisplay.component({
        className: "item-withdrawal Navigation-mobileMoneyDisplay"
      }));
    }
  });
});