import app from 'flarum/admin/app';
import WithdrawalManagementPage from './components/WithdrawalManagementPage';

app.initializers.add('wusong8899-flarum-withdrawal', () => {
  app.extensionData
    .for('wusong8899-flarum-withdrawal')
    .registerPage(WithdrawalManagementPage);
});