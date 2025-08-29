<?php

declare(strict_types=1);

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
use wusong8899\Withdrawal\Validator\WithdrawalRequestValidator;

class CreateWithdrawalRequestController extends AbstractCreateController
{
    public $serializer = WithdrawalRequestSerializer::class;

    /** @var array<string> */
    public $include = ['user', 'platform'];

    private WithdrawalRequestValidator $validator;

    public function __construct()
    {
        $this->validator = new WithdrawalRequestValidator();
    }

    /**
     * @param ServerRequestInterface $request
     * @param Document $document
     * @return WithdrawalRequest
     * @throws PermissionDeniedException
     * @throws ValidationException
     */
    protected function data(ServerRequestInterface $request, Document $document): WithdrawalRequest
    {
        $actor = RequestUtil::getActor($request);

        if ($actor->isGuest()) {
            throw new PermissionDeniedException();
        }

        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);

        $amount = (float) Arr::get($attributes, 'amount', 0);
        $platformId = (int) Arr::get($attributes, 'platformId', 0);
        $accountDetails = (string) Arr::get($attributes, 'accountDetails', '');
        $message = Arr::get($attributes, 'message', null);

        // Find the withdrawal platform
        $platform = WithdrawalPlatform::find($platformId);

        // Validate the request
        try {
            $this->validator->validateCreate($actor, $amount, $platform, $accountDetails);
        } catch (ValidationException $e) {
            // Re-throw with better error formatting if needed
            throw $e;
        } catch (\Exception $e) {
            // Handle unexpected errors
            throw ValidationException::withMessages(['general' => ['An unexpected error occurred: ' . $e->getMessage()]]);
        }

        $withdrawalRequest = new WithdrawalRequest();
        $withdrawalRequest->user_id = $actor->id;
        $withdrawalRequest->platform_id = $platformId;
        $withdrawalRequest->amount = $amount;
        $withdrawalRequest->account_details = $accountDetails;
        $withdrawalRequest->message = $message;
        $withdrawalRequest->status = WithdrawalRequest::STATUS_PENDING;
        $withdrawalRequest->save();

        $withdrawalRequest->load(['user', 'platform']);

        return $withdrawalRequest;
    }
}
