<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Funds\Api\Serializer\WithdrawalPlatformSerializer;
use wusong8899\Funds\Model\WithdrawalPlatform;

class UpdateWithdrawalPlatformController extends AbstractShowController
{
    public $serializer = WithdrawalPlatformSerializer::class;

    /**
     * @param ServerRequestInterface $request
     * @param Document $document
     * @return WithdrawalPlatform
     * @throws PermissionDeniedException
     */
    protected function data(ServerRequestInterface $request, Document $document): WithdrawalPlatform
    {
        $actor = RequestUtil::getActor($request);
        $platformId = (int) Arr::get($request->getQueryParams(), 'id', 0);

        if (!$actor->isAdmin()) {
            throw new PermissionDeniedException();
        }

        $platform = WithdrawalPlatform::findOrFail($platformId);

        $data = Arr::get($request->getParsedBody(), 'data', []);
        $attributes = Arr::get($data, 'attributes', []);

        // Update allowed fields
        if (isset($attributes['name'])) {
            $platform->name = (string) $attributes['name'];
        }

        if (isset($attributes['symbol'])) {
            $platform->symbol = (string) $attributes['symbol'];
        }

        if (isset($attributes['minAmount'])) {
            $platform->min_amount = (float) $attributes['minAmount'];
        }

        if (isset($attributes['maxAmount'])) {
            $platform->max_amount = (float) $attributes['maxAmount'];
        }

        if (isset($attributes['fee'])) {
            $platform->fee = (float) $attributes['fee'];
        }

        if (isset($attributes['iconUrl'])) {
            $platform->icon_url = $attributes['iconUrl'] ? (string) $attributes['iconUrl'] : null;
        }

        if (isset($attributes['iconClass'])) {
            $platform->icon_class = $attributes['iconClass'] ? (string) $attributes['iconClass'] : null;
        }

        if (isset($attributes['isActive'])) {
            $platform->is_active = (bool) $attributes['isActive'];
        }

        $platform->save();

        return $platform;
    }
}
