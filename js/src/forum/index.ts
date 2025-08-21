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

  // Add money display to header primary
  extend(HeaderPrimary.prototype, 'view', function (vnode) {
    // Only add on tags page for logged-in users
    const configManager = ConfigManager.getInstance();
    if (app.session.user && configManager.isTagsPage()) {
      // Add money display to the header primary view
      vnode.children.push(MoneyDisplay.component());
    }
  });
});