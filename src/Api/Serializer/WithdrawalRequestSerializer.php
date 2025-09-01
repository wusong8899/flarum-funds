<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Api\Serializer\BasicUserSerializer;
use Tobscure\JsonApi\Relationship;
use wusong8899\Funds\Model\WithdrawalRequest;

class WithdrawalRequestSerializer extends AbstractSerializer
{
    protected $type = 'withdraw-requests';

    /**
     * @param WithdrawalRequest $request
     * @return array<string, mixed>
     */
    protected function getDefaultAttributes($request): array
    {
        return [
            'id' => $request->id,
            'amount' => (float) $request->amount,
            'accountDetails' => $request->account_details,
            'message' => $request->message,
            'status' => $request->status,
            'platformId' => $request->platform_id,
            'userId' => $request->user_id,
            'createdAt' => $this->formatDate($request->created_at),
            'updatedAt' => $this->formatDate($request->updated_at),
        ];
    }

    /**
     * @param WithdrawalRequest $request
     * @return Relationship
     */
    protected function user($request): Relationship
    {
        return $this->hasOne($request, BasicUserSerializer::class);
    }

    /**
     * @param WithdrawalRequest $request
     * @return Relationship
     */
    protected function platform($request): Relationship
    {
        return $this->hasOne($request, WithdrawalPlatformSerializer::class);
    }
}
