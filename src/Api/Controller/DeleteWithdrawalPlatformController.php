<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Controller;

use Flarum\Api\Controller\AbstractDeleteController;
use Flarum\Http\RequestUtil;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use wusong8899\Funds\Model\WithdrawalPlatform;

class DeleteWithdrawalPlatformController extends AbstractDeleteController
{
    /**
     * @param ServerRequestInterface $request
     * @return void
     * @throws PermissionDeniedException
     */
    protected function delete(ServerRequestInterface $request): void
    {
        $actor = RequestUtil::getActor($request);

        if (!$actor->isAdmin()) {
            throw new PermissionDeniedException();
        }

        $id = (int) Arr::get($request->getQueryParams(), 'id', 0);
        $platform = WithdrawalPlatform::findOrFail($id);

        $platform->delete();
    }
}
