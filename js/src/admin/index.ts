import app from 'flarum/admin/app';
import UnifiedManagementPage from './components/UnifiedManagementPage';
import WithdrawalPlatform from '../common/models/WithdrawalPlatform';
import WithdrawalRequest from '../common/models/WithdrawalRequest';
import DepositPlatform from '../common/models/DepositPlatform';
import DepositRecord from '../common/models/DepositRecord';

app.initializers.add('wusong8899-withdrawal', () => {
  // Register models in store
  app.store.models['withdrawal-platforms'] = WithdrawalPlatform;
  app.store.models['withdrawal-requests'] = WithdrawalRequest;
  app.store.models['deposit-platforms'] = DepositPlatform;
  app.store.models['deposit-records'] = DepositRecord;

  app.extensionData
    .for('wusong8899-withdrawal')
    .registerPage(UnifiedManagementPage);
});