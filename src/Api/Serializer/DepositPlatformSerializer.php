<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use wusong8899\Withdrawal\Model\DepositPlatform;

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
            'displayName' => $platform->display_name,
            'minAmount' => $platform->min_amount,
            'maxAmount' => $platform->max_amount,
            'address' => $platform->address,
            'addressTemplate' => $platform->address_template,
            'iconUrl' => $platform->icon_url,
            'iconClass' => $platform->icon_class,
            'qrCodeTemplate' => $platform->qr_code_template,
            'warningText' => $platform->warning_text,
            'networkConfig' => $platform->network_config,
            'isActive' => $platform->is_active,
            'createdAt' => $platform->created_at,
            'updatedAt' => $platform->updated_at,
        ];
    }
}