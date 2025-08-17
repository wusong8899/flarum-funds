<?php

use Flarum\Extend;
use wusong8899\Withdrawal\Api\Controller;
use wusong8899\Withdrawal\Api\Serializer;
use wusong8899\Withdrawal\Model;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
        ->route('/withdrawal', 'withdrawal.index'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),

    new Extend\Locales(__DIR__ . '/locale'),

    (new Extend\Routes('api'))
        ->get('/withdrawal-platforms', 'withdrawal.platforms.index', Controller\ListWithdrawalPlatformsController::class)
        ->post('/withdrawal-platforms', 'withdrawal.platforms.create', Controller\CreateWithdrawalPlatformController::class)
        ->delete('/withdrawal-platforms/{id}', 'withdrawal.platforms.delete', Controller\DeleteWithdrawalPlatformController::class)
        ->get('/withdrawal-requests', 'withdrawal.requests.index', Controller\ListWithdrawalRequestsController::class)
        ->post('/withdrawal-requests', 'withdrawal.requests.create', Controller\CreateWithdrawalRequestController::class)
        ->patch('/withdrawal-requests/{id}', 'withdrawal.requests.update', Controller\UpdateWithdrawalRequestController::class),

    (new Extend\Model(Flarum\User\User::class))
        ->hasMany('withdrawalRequests', Model\WithdrawalRequest::class),

    (new Extend\Settings())
        ->default('withdrawal.min_amount', 0)
        ->default('withdrawal.max_amount', 10000)
        ->default('withdrawal.fee', 0)
        ->serializeToForum('withdrawal.minAmount', 'withdrawal.min_amount', 'floatval')
        ->serializeToForum('withdrawal.maxAmount', 'withdrawal.max_amount', 'floatval')
        ->serializeToForum('withdrawal.fee', 'withdrawal.fee', 'floatval'),

    (new Extend\ApiSerializer(\Flarum\Api\Serializer\UserSerializer::class))
        ->attributes(Serializer\UserWithdrawalSerializer::class),
];