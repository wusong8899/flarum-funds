<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\DepositAddressSerializer;
use wusong8899\Withdrawal\Model\DepositAddress;
use wusong8899\Withdrawal\Model\DepositPlatform;

class GetDepositAddressController extends AbstractShowController
{
    public $serializer = DepositAddressSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document): DepositAddress
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertRegistered();

        $platformId = Arr::get($request->getQueryParams(), 'platform_id');
        
        if (!$platformId) {
            throw ValidationException::withMessages([
                'platform_id' => ['Platform ID is required']
            ]);
        }

        $platform = DepositPlatform::where('id', $platformId)
            ->where('is_active', true)
            ->firstOrFail();

        // Try to find existing address for this user/platform
        $depositAddress = DepositAddress::where('user_id', $actor->id)
            ->where('platform_id', $platform->id)
            ->where('is_active', true)
            ->first();

        if (!$depositAddress) {
            // Generate new address for user
            $address = $platform->generateDepositAddress($actor->id);
            
            $depositAddress = DepositAddress::create([
                'user_id' => $actor->id,
                'platform_id' => $platform->id,
                'address' => $address,
                'is_active' => true
            ]);
        }

        // Update last used timestamp
        $depositAddress->markAsUsed();

        return $depositAddress;
    }
}