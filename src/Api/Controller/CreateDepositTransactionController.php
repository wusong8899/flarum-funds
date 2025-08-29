<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\DepositTransactionSerializer;
use wusong8899\Withdrawal\Model\DepositAddress;
use wusong8899\Withdrawal\Model\DepositPlatform;
use wusong8899\Withdrawal\Model\DepositTransaction;

class CreateDepositTransactionController extends AbstractCreateController
{
    public $serializer = DepositTransactionSerializer::class;

    public $include = ['user', 'platform', 'depositAddress'];

    protected function data(ServerRequestInterface $request, Document $document): DepositTransaction
    {
        $actor = RequestUtil::getActor($request);
        
        // Only admins can manually create deposit transactions
        // Regular users' deposits are detected automatically by blockchain monitoring
        $actor->assertAdmin();

        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);

        $this->validateData($attributes);

        $platform = DepositPlatform::findOrFail($attributes['platformId']);
        
        // Find or create deposit address
        $depositAddress = null;
        if (isset($attributes['addressId'])) {
            $depositAddress = DepositAddress::findOrFail($attributes['addressId']);
        }

        $transaction = DepositTransaction::create([
            'user_id' => $attributes['userId'],
            'platform_id' => $attributes['platformId'],
            'address_id' => $depositAddress?->id,
            'amount' => $attributes['amount'],
            'fee' => $attributes['fee'] ?? 0,
            'credited_amount' => $attributes['creditedAmount'] ?? $attributes['amount'],
            'transaction_hash' => $attributes['transactionHash'] ?? null,
            'from_address' => $attributes['fromAddress'] ?? null,
            'memo' => $attributes['memo'] ?? null,
            'status' => $attributes['status'] ?? DepositTransaction::STATUS_PENDING,
            'confirmations' => $attributes['confirmations'] ?? 0,
            'required_confirmations' => $attributes['requiredConfirmations'] ?? 1,
            'admin_notes' => $attributes['adminNotes'] ?? null,
            'processed_by' => $actor->id,
        ]);

        return $transaction->load(['user', 'platform', 'depositAddress']);
    }

    private function validateData(array $attributes): void
    {
        $rules = [
            'userId' => 'required|integer|exists:users,id',
            'platformId' => 'required|integer|exists:deposit_platforms,id',
            'addressId' => 'nullable|integer|exists:deposit_addresses,id',
            'amount' => 'required|numeric|min:0.00000001',
            'fee' => 'nullable|numeric|min:0',
            'creditedAmount' => 'nullable|numeric|min:0',
            'transactionHash' => 'nullable|string|max:255',
            'fromAddress' => 'nullable|string|max:255',
            'memo' => 'nullable|string|max:1000',
            'status' => 'nullable|in:pending,confirmed,completed,failed,cancelled',
            'confirmations' => 'nullable|integer|min:0',
            'requiredConfirmations' => 'nullable|integer|min:1',
            'adminNotes' => 'nullable|string|max:1000',
        ];

        $validator = app('validator')->make($attributes, $rules);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        // Check for duplicate transaction hash
        if (!empty($attributes['transactionHash'])) {
            $exists = DepositTransaction::where('platform_id', $attributes['platformId'])
                ->where('transaction_hash', $attributes['transactionHash'])
                ->exists();

            if ($exists) {
                throw ValidationException::withMessages([
                    'transactionHash' => ['A transaction with this hash already exists for this platform.']
                ]);
            }
        }
    }
}