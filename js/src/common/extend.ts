import Extend from 'flarum/common/extenders';
import WithdrawalPlatform from './models/WithdrawalPlatform';
import WithdrawalRequest from './models/WithdrawalRequest';

export default [
  new Extend.Store()
    .add('withdrawal-platforms', WithdrawalPlatform)
    .add('withdrawal-requests', WithdrawalRequest),
];