<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractDeleteController;
use Flarum\Http\RequestUtil;
use Flarum\User\Exception\PermissionDeniedException;
use Psr\Http\Message\ServerRequestInterface;
use wusong8899\Withdrawal\Model\DepositRecord;

class DeleteDepositRecordController extends AbstractDeleteController
{
    protected function delete(ServerRequestInterface $request): void
    {
        $actor = RequestUtil::getActor($request);
        $id = $request->getAttribute('id');

        // Find the deposit record
        $record = DepositRecord::findOrFail($id);

        // Permission check: Admin can delete any record, users can only delete their own pending records
        if (!$actor->isAdmin() && ($record->user_id !== $actor->id || $record->status !== DepositRecord::STATUS_PENDING)) {
            throw new PermissionDeniedException();
        }

        // Admin can delete any record (including processed ones)
        // Users can only delete their own pending records (handled above)
        $record->delete();
    }
}