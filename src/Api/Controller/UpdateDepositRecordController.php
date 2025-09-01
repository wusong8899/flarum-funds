<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Funds\Api\Serializer\DepositRecordSerializer;
use wusong8899\Funds\Model\DepositRecord;

class UpdateDepositRecordController extends AbstractShowController
{
    public $serializer = DepositRecordSerializer::class;

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

    public $include = [
        'user',
        'platform',
        'processedByUser'
    ];

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $recordId = Arr::get($request->getQueryParams(), 'id');
        $data = Arr::get($request->getParsedBody(), 'data.attributes', []);

        // Check if user has permission to manage deposit records
        if (!$actor->hasPermission('wusong8899-funds.manageDepositRecords')) {
            throw new PermissionDeniedException();
        }

        // Find the deposit record
        $record = DepositRecord::with(['user', 'platform'])->find($recordId);
        if (!$record) {
            throw new ModelNotFoundException();
        }

        // Check if record is still pending
        if (!$record->isPending()) {
            throw new ValidationException([
                'status' => 'This deposit record has already been processed.'
            ]);
        }

        $status = Arr::get($data, 'status');
        $adminNotes = Arr::get($data, 'adminNotes', '');

        if ($status === DepositRecord::STATUS_APPROVED) {
            $this->approveRecord($record, $actor, $data, $adminNotes);
        } elseif ($status === DepositRecord::STATUS_REJECTED) {
            $this->rejectRecord($record, $actor, $adminNotes);
        } else {
            throw new ValidationException([
                'status' => 'Invalid status. Must be either approved or rejected.'
            ]);
        }

        // Load relationships for response
        $record->load(['user', 'platform', 'processedBy']);

        return $record;
    }

    private function approveRecord(DepositRecord $record, $admin, array $data, string $notes): void
    {
        $creditedAmount = Arr::get($data, 'creditedAmount');
        if ($creditedAmount !== null) {
            $creditedAmount = (float) $creditedAmount;
            if ($creditedAmount <= 0) {
                throw new ValidationException([
                    'creditedAmount' => 'Credited amount must be greater than zero.'
                ]);
            }
        }

        $this->db->transaction(function () use ($record, $admin, $creditedAmount, $notes) {
            // Lock user record to prevent race conditions
            $user = $record->user()->lockForUpdate()->first();

            // Calculate amount to credit (use credited amount if provided, otherwise use original amount)
            $amountToCredit = $creditedAmount ?? $record->amount;

            // Credit user balance
            $currentBalance = (float) ($user->money ?? 0);
            $user->money = $currentBalance + $amountToCredit;
            $user->save();

            // Update deposit record
            $record->approve($admin, $amountToCredit, $notes);
        });
    }

    private function rejectRecord(DepositRecord $record, $admin, string $reason): void
    {
        if (empty($reason)) {
            throw new ValidationException([
                'adminNotes' => 'Rejection reason is required when rejecting a deposit record.'
            ]);
        }

        $record->reject($admin, $reason);
    }
}
