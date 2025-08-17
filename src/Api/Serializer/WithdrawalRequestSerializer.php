<?php

namespace wusong8899\Withdrawal\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Api\Serializer\BasicUserSerializer;
use Tobscure\JsonApi\Relationship;

class WithdrawalRequestSerializer extends AbstractSerializer
{
    protected $type = 'withdrawal-requests';

    protected function getDefaultAttributes($request)
    {
        return [
            'id' => $request->id,
            'amount' => (float) $request->amount,
            'accountDetails' => $request->account_details,
            'status' => $request->status,
            'createdAt' => $this->formatDate($request->created_at),
            'updatedAt' => $this->formatDate($request->updated_at),
        ];
    }

    protected function user($request)
    {
        return $this->hasOne($request, BasicUserSerializer::class);
    }

    protected function platform($request)
    {
        return $this->hasOne($request, WithdrawalPlatformSerializer::class);
    }
}