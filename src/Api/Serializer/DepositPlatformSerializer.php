<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use wusong8899\Funds\Model\DepositPlatform;

class DepositPlatformSerializer extends AbstractSerializer
{
    protected $type = 'deposit-platforms';

    /**
     * @param DepositPlatform $platform
     */
    protected function getDefaultAttributes($platform): array
    {
        return [
            'id' => $platform->id,
            'name' => $platform->name,
            'symbol' => $platform->symbol,
            'network' => $platform->network,
            'networkTypeId' => $platform->network_type_id,
            'displayName' => $platform->display_name,
            'minAmount' => (float) $platform->min_amount,
            'maxAmount' => $platform->max_amount !== null ? (float) $platform->max_amount : null,
            'fee' => (float) $platform->fee,
            'address' => $platform->address,
            'qrCodeImageUrl' => $platform->qr_code_image_url,
            'warningText' => $platform->warning_text,
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
            'networkConfig' => $platform->network_config,
            'isActive' => $platform->is_active,
            'createdAt' => $platform->created_at,
            'updatedAt' => $platform->updated_at,
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
