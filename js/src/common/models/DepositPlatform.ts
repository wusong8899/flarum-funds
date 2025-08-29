import Model from 'flarum/common/Model';

export default class DepositPlatform extends Model {
  name = Model.attribute('name');
  symbol = Model.attribute('symbol');
  network = Model.attribute('network');
  displayName = Model.attribute('displayName');
  minAmount = Model.attribute('minAmount');
  maxAmount = Model.attribute('maxAmount');
  address = Model.attribute('address');
  addressTemplate = Model.attribute('addressTemplate');
  iconUrl = Model.attribute('iconUrl');
  iconClass = Model.attribute('iconClass');
  qrCodeTemplate = Model.attribute('qrCodeTemplate');
  warningText = Model.attribute('warningText');
  networkConfig = Model.attribute('networkConfig');
  isActive = Model.attribute('isActive');
  createdAt = Model.attribute('createdAt', Model.transformDate);
  updatedAt = Model.attribute('updatedAt', Model.transformDate);
}