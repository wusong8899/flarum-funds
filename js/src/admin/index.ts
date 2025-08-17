import app from 'flarum/admin/app';
import WithdrawalManagementPage from './components/WithdrawalManagementPage';
import WithdrawalPlatform from '../common/models/WithdrawalPlatform';
import WithdrawalRequest from '../common/models/WithdrawalRequest';

app.initializers.add('wusong8899-withdrawal', () => {
  // Register models directly
  app.store.models['withdrawal-platforms'] = WithdrawalPlatform;
  app.store.models['withdrawal-requests'] = WithdrawalRequest;
  
  app.extensionData
    .for('wusong8899-withdrawal')
    .registerPage(WithdrawalManagementPage);
});

export { default as extend } from '../common/extend';