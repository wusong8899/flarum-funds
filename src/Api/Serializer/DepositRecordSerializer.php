<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Api\Serializer\UserSerializer;
use wusong8899\Funds\Api\Serializer\DepositPlatformSerializer;
use wusong8899\Funds\Model\DepositRecord;

class DepositRecordSerializer extends AbstractSerializer
{
    protected $type = 'deposit-records';

    /**
     * @param DepositRecord $record
     */
    protected function getDefaultAttributes($record): array
    {
        return [
            'id' => (int) $record->id,
            'userId' => (int) $record->user_id,
            'platformId' => (int) $record->platform_id,
            'amount' => (float) $record->amount,
            'userMessage' => $record->user_message,
            'status' => $record->status,
            'statusText' => $record->getStatusText(),
            'processedAt' => $record->processed_at,
            'processedBy' => $record->processed_by ? (int) $record->processed_by : null,
            'adminNotes' => $record->admin_notes,
            'createdAt' => $record->created_at,
            'updatedAt' => $record->updated_at,
            'formattedCreatedAt' => $record->getFormattedCreatedAt(),
            'formattedProcessedAt' => $record->getFormattedProcessedAt(),
            'isPending' => $record->isPending(),
            'isApproved' => $record->isApproved(),
            'isRejected' => $record->isRejected(),
        ];
    }

    /**
     * 包含用户关系
     */
    protected function user($record)
    {
        return $this->hasOne($record, UserSerializer::class);
    }

    /**
     * 包含处理人关系
     */
    protected function processedByUser($record)
    {
        if ($record->processed_by) {
            return $this->hasOne($record->processedByUser, UserSerializer::class);
        }
        return null;
    }

    /**
     * 包含存款平台关系
     */
    protected function platform($record)
    {
        return $this->hasOne($record, DepositPlatformSerializer::class);
    }
}
