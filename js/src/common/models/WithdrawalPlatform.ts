import Model from 'flarum/common/Model';

export default class WithdrawalPlatform extends Model {
  name = Model.attribute('name');
  createdAt = Model.attribute('created_at', Model.transformDate);
}