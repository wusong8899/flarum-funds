<?php

use Flarum\Extend;
use wusong8899\Withdrawal\Api\Controller;
use wusong8899\Withdrawal\Model;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
        ->route('/funds', 'funds.index')
        ->route('/withdrawal', 'withdrawal.index')
        ->route('/deposit', 'deposit.index'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),

    new Extend\Locales(__DIR__ . '/locale'),

    (new Extend\Routes('api'))
        ->get('/withdrawal-platforms', 'withdrawal.platforms.index', Controller\ListWithdrawalPlatformsController::class)
        ->post('/withdrawal-platforms', 'withdrawal.platforms.create', Controller\CreateWithdrawalPlatformController::class)
        ->patch('/withdrawal-platforms/{id}', 'withdrawal.platforms.update', Controller\UpdateWithdrawalPlatformController::class)
        ->delete('/withdrawal-platforms/{id}', 'withdrawal.platforms.delete', Controller\DeleteWithdrawalPlatformController::class)
        ->get('/withdrawal-requests', 'withdrawal.requests.index', Controller\ListWithdrawalRequestsController::class)
        ->post('/withdrawal-requests', 'withdrawal.requests.create', Controller\CreateWithdrawalRequestController::class)
        ->patch('/withdrawal-requests/{id}', 'withdrawal.requests.update', Controller\UpdateWithdrawalRequestController::class)
        ->delete('/withdrawal-requests/{id}', 'withdrawal.requests.delete', Controller\DeleteWithdrawalRequestController::class)
        // Deposit routes
        ->get('/deposit-platforms', 'deposit.platforms.index', Controller\ListDepositPlatformsController::class)
        ->post('/deposit-platforms', 'deposit.platforms.create', Controller\CreateDepositPlatformController::class)
        ->patch('/deposit-platforms/{id}', 'deposit.platforms.update', Controller\UpdateDepositPlatformController::class)
        ->delete('/deposit-platforms/{id}', 'deposit.platforms.delete', Controller\DeleteDepositPlatformController::class)
        ->get('/deposit-address', 'deposit.address.get', Controller\GetDepositAddressController::class)
        ->get('/deposit-transactions', 'deposit.transactions.index', Controller\ListDepositTransactionsController::class)
        ->post('/deposit-transactions', 'deposit.transactions.create', Controller\CreateDepositTransactionController::class)
        ->patch('/deposit-transactions/{id}', 'deposit.transactions.update', Controller\UpdateDepositTransactionController::class),

    (new Extend\Model(Flarum\User\User::class))
        ->hasMany('withdrawalRequests', Model\WithdrawalRequest::class)
        ->hasMany('depositAddresses', Model\DepositAddress::class)
        ->hasMany('depositTransactions', Model\DepositTransaction::class),

    // Register API serializers for our models
    (new Extend\ApiController(\Flarum\Api\Controller\ListUsersController::class))
        ->addInclude(['withdrawalRequests', 'withdrawalRequests.platform', 'depositAddresses', 'depositTransactions']),

    (new Extend\ApiController(\Flarum\Api\Controller\ShowUserController::class))
        ->addInclude(['withdrawalRequests', 'withdrawalRequests.platform', 'depositAddresses', 'depositTransactions']),

    (new Extend\Settings())
        ->serializeToForum('wusong8899-withdrawal.moneyIconUrl', 'wusong8899-withdrawal.moneyIconUrl', null, 'https://i.mji.rip/2025/08/28/cd18932c68e9bbee9502b1fb6317cba9.png'),
];