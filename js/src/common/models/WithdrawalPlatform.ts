import Model from 'flarum/common/Model';

export default class WithdrawalPlatform extends Model {
  name = Model.attribute('name');
  symbol = Model.attribute('symbol');
  minAmount = Model.attribute('minAmount');
  maxAmount = Model.attribute('maxAmount');
  fee = Model.attribute('fee');
  icon = Model.attribute('icon');
  isActive = Model.attribute('isActive');
  createdAt = Model.attribute('createdAt', Model.transformDate);
  updatedAt = Model.attribute('updatedAt', Model.transformDate);
}