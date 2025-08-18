<?php

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\WithdrawalPlatformSerializer;
use wusong8899\Withdrawal\Model\WithdrawalPlatform;

class UpdateWithdrawalPlatformController extends AbstractShowController
{
    public $serializer = WithdrawalPlatformSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $platformId = Arr::get($request->getQueryParams(), 'id');

        if (!$actor->isAdmin()) {
            throw new PermissionDeniedException();
        }

        $platform = WithdrawalPlatform::findOrFail($platformId);

        $data = Arr::get($request->getParsedBody(), 'data', []);
        $attributes = Arr::get($data, 'attributes', []);

        // Update allowed fields
        if (isset($attributes['name'])) {
            $platform->name = $attributes['name'];
        }

        if (isset($attributes['symbol'])) {
            $platform->symbol = $attributes['symbol'];
        }

        if (isset($attributes['minAmount'])) {
            $platform->min_amount = $attributes['minAmount'];
        }

        if (isset($attributes['maxAmount'])) {
            $platform->max_amount = $attributes['maxAmount'];
        }

        if (isset($attributes['fee'])) {
            $platform->fee = $attributes['fee'];
        }

        if (isset($attributes['iconUrl'])) {
            $platform->icon_url = $attributes['iconUrl'];
        }

        if (isset($attributes['iconClass'])) {
            $platform->icon_class = $attributes['iconClass'];
        }

        if (isset($attributes['isActive'])) {
            $platform->is_active = $attributes['isActive'];
        }

        $platform->save();

        return $platform;
    }
}