<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Flarum\Foundation\ValidationException;
use Illuminate\Contracts\Validation\Factory as ValidatorFactory;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\DepositTransactionSerializer;
use wusong8899\Withdrawal\Model\DepositTransaction;

class UpdateDepositTransactionController extends AbstractShowController
{
    public $serializer = DepositTransactionSerializer::class;

    public $include = ['user', 'platform', 'depositAddress', 'processedBy'];

    protected function data(ServerRequestInterface $request, Document $document): DepositTransaction
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertAdmin();

        $id = Arr::get($request->getQueryParams(), 'id');
        $transaction = DepositTransaction::findOrFail($id);

        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);

        $this->validateData($attributes, $transaction);

        // Handle status changes
        $newStatus = $attributes['status'] ?? null;
        if ($newStatus && $newStatus !== $transaction->status) {
            $this->handleStatusChange($transaction, $newStatus, $actor);
        }

        $transaction->update([
            'amount' => $attributes['amount'] ?? $transaction->amount,
            'fee' => $attributes['fee'] ?? $transaction->fee,
            'credited_amount' => $attributes['creditedAmount'] ?? $transaction->credited_amount,
            'transaction_hash' => $attributes['transactionHash'] ?? $transaction->transaction_hash,
            'from_address' => $attributes['fromAddress'] ?? $transaction->from_address,
            'memo' => $attributes['memo'] ?? $transaction->memo,
            'status' => $newStatus ?? $transaction->status,
            'confirmations' => $attributes['confirmations'] ?? $transaction->confirmations,
            'required_confirmations' => $attributes['requiredConfirmations'] ?? $transaction->required_confirmations,
            'admin_notes' => $attributes['adminNotes'] ?? $transaction->admin_notes,
            'processed_by' => $actor->id,
        ]);

        return $transaction->load(['user', 'platform', 'depositAddress', 'processedBy']);
    }

    private function validateData(array $attributes, DepositTransaction $transaction): void
    {
        $rules = [
            'amount' => 'sometimes|required|numeric|min:0.00000001',
            'fee' => 'sometimes|nullable|numeric|min:0',
            'creditedAmount' => 'sometimes|nullable|numeric|min:0',
            'transactionHash' => 'sometimes|nullable|string|max:255',
            'fromAddress' => 'sometimes|nullable|string|max:255',
            'memo' => 'sometimes|nullable|string|max:1000',
            'status' => 'sometimes|required|in:pending,confirmed,completed,failed,cancelled',
            'confirmations' => 'sometimes|nullable|integer|min:0',
            'requiredConfirmations' => 'sometimes|nullable|integer|min:1',
            'adminNotes' => 'sometimes|nullable|string|max:1000',
        ];

        $validatorFactory = resolve(ValidatorFactory::class);
        $validator = $validatorFactory->make($attributes, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator->errors()->toArray());
        }

        // Check for duplicate transaction hash
        if (!empty($attributes['transactionHash']) && $attributes['transactionHash'] !== $transaction->transaction_hash) {
            $exists = DepositTransaction::where('platform_id', $transaction->platform_id)
                ->where('transaction_hash', $attributes['transactionHash'])
                ->where('id', '!=', $transaction->id)
                ->exists();

            if ($exists) {
                throw new ValidationException([
                    'transactionHash' => ['A transaction with this hash already exists for this platform.']
                ]);
            }
        }
    }

    private function handleStatusChange(DepositTransaction $transaction, string $newStatus, $actor): void
    {
        switch ($newStatus) {
            case DepositTransaction::STATUS_CONFIRMED:
                if ($transaction->status === DepositTransaction::STATUS_PENDING) {
                    $transaction->markAsConfirmed();
                }
                break;

            case DepositTransaction::STATUS_COMPLETED:
                if ($transaction->status === DepositTransaction::STATUS_CONFIRMED) {
                    try {
                        $transaction->complete($actor);
                    } catch (\InvalidArgumentException $e) {
                        throw new ValidationException([
                            'status' => [$e->getMessage()]
                        ]);
                    }
                }
                break;

            case DepositTransaction::STATUS_FAILED:
            case DepositTransaction::STATUS_CANCELLED:
                // These are allowed from any status
                break;

            default:
                throw new ValidationException([
                    'status' => ['Invalid status transition.']
                ]);
        }
    }
}
