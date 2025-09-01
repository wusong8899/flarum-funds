<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Controller;

use Flarum\Api\Controller\AbstractDeleteController;
use Flarum\Http\RequestUtil;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use wusong8899\Funds\Model\WithdrawalRequest;

class DeleteWithdrawalRequestController extends AbstractDeleteController
{
    /**
     * @param ServerRequestInterface $request
     * @return void
     * @throws PermissionDeniedException
     */
    protected function delete(ServerRequestInterface $request): void
    {
        $actor = RequestUtil::getActor($request);
        $requestId = (int) Arr::get($request->getQueryParams(), 'id', 0);

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
