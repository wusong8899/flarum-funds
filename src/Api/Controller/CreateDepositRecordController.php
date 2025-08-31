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
use wusong8899\Withdrawal\Api\Serializer\DepositRecordSerializer;
use wusong8899\Withdrawal\Model\DepositRecord;
use wusong8899\Withdrawal\Model\DepositPlatform;
use wusong8899\Withdrawal\Validator\DepositRecordValidator;

class CreateDepositRecordController extends AbstractCreateController
{
    public $serializer = DepositRecordSerializer::class;

    public $include = [
        'user',
        'platform'
    ];

    protected $validator;

    public function __construct(DepositRecordValidator $validator)
    {
        $this->validator = $validator;
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $data = Arr::get($request->getParsedBody(), 'data.attributes', []);

        // Check if user is authenticated
        if (!$actor->exists) {
            throw new PermissionDeniedException();
        }

        // Check if user has permission to submit deposit records
        if (!$actor->hasPermission('wusong8899-funds.submitDepositRecord')) {
            throw new PermissionDeniedException();
        }

        // Validate platform exists and is active
        $platformId = Arr::get($data, 'platformId');
        $platform = DepositPlatform::where('id', $platformId)
            ->where('is_active', true)
            ->first();

        if (!$platform) {
            throw new ValidationException([
                'platformId' => 'Selected deposit platform is not available.'
            ]);
        }

        // Validate input data
        $this->validator->assertValid($data);

        // Validate amount against platform limits
        $amount = (float) Arr::get($data, 'amount');
        $minAmount = $platform->min_amount ?? 0;
        $maxAmount = $platform->max_amount ?? PHP_FLOAT_MAX;

        if ($amount < $minAmount) {
            throw new ValidationException([
                'amount' => "Amount must be at least {$minAmount} {$platform->symbol}"
            ]);
        }

        if ($amount > $maxAmount) {
            throw new ValidationException([
                'amount' => "Amount cannot exceed {$maxAmount} {$platform->symbol}"
            ]);
        }

        // Create the deposit record
        $record = new DepositRecord();
        $record->user_id = $actor->id;
        $record->platform_id = $platformId;
        $record->platform_account = Arr::get($data, 'platformAccount');
        $record->real_name = Arr::get($data, 'realName');
        $record->amount = $amount;
        $record->deposit_time = new \DateTime(Arr::get($data, 'depositTime'));
        $record->screenshot_url = Arr::get($data, 'screenshotUrl');
        $record->user_message = Arr::get($data, 'userMessage');
        $record->status = DepositRecord::STATUS_PENDING;

        $record->save();

        // Load relationships for response
        $record->load(['user', 'platform']);

        return $record;
    }
}
