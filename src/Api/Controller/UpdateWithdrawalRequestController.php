<?php

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\WithdrawalRequestSerializer;
use wusong8899\Withdrawal\Model\WithdrawalRequest;

class UpdateWithdrawalRequestController extends AbstractShowController
{
    public $serializer = WithdrawalRequestSerializer::class;

    public $include = ['user', 'platform'];

    /**
     * @var ConnectionInterface
     */
    protected $db;

    /**
     * @param ConnectionInterface $db
     */
    public function __construct(ConnectionInterface $db)
    {
        $this->db = $db;
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);

        if (!$actor->isAdmin()) {
            throw new PermissionDeniedException();
        }

        $id = Arr::get($request->getQueryParams(), 'id');
        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);

        $withdrawalRequest = WithdrawalRequest::findOrFail($id);

        if (!$withdrawalRequest->isPending()) {
            throw ValidationException::withMessages([
                'status' => 'Only pending requests can be updated'
            ]);
        }

        $status = Arr::get($attributes, 'status');

        if ($status === WithdrawalRequest::STATUS_APPROVED) {
            $this->approveWithdrawal($withdrawalRequest);
        } elseif ($status === WithdrawalRequest::STATUS_REJECTED) {
            $withdrawalRequest->reject();
            $withdrawalRequest->save();
        } else {
            throw ValidationException::withMessages([
                'status' => 'Invalid status'
            ]);
        }
        $withdrawalRequest->load(['user', 'platform']);

        return $withdrawalRequest;
    }

    /**
     * Approve withdrawal request and deduct user balance
     *
     * @param WithdrawalRequest $withdrawalRequest
     * @return void
     * @throws ValidationException
     */
    private function approveWithdrawal(WithdrawalRequest $withdrawalRequest): void
    {
        $this->db->transaction(function () use ($withdrawalRequest) {
            // Lock the user record for update to prevent concurrent modifications
            $user = $withdrawalRequest->user()->lockForUpdate()->first();
            $platform = $withdrawalRequest->platform;

            $amount = $withdrawalRequest->amount;
            $fee = (float) ($platform->fee ?? 0);
            $totalAmount = $amount + $fee;

            // Re-check balance to handle concurrent requests
            if ($user->money < $totalAmount) {
                throw ValidationException::withMessages([
                    'amount' => "User has insufficient balance. Required: {$totalAmount} (including {$fee} fee), Available: {$user->money}"
                ]);
            }

            // Deduct money from user balance
            $user->money -= $totalAmount;
            $user->save();

            // Update withdrawal request status
            $withdrawalRequest->approve();
            $withdrawalRequest->save();
        });
    }
}
