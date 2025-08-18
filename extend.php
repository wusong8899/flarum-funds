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
        ->patch('/withdrawal-platforms/{id}', 'withdrawal.platforms.update', Controller\UpdateWithdrawalPlatformController::class)
        ->delete('/withdrawal-platforms/{id}', 'withdrawal.platforms.delete', Controller\DeleteWithdrawalPlatformController::class)
        ->get('/withdrawal-requests', 'withdrawal.requests.index', Controller\ListWithdrawalRequestsController::class)
        ->post('/withdrawal-requests', 'withdrawal.requests.create', Controller\CreateWithdrawalRequestController::class)
        ->patch('/withdrawal-requests/{id}', 'withdrawal.requests.update', Controller\UpdateWithdrawalRequestController::class)
        ->delete('/withdrawal-requests/{id}', 'withdrawal.requests.delete', Controller\DeleteWithdrawalRequestController::class),

    (new Extend\Model(Flarum\User\User::class))
        ->hasMany('withdrawalRequests', Model\WithdrawalRequest::class),


    (new Extend\ApiSerializer(\Flarum\Api\Serializer\UserSerializer::class))
        ->attributes(Serializer\UserWithdrawalSerializer::class),

    // Register API serializers for our models
    (new Extend\ApiController(\Flarum\Api\Controller\ListUsersController::class))
        ->addInclude(['withdrawalRequests', 'withdrawalRequests.platform']),

    (new Extend\ApiController(\Flarum\Api\Controller\ShowUserController::class))
        ->addInclude(['withdrawalRequests', 'withdrawalRequests.platform']),
];