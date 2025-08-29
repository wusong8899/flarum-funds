<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Flarum\Foundation\ValidationException;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\DepositPlatformSerializer;
use wusong8899\Withdrawal\Model\DepositPlatform;

class UpdateDepositPlatformController extends AbstractShowController
{
    public $serializer = DepositPlatformSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document): DepositPlatform
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertAdmin();

        $id = Arr::get($request->getQueryParams(), 'id');
        $platform = DepositPlatform::findOrFail($id);

        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);

        $this->validateData($attributes, $platform);

        $platform->update([
            'name' => $attributes['name'] ?? $platform->name,
            'symbol' => $attributes['symbol'] ?? $platform->symbol,
            'network' => $attributes['network'] ?? $platform->network,
            'network_type_id' => $attributes['networkTypeId'] ?? $platform->network_type_id,
            'min_amount' => $attributes['minAmount'] ?? $platform->min_amount,
            'max_amount' => $attributes['maxAmount'] ?? $platform->max_amount,
            'address' => $attributes['address'] ?? $platform->address,
            'icon_url' => $attributes['iconUrl'] ?? $platform->icon_url,
            'icon_class' => $attributes['iconClass'] ?? $platform->icon_class,
            'warning_text' => $attributes['warningText'] ?? $platform->warning_text,
            'network_config' => $attributes['networkConfig'] ?? $platform->network_config,
            'is_active' => $attributes['isActive'] ?? $platform->is_active,
        ]);

        return $platform;
    }

    private function validateData(array $attributes, DepositPlatform $platform): void
    {
        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'symbol' => 'sometimes|required|string|max:20',
            'network' => 'sometimes|required|string|max:50',
            'minAmount' => 'sometimes|nullable|numeric|min:0',
            'maxAmount' => 'sometimes|nullable|numeric|min:0',
            'address' => 'sometimes|nullable|string|max:500',
            'addressTemplate' => 'sometimes|nullable|string|max:500',
            'iconUrl' => 'sometimes|nullable|url|max:500',
            'iconClass' => 'sometimes|nullable|string|max:100',
            'qrCodeTemplate' => 'sometimes|nullable|string|max:1000',
            'warningText' => 'sometimes|nullable|string|max:1000',
            'isActive' => 'sometimes|boolean',
        ];

        $validator = app('validator')->make($attributes, $rules);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        // Check if platform with same symbol+network already exists (excluding current)
        if (isset($attributes['symbol']) || isset($attributes['network'])) {
            $symbol = $attributes['symbol'] ?? $platform->symbol;
            $network = $attributes['network'] ?? $platform->network;

            $exists = DepositPlatform::where('symbol', $symbol)
                ->where('network', $network)
                ->where('id', '!=', $platform->id)
                ->exists();

            if ($exists) {
                throw ValidationException::withMessages([
                    'symbol' => ['A platform with this currency and network combination already exists.']
                ]);
            }
        }

        // Validate that at least one address method is provided
        $address = $attributes['address'] ?? $platform->address;
        $addressTemplate = $attributes['addressTemplate'] ?? $platform->address_template;

        if (empty($address) && empty($addressTemplate)) {
            throw ValidationException::withMessages([
                'address' => ['Either a static address or address template must be provided.']
            ]);
        }
    }
}