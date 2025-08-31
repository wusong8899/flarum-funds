<?php

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\DepositRecordSerializer;
use wusong8899\Withdrawal\Model\DepositRecord;

class ShowDepositRecordController extends AbstractShowController
{
    /**
     * {@inheritdoc}
     */
    public $serializer = DepositRecordSerializer::class;

    /**
     * {@inheritdoc}
     */
    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $id = Arr::get($request->getQueryParams(), 'id');

        $depositRecord = DepositRecord::findOrFail($id);

        // Check permissions - users can only view their own records, admins can view all
        if (!$actor->isAdmin() && $depositRecord->user_id !== $actor->id) {
            throw new \Flarum\Foundation\ValidationException([
                'message' => 'You do not have permission to view this deposit record',
            ]);
        }

        return $depositRecord;
    }
}
