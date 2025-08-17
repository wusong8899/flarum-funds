<?php

namespace wusong8899\Withdrawal\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Api\Serializer\BasicUserSerializer;

class WithdrawalPlatformSerializer extends AbstractSerializer
{
    protected $type = 'withdrawal-platforms';

    protected function getDefaultAttributes($platform)
    {
        return [
            'id' => $platform->id,
            'name' => $platform->name,
            'createdAt' => $this->formatDate($platform->created_at),
            'updatedAt' => $this->formatDate($platform->updated_at),
        ];
    }
}