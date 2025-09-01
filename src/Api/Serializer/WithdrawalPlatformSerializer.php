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
            // Three-tier icon system
            'currencyIconUrl' => $platform->getCurrencyIconUrl(),
            'currencyIconClass' => $platform->getCurrencyIconClass(),
            'currencyUnicodeSymbol' => $platform->getCurrencyUnicodeSymbol(),
            'networkIconUrl' => $platform->getNetworkIconUrl(),
            'networkIconClass' => $platform->getNetworkIconClass(),
            'platformSpecificIconUrl' => $platform->getPlatformSpecificIconUrl(),
            'platformSpecificIconClass' => $platform->getPlatformSpecificIconClass(),
            // Override fields for admin
            'currencyIconOverrideUrl' => $platform->currency_icon_override_url,
            'currencyIconOverrideClass' => $platform->currency_icon_override_class,
            'networkIconOverrideUrl' => $platform->network_icon_override_url,
            'networkIconOverrideClass' => $platform->network_icon_override_class,
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

    /**
     * Include currency-specific icon
     */
    public function currencyIcon($platform)
    {
        return $platform->getCurrencyIcon();
    }

    /**
     * Include network-specific icon
     */
    public function networkIcon($platform)
    {
        return $platform->getNetworkIcon();
    }
}
