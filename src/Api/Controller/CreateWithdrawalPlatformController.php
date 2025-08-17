<?php

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
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
        $name = Arr::get($attributes, 'name');

        // Validate name field
        if (empty($name) || !is_string($name)) {
            throw new \InvalidArgumentException('Platform name is required and must be a string.');
        }

        $platform = new WithdrawalPlatform();
        $platform->name = trim($name);
        $platform->created_at = Carbon::now();
        $platform->save();

        return $platform;
    }
}