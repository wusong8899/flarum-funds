<?php

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractDeleteController;
use Flarum\Http\RequestUtil;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use wusong8899\Withdrawal\Model\WithdrawalRequest;

class DeleteWithdrawalRequestController extends AbstractDeleteController
{
    protected function delete(ServerRequestInterface $request)
    {
        $actor = RequestUtil::getActor($request);
        $requestId = Arr::get($request->getQueryParams(), 'id');

        if (!$actor->isAdmin()) {
            throw new PermissionDeniedException();
        }

        $withdrawalRequest = WithdrawalRequest::findOrFail($requestId);
        
        // Only allow deletion of pending requests or by admin
        if (!$actor->isAdmin() && !$withdrawalRequest->isPending()) {
            throw new PermissionDeniedException();
        }

        $withdrawalRequest->delete();
    }
}