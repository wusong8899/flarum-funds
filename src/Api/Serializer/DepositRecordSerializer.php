<?php

namespace Wusong8899\Withdrawal\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Api\Serializer\UserSerializer;
use Wusong8899\Withdrawal\Models\DepositRecord;

class DepositRecordSerializer extends AbstractSerializer
{
    protected $type = 'deposit-records';

    /**
     * Get the default set of serialized attributes for a model.
     *
     * @param DepositRecord $record
     * @return array
     */
    protected function getDefaultAttributes($record)
    {
        return [
            'id' => (int) $record->id,
            'userId' => (int) $record->user_id,
            'platformId' => (int) $record->platform_id,
            'platformAccount' => $record->platform_account,
            'realName' => $record->real_name,
            'amount' => (float) $record->amount,
            'depositTime' => $this->formatDate($record->deposit_time),
            'screenshotUrl' => $record->screenshot_url,
            'userMessage' => $record->user_message,
            'status' => $record->status,
            'processedAt' => $this->formatDate($record->processed_at),
            'processedBy' => $record->processed_by ? (int) $record->processed_by : null,
            'adminNotes' => $record->admin_notes,
            'creditedAmount' => $record->credited_amount ? (float) $record->credited_amount : null,
            'createdAt' => $this->formatDate($record->created_at),
            'updatedAt' => $this->formatDate($record->updated_at),
        ];
    }

    /**
     * @param DepositRecord $record
     * @return \Tobscure\JsonApi\Relationship
     */
    protected function user($record)
    {
        return $this->hasOne($record, UserSerializer::class);
    }

    /**
     * @param DepositRecord $record
     * @return \Tobscure\JsonApi\Relationship
     */
    protected function platform($record)
    {
        return $this->hasOne($record, DepositPlatformSerializer::class);
    }

    /**
     * @param DepositRecord $record
     * @return \Tobscure\JsonApi\Relationship|null
     */
    protected function processedByUser($record)
    {
        if ($record->processedBy) {
            return $this->hasOne($record->processedBy, UserSerializer::class);
        }
        return null;
    }
}
