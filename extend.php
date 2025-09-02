<?php

use Flarum\Extend;
use wusong8899\Funds\Api\Controller;
use wusong8899\Funds\Api\Serializer;
use wusong8899\Funds\Model;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/less/forum.less')
        ->route('/funds', 'funds.index')
        ->route('/deposit', 'deposit.index'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js')
        ->css(__DIR__ . '/less/admin.less'),

    new Extend\Locales(__DIR__ . '/locale'),

    (new Extend\Routes('api'))
        ->get('/withdrawal-platforms', 'withdrawal.platforms.index', Controller\ListWithdrawalPlatformsController::class)
        ->get('/withdrawal-platforms/{id}', 'withdrawal.platforms.show', Controller\ShowWithdrawalPlatformController::class)
        ->post('/withdrawal-platforms', 'withdrawal.platforms.create', Controller\CreateWithdrawalPlatformController::class)
        ->patch('/withdrawal-platforms/{id}', 'withdrawal.platforms.update', Controller\UpdateWithdrawalPlatformController::class)
        ->delete('/withdrawal-platforms/{id}', 'withdrawal.platforms.delete', Controller\DeleteWithdrawalPlatformController::class)
        ->get('/withdrawal-requests', 'withdrawal.requests.index', Controller\ListWithdrawalRequestsController::class)
        ->post('/withdrawal-requests', 'withdrawal.requests.create', Controller\CreateWithdrawalRequestController::class)
        ->patch('/withdrawal-requests/{id}', 'withdrawal.requests.update', Controller\UpdateWithdrawalRequestController::class)
        ->delete('/withdrawal-requests/{id}', 'withdrawal.requests.delete', Controller\DeleteWithdrawalRequestController::class)
        // Deposit routes
        ->get('/deposit-platforms', 'deposit.platforms.index', Controller\ListDepositPlatformsController::class)
        ->get('/deposit-platforms/{id}', 'deposit.platforms.show', Controller\ShowDepositPlatformController::class)
        ->post('/deposit-platforms', 'deposit.platforms.create', Controller\CreateDepositPlatformController::class)
        ->patch('/deposit-platforms/{id}', 'deposit.platforms.update', Controller\UpdateDepositPlatformController::class)
        ->delete('/deposit-platforms/{id}', 'deposit.platforms.delete', Controller\DeleteDepositPlatformController::class)
        // Network types routes
        ->get('/network-types', 'network-types.index', Controller\ListNetworkTypesController::class)
        ->post('/network-types', 'network-types.create', Controller\CreateNetworkTypeController::class)
        ->patch('/network-types/{id}', 'network-types.update', Controller\UpdateNetworkTypeController::class)
        ->delete('/network-types/{id}', 'network-types.delete', Controller\DeleteNetworkTypeController::class)
        // Deposit records routes
        ->get('/deposit-records', 'deposit.records.index', Controller\ListDepositRecordsController::class)
        ->get('/deposit-records/{id}', 'deposit.records.show', Controller\ShowDepositRecordController::class)
        ->post('/deposit-records', 'deposit.records.create', Controller\CreateDepositRecordController::class)
        ->patch('/deposit-records/{id}', 'deposit.records.update', Controller\UpdateDepositRecordController::class)
        ->delete('/deposit-records/{id}', 'deposit.records.delete', Controller\DeleteDepositRecordController::class)
,

    (new Extend\Model(Flarum\User\User::class))
        ->hasMany('withdrawalRequests', Model\WithdrawalRequest::class)
        ->hasMany('depositRecords', Model\DepositRecord::class),

    // Register API serializers for our models
    (new Extend\ApiController(\Flarum\Api\Controller\ListUsersController::class))
        ->addInclude(['withdrawalRequests', 'withdrawalRequests.platform', 'depositRecords', 'depositRecords.platform']),

    (new Extend\ApiController(\Flarum\Api\Controller\ShowUserController::class))
        ->addInclude(['withdrawalRequests', 'withdrawalRequests.platform', 'depositRecords', 'depositRecords.platform']),

    // Register serializers for our models
    (new Extend\ApiSerializer(\Flarum\Api\Serializer\ForumSerializer::class))
        ->hasMany('withdrawalPlatforms', Serializer\WithdrawalPlatformSerializer::class)
        ->hasMany('withdrawalRequests', Serializer\WithdrawalRequestSerializer::class)
        ->hasMany('depositPlatforms', Serializer\DepositPlatformSerializer::class)
        ->hasMany('depositRecords', Serializer\DepositRecordSerializer::class)
        ->hasMany('networkTypes', Serializer\NetworkTypeSerializer::class)
,

    (new Extend\ApiSerializer(\Flarum\Api\Serializer\UserSerializer::class))
        ->hasMany('withdrawalRequests', Serializer\WithdrawalRequestSerializer::class)
        ->hasMany('depositRecords', Serializer\DepositRecordSerializer::class),

    (new Extend\Settings())
        ->serializeToForum('wusong8899-funds.moneyIconUrl', 'wusong8899-funds.moneyIconUrl', null, 'https://i.mji.rip/2025/08/28/cd18932c68e9bbee9502b1fb6317cba9.png'),
];
