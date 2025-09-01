<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Api\Serializer\UserSerializer;
use wusong8899\Withdrawal\Model\SimpleDepositRecord;

class SimpleDepositRecordSerializer extends AbstractSerializer
{
    protected $type = 'simple-deposit-records';

    /**
     * @param SimpleDepositRecord $record
     */
    protected function getDefaultAttributes($record): array
    {
        return [
            'id' => (int) $record->id,
            'userId' => (int) $record->user_id,
            'depositAddress' => $record->deposit_address,
            'qrCodeUrl' => $record->qr_code_url,
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
}
