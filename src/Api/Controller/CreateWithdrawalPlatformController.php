<?php

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\WithdrawalPlatformSerializer;
use wusong8899\Withdrawal\Model\WithdrawalPlatform;

class CreateWithdrawalPlatformController extends AbstractCreateController
{
    public $serializer = WithdrawalPlatformSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);

        if (!$actor->isAdmin()) {
            throw new PermissionDeniedException();
        }

        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);

        $platform = new WithdrawalPlatform();
        $platform->name = Arr::get($attributes, 'name');
        $platform->save();

        return $platform;
    }
}