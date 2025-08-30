<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Flarum\Foundation\ValidationException;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\DepositPlatformSerializer;
use wusong8899\Withdrawal\Model\DepositPlatform;

class CreateDepositPlatformController extends AbstractCreateController
{
    public $serializer = DepositPlatformSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document): DepositPlatform
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertAdmin();

        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);

        $this->validateData($attributes);

        return DepositPlatform::create([
            'name' => $attributes['name'],
            'symbol' => $attributes['symbol'],
            'network' => $attributes['network'],
            'network_type_id' => $attributes['networkTypeId'] ?? null,
            'min_amount' => $attributes['minAmount'] ?? 0,
            'max_amount' => $attributes['maxAmount'] ?? null,
            'address' => $attributes['address'] ?? null,
            'qr_code_image_url' => $attributes['qrCodeImageUrl'] ?? null,
            'icon_url' => $attributes['iconUrl'] ?? null,
            'icon_class' => $attributes['iconClass'] ?? null,
            'warning_text' => $attributes['warningText'] ?? null,
            'network_config' => $attributes['networkConfig'] ?? null,
            'is_active' => $attributes['isActive'] ?? true,
        ]);
    }

    private function validateData(array $attributes): void
    {
        $rules = [
            'name' => 'required|string|max:255',
            'symbol' => 'required|string|max:20',
            'network' => 'nullable|string|max:50',
            'networkTypeId' => 'nullable|integer|exists:network_types,id',
            'minAmount' => 'nullable|numeric|min:0',
            'maxAmount' => 'nullable|numeric|min:0',
            'address' => 'nullable|string|max:500',
            'qrCodeImageUrl' => 'nullable|url|max:500',
            'iconUrl' => 'nullable|url|max:500',
            'iconClass' => 'nullable|string|max:100',
            'warningText' => 'nullable|string|max:1000',
            'isActive' => 'boolean',
        ];

        $validator = app('validator')->make($attributes, $rules);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        // Check if platform with same symbol+network already exists (only if network is provided)
        if (!empty($attributes['network'])) {
            $exists = DepositPlatform::where('symbol', $attributes['symbol'])
                ->where('network', $attributes['network'])
                ->exists();

            if ($exists) {
                throw ValidationException::withMessages([
                    'symbol' => ['A platform with this currency and network combination already exists.']
                ]);
            }
        }

        // Validate that address is provided
        if (empty($attributes['address'])) {
            throw ValidationException::withMessages([
                'address' => ['A static address must be provided.']
            ]);
        }
    }
}