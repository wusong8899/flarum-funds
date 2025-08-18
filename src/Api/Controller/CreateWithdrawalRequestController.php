<?php

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\WithdrawalRequestSerializer;
use wusong8899\Withdrawal\Model\WithdrawalRequest;
use wusong8899\Withdrawal\Model\WithdrawalPlatform;

class CreateWithdrawalRequestController extends AbstractCreateController
{
    public $serializer = WithdrawalRequestSerializer::class;

    public $include = ['user', 'platform'];

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);

        if ($actor->isGuest()) {
            throw new PermissionDeniedException();
        }

        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);

        $amount = (float) Arr::get($attributes, 'amount');
        $platformId = (int) Arr::get($attributes, 'platformId');
        $accountDetails = Arr::get($attributes, 'accountDetails');

        // Find the withdrawal platform
        $platform = WithdrawalPlatform::where('id', $platformId)->first();
        
        if (!$platform) {
            throw ValidationException::withMessages([
                'platformId' => 'Selected platform does not exist'
            ]);
        }

        if (!$platform->is_active) {
            throw ValidationException::withMessages([
                'platformId' => 'Selected platform is not active'
            ]);
        }

        // Use platform-specific limits
        $minAmount = (float) $platform->min_amount;
        $maxAmount = (float) $platform->max_amount;

        if ($amount < $minAmount || $amount > $maxAmount) {
            throw ValidationException::withMessages([
                'amount' => "Amount must be between {$minAmount} and {$maxAmount} for {$platform->name}"
            ]);
        }

        if (empty($accountDetails)) {
            throw ValidationException::withMessages([
                'accountDetails' => 'Account details are required'
            ]);
        }

        $request = new WithdrawalRequest();
        $request->user_id = $actor->id;
        $request->platform_id = $platformId;
        $request->amount = $amount;
        $request->account_details = $accountDetails;
        $request->status = WithdrawalRequest::STATUS_PENDING;
        $request->save();

        $request->load(['user', 'platform']);

        return $request;
    }
}