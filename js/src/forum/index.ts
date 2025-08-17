import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import LinkButton from 'flarum/common/components/LinkButton';
import ItemList from 'flarum/common/utils/ItemList';
import HeaderSecondary from 'flarum/forum/components/HeaderSecondary';
import WithdrawalPage from './components/WithdrawalPage';
import WithdrawalPlatform from '../common/models/WithdrawalPlatform';
import WithdrawalRequest from '../common/models/WithdrawalRequest';

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
});

export { default as extend } from '../common/extend';