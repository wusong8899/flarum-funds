import Model from 'flarum/common/Model';

export default class DepositPlatform extends Model {
  name = Model.attribute<string>('name');
  symbol = Model.attribute<string>('symbol');
  network = Model.attribute<string>('network');
  networkTypeId = Model.attribute('networkTypeId');
  displayName = Model.attribute<string>('displayName');
  minAmount = Model.attribute('minAmount');
  maxAmount = Model.attribute('maxAmount');
  fee = Model.attribute('fee');
  address = Model.attribute('address');
  qrCodeImageUrl = Model.attribute<string>('qrCodeImageUrl');
  iconUrl = Model.attribute<string>('iconUrl');
  iconClass = Model.attribute<string>('iconClass');
  warningText = Model.attribute<string>('warningText');
  networkConfig = Model.attribute('networkConfig');
  isActive = Model.attribute('isActive');
  createdAt = Model.attribute('createdAt', Model.transformDate);
  updatedAt = Model.attribute('updatedAt', Model.transformDate);
}