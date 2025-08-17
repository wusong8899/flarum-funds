import Model from 'flarum/common/Model';

export default class WithdrawalRequest extends Model {
  amount = Model.attribute('amount');
  accountDetails = Model.attribute('account_details');
  status = Model.attribute('status');
  createdAt = Model.attribute('created_at', Model.transformDate);
  
  user = Model.hasOne('user');
  platform = Model.hasOne('withdrawal-platforms');
}