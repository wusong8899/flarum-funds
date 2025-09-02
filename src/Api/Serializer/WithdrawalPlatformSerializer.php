<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use wusong8899\Funds\Model\WithdrawalPlatform;

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
            'network' => $platform->network,
            'displayName' => $platform->display_name,
            'minAmount' => (float) $platform->min_amount,
            'maxAmount' => (float) $platform->max_amount,
            'fee' => (float) $platform->fee,
            'isActive' => (bool) $platform->is_active,
            // Platform icon system
            'platformIconUrl' => $platform->getPlatformIconUrl(),
            'platformIconClass' => $platform->getPlatformIconClass(),
            'createdAt' => $this->formatDate($platform->created_at),
            'updatedAt' => $this->formatDate($platform->updated_at),
        ];
    }

    /**
     * Include the best available icon for display
     */
    public function bestIcon($platform)
    {
        return $platform->getBestIcon();
    }
}
