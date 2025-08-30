import Model from 'flarum/common/Model';
import User from 'flarum/common/models/User';
import DepositPlatform from './DepositPlatform';

export default class DepositAddress extends Model {
  address = Model.attribute('address');
  addressTag = Model.attribute('addressTag');
  fullAddress = Model.attribute('fullAddress');
  isActive = Model.attribute('isActive');
  lastUsedAt = Model.attribute('lastUsedAt', Model.transformDate);
  createdAt = Model.attribute('createdAt', Model.transformDate);
  updatedAt = Model.attribute('updatedAt', Model.transformDate);

  user = Model.hasOne<User>('user');
  platform = Model.hasOne<DepositPlatform>('platform');
}