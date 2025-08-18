import Model from 'flarum/common/Model';

export default class WithdrawalRequest extends Model {
  amount = Model.attribute('amount');
  accountDetails = Model.attribute('accountDetails');
  status = Model.attribute('status');
  platformId = Model.attribute('platformId');
  userId = Model.attribute('userId');
  createdAt = Model.attribute('createdAt', Model.transformDate);
  updatedAt = Model.attribute('updatedAt', Model.transformDate);
  
  user = Model.hasOne('user');
  platform = Model.hasOne('withdrawal-platforms');
}