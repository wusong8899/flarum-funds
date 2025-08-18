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
        
        // Extract and validate required fields
        $name = Arr::get($attributes, 'name');
        $symbol = Arr::get($attributes, 'symbol');
        $minAmount = Arr::get($attributes, 'minAmount');
        $maxAmount = Arr::get($attributes, 'maxAmount');
        $fee = Arr::get($attributes, 'fee', 0);
        $iconUrl = Arr::get($attributes, 'iconUrl');
        $iconClass = Arr::get($attributes, 'iconClass');
        $isActive = Arr::get($attributes, 'isActive', true);

        // Validate required fields
        if (empty($name) || !is_string($name)) {
            throw new \InvalidArgumentException('Platform name is required and must be a string.');
        }
        if (empty($symbol) || !is_string($symbol)) {
            throw new \InvalidArgumentException('Currency symbol is required and must be a string.');
        }
        if (!is_numeric($minAmount) || $minAmount <= 0) {
            throw new \InvalidArgumentException('Minimum amount must be a positive number.');
        }
        if (!is_numeric($maxAmount) || $maxAmount <= 0) {
            throw new \InvalidArgumentException('Maximum amount must be a positive number.');
        }
        if ($maxAmount < $minAmount) {
            throw new \InvalidArgumentException('Maximum amount must be greater than or equal to minimum amount.');
        }

        $platform = new WithdrawalPlatform();
        $platform->name = trim($name);
        $platform->symbol = trim($symbol);
        $platform->min_amount = (float) $minAmount;
        $platform->max_amount = (float) $maxAmount;
        $platform->fee = (float) $fee;
        $platform->icon_url = $iconUrl ? trim($iconUrl) : null;
        $platform->icon_class = $iconClass ? trim($iconClass) : null;
        $platform->is_active = (bool) $isActive;
        $platform->created_at = Carbon::now();
        $platform->save();

        return $platform;
    }
}