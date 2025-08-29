import Model from 'flarum/common/Model';
import User from 'flarum/common/models/User';
import DepositPlatform from './DepositPlatform';
import DepositAddress from './DepositAddress';

export default class DepositTransaction extends Model {
  amount = Model.attribute('amount');
  fee = Model.attribute('fee');
  creditedAmount = Model.attribute('creditedAmount');
  transactionHash = Model.attribute('transactionHash');
  fromAddress = Model.attribute('fromAddress');
  memo = Model.attribute('memo');
  userMessage = Model.attribute('userMessage');
  status = Model.attribute('status');
  statusColor = Model.attribute('statusColor');
  blockchainData = Model.attribute('blockchainData');
  confirmations = Model.attribute('confirmations');
  requiredConfirmations = Model.attribute('requiredConfirmations');
  hasEnoughConfirmations = Model.attribute('hasEnoughConfirmations');
  canBeCompleted = Model.attribute('canBeCompleted');
  explorerUrl = Model.attribute('explorerUrl');
  detectedAt = Model.attribute('detectedAt', Model.transformDate);
  confirmedAt = Model.attribute('confirmedAt', Model.transformDate);
  completedAt = Model.attribute('completedAt', Model.transformDate);
  adminNotes = Model.attribute('adminNotes');
  createdAt = Model.attribute('createdAt', Model.transformDate);
  updatedAt = Model.attribute('updatedAt', Model.transformDate);

  user = Model.hasOne<User>('user');
  platform = Model.hasOne<DepositPlatform>('platform');
  depositAddress = Model.hasOne<DepositAddress>('depositAddress');
  processedBy = Model.hasOne<User>('processedBy');
}