import { extend } from 'flarum/common/extend';
import Store from 'flarum/common/Store';
import WithdrawalPlatform from './models/WithdrawalPlatform';
import WithdrawalRequest from './models/WithdrawalRequest';

export default function () {
  extend(Store.prototype, 'models', function (models: any) {
    models['withdrawal-platforms'] = WithdrawalPlatform;
    models['withdrawal-requests'] = WithdrawalRequest;
  });
}