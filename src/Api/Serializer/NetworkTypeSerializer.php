<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use wusong8899\Withdrawal\Model\NetworkType;

class NetworkTypeSerializer extends AbstractSerializer
{
    protected $type = 'network-types';

    protected function getDefaultAttributes($networkType): array
    {
        if (!($networkType instanceof NetworkType)) {
            throw new \InvalidArgumentException('Expected NetworkType instance');
        }

        return [
            'id' => $networkType->id,
            'name' => $networkType->name,
            'code' => $networkType->code,
            'description' => $networkType->description,
            'iconUrl' => $networkType->icon_url,
            'iconClass' => $networkType->icon_class,
            'config' => $networkType->config,
            'isActive' => $networkType->is_active,
            'sortOrder' => $networkType->sort_order,
            'createdAt' => $networkType->created_at?->toISOString(),
            'updatedAt' => $networkType->updated_at?->toISOString()
        ];
    }
}