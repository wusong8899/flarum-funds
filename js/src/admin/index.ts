import app from 'flarum/admin/app';
import WithdrawalManagementPage from './components/WithdrawalManagementPage';

app.initializers.add('wusong8899-withdrawal', () => {
  app.extensionData
    .for('wusong8899-withdrawal')
    .registerPage(WithdrawalManagementPage);
});

export { default as extend } from '../common/extend';