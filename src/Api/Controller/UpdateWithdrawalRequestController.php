<?php

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Flarum\User\Exception\PermissionDeniedException;
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
            $withdrawalRequest->approve();
        } elseif ($status === WithdrawalRequest::STATUS_REJECTED) {
            $withdrawalRequest->reject();
        } else {
            throw ValidationException::withMessages([
                'status' => 'Invalid status'
            ]);
        }

        $withdrawalRequest->save();
        $withdrawalRequest->load(['user', 'platform']);

        return $withdrawalRequest;
    }
}