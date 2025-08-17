<?php

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Flarum\User\Exception\PermissionDeniedException;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\WithdrawalPlatformSerializer;
use wusong8899\Withdrawal\Model\WithdrawalPlatform;

class ListWithdrawalPlatformsController extends AbstractListController
{
    public $serializer = WithdrawalPlatformSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);

        if (!$actor->isGuest()) {
            return WithdrawalPlatform::orderBy('name')->get();
        }

        throw new PermissionDeniedException();
    }
}