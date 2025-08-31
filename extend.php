<?php

use Flarum\Extend;
use wusong8899\Withdrawal\Api\Controller;
use wusong8899\Withdrawal\Model;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/less/forum.less')
        ->route('/funds', 'funds.index')
        ->route('/funds', 'funds.index')
        ->route('/deposit', 'deposit.index'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js')
        ->css(__DIR__ . '/less/admin.less'),

    new Extend\Locales(__DIR__ . '/locale'),

    (new Extend\Routes('api'))
        ->get('/funds-platforms', 'funds.platforms.index', Controller\ListWithdrawalPlatformsController::class)
        ->get('/funds-platforms/{id}', 'funds.platforms.show', Controller\ShowWithdrawalPlatformController::class)
        ->post('/funds-platforms', 'funds.platforms.create', Controller\CreateWithdrawalPlatformController::class)
        ->patch('/funds-platforms/{id}', 'funds.platforms.update', Controller\UpdateWithdrawalPlatformController::class)
        ->delete('/funds-platforms/{id}', 'funds.platforms.delete', Controller\DeleteWithdrawalPlatformController::class)
        ->get('/funds-requests', 'funds.requests.index', Controller\ListWithdrawalRequestsController::class)
        ->post('/funds-requests', 'funds.requests.create', Controller\CreateWithdrawalRequestController::class)
        ->patch('/funds-requests/{id}', 'funds.requests.update', Controller\UpdateWithdrawalRequestController::class)
        ->delete('/funds-requests/{id}', 'funds.requests.delete', Controller\DeleteWithdrawalRequestController::class)
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
        // Currency icons routes
        ->get('/currency-icons', 'currency-icons.index', Controller\CurrencyIcon\ListCurrencyIconsController::class)
        ->get('/currency-icons/{id}', 'currency-icons.show', Controller\CurrencyIcon\ShowCurrencyIconController::class)
        ->post('/currency-icons', 'currency-icons.create', Controller\CurrencyIcon\CreateCurrencyIconController::class)
        ->patch('/currency-icons/{id}', 'currency-icons.update', Controller\CurrencyIcon\UpdateCurrencyIconController::class)
        ->delete('/currency-icons/{id}', 'currency-icons.delete', Controller\CurrencyIcon\DeleteCurrencyIconController::class),

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
        ->hasMany('withdrawalPlatforms', \wusong8899\Withdrawal\Api\Serializer\WithdrawalPlatformSerializer::class)
        ->hasMany('withdrawalRequests', \wusong8899\Withdrawal\Api\Serializer\WithdrawalRequestSerializer::class)
        ->hasMany('depositPlatforms', \wusong8899\Withdrawal\Api\Serializer\DepositPlatformSerializer::class)
        ->hasMany('depositRecords', \wusong8899\Withdrawal\Api\Serializer\DepositRecordSerializer::class)
        ->hasMany('networkTypes', \wusong8899\Withdrawal\Api\Serializer\NetworkTypeSerializer::class)
        ->hasMany('currencyIcons', \wusong8899\Withdrawal\Api\Serializer\CurrencyIconSerializer::class),

    (new Extend\ApiSerializer(\Flarum\Api\Serializer\UserSerializer::class))
        ->hasMany('withdrawalRequests', \wusong8899\Withdrawal\Api\Serializer\WithdrawalRequestSerializer::class)
        ->hasMany('depositRecords', \wusong8899\Withdrawal\Api\Serializer\DepositRecordSerializer::class),

    (new Extend\Settings())
        ->serializeToForum('wusong8899-funds.moneyIconUrl', 'wusong8899-funds.moneyIconUrl', null, 'https://i.mji.rip/2025/08/28/cd18932c68e9bbee9502b1fb6317cba9.png'),
];
