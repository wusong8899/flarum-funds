import app from 'flarum/admin/app';
import WithdrawalManagementPage from './components/WithdrawalManagementPage';
import commonExtend from '../common/extend';

app.initializers.add('wusong8899-withdrawal', () => {
  // Apply common extensions
  commonExtend();
  
  app.extensionData
    .for('wusong8899-withdrawal')
    .registerPage(WithdrawalManagementPage);
});