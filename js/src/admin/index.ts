import app from 'flarum/admin/app';
import WithdrawalManagementPage from './components/WithdrawalManagementPage';
import WithdrawalPlatform from '../common/models/WithdrawalPlatform';
import WithdrawalRequest from '../common/models/WithdrawalRequest';

app.initializers.add('wusong8899-withdrawal', () => {
  // Register models in store
  app.store.models['withdrawal-platforms'] = WithdrawalPlatform;
  app.store.models['withdrawal-requests'] = WithdrawalRequest;

  app.extensionData
    .for('wusong8899-withdrawal')
    .registerSetting({
      setting: 'wusong8899-withdrawal.moneyIconUrl',
      type: 'url',
      label: app.translator.trans('withdrawal.admin.settings.money_icon_url'),
      help: app.translator.trans('withdrawal.admin.settings.money_icon_url_help'),
      placeholder: 'https://i.mji.rip/2025/08/28/cd18932c68e9bbee9502b1fb6317cba9.png'
    })
    .registerPage(WithdrawalManagementPage);
});