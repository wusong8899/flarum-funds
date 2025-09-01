<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Controller;

use Flarum\Api\Controller\AbstractDeleteController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use wusong8899\Funds\Model\DepositPlatform;

class DeleteDepositPlatformController extends AbstractDeleteController
{
    protected function delete(ServerRequestInterface $request): void
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertAdmin();

        $id = Arr::get($request->getQueryParams(), 'id');
        $platform = DepositPlatform::findOrFail($id);

        $platform->delete();
    }
}
