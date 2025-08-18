<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use wusong8899\Withdrawal\Model\WithdrawalPlatform;

class WithdrawalPlatformSerializer extends AbstractSerializer
{
    protected $type = 'withdrawal-platforms';

    /**
     * @param WithdrawalPlatform $platform
     * @return array<string, mixed>
     */
    protected function getDefaultAttributes($platform): array
    {
        return [
            'id' => $platform->id,
            'name' => $platform->name,
            'symbol' => $platform->symbol,
            'minAmount' => (float) $platform->min_amount,
            'maxAmount' => (float) $platform->max_amount,
            'fee' => (float) $platform->fee,
            'iconUrl' => $platform->icon_url,
            'iconClass' => $platform->icon_class,
            'isActive' => (bool) $platform->is_active,
            'createdAt' => $this->formatDate($platform->created_at),
            'updatedAt' => $this->formatDate($platform->updated_at),
        ];
    }
}
