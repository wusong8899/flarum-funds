<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Api\Serializer\UserSerializer;
use wusong8899\Withdrawal\Model\DepositTransaction;

class DepositTransactionSerializer extends AbstractSerializer
{
    protected $type = 'deposit-transactions';

    /**
     * @param DepositTransaction $transaction
     */
    protected function getDefaultAttributes($transaction): array
    {
        return [
            'id' => $transaction->id,
            'amount' => $transaction->amount,
            'fee' => $transaction->fee,
            'creditedAmount' => $transaction->credited_amount,
            'transactionHash' => $transaction->transaction_hash,
            'fromAddress' => $transaction->from_address,
            'memo' => $transaction->memo,
            'userMessage' => $transaction->user_message,
            'status' => $transaction->status,
            'statusColor' => $transaction->status_color,
            'blockchainData' => $transaction->blockchain_data,
            'confirmations' => $transaction->confirmations,
            'requiredConfirmations' => $transaction->required_confirmations,
            'hasEnoughConfirmations' => $transaction->hasEnoughConfirmations(),
            'canBeCompleted' => $transaction->canBeCompleted(),
            'explorerUrl' => $transaction->getExplorerUrl(),
            'detectedAt' => $transaction->detected_at,
            'confirmedAt' => $transaction->confirmed_at,
            'completedAt' => $transaction->completed_at,
            'adminNotes' => $transaction->admin_notes,
            'createdAt' => $transaction->created_at,
            'updatedAt' => $transaction->updated_at,
        ];
    }

    protected function user($transaction)
    {
        return $this->hasOne($transaction, UserSerializer::class);
    }

    protected function platform($transaction)
    {
        return $this->hasOne($transaction, DepositPlatformSerializer::class);
    }

    protected function depositAddress($transaction)
    {
        return $this->hasOne($transaction, DepositAddressSerializer::class);
    }

    protected function processedBy($transaction)
    {
        return $this->hasOne($transaction, UserSerializer::class);
    }
}
