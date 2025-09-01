<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Funds\Api\Serializer\DepositPlatformSerializer;
use wusong8899\Funds\Model\DepositPlatform;

class ListDepositPlatformsController extends AbstractListController
{
    public $serializer = DepositPlatformSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document): iterable
    {
        $actor = RequestUtil::getActor($request);

        // Regular users only see active platforms
        if (!$actor->isAdmin()) {
            return DepositPlatform::where('is_active', true)
                ->orderBy('name')
                ->orderBy('network')
                ->get();
        }

        // Admins see all platforms
        return DepositPlatform::orderBy('name')
            ->orderBy('network')
            ->get();
    }
}
