<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Api\Serializer\UserSerializer;
use wusong8899\Withdrawal\Model\DepositAddress;

class DepositAddressSerializer extends AbstractSerializer
{
    protected $type = 'deposit-addresses';

    /**
     * @param DepositAddress $address
     */
    protected function getDefaultAttributes($address): array
    {
        return [
            'id' => $address->id,
            'address' => $address->address,
            'addressTag' => $address->address_tag,
            'fullAddress' => $address->full_address,
            'isActive' => $address->is_active,
            'lastUsedAt' => $address->last_used_at,
            'createdAt' => $address->created_at,
            'updatedAt' => $address->updated_at,
        ];
    }

    protected function user($address)
    {
        return $this->hasOne($address, UserSerializer::class);
    }

    protected function platform($address)
    {
        return $this->hasOne($address, DepositPlatformSerializer::class);
    }
}