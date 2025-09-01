<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Controller;

use Carbon\Carbon;
use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Support\Arr;
use InvalidArgumentException;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Funds\Api\Serializer\WithdrawalPlatformSerializer;
use wusong8899\Funds\Model\WithdrawalPlatform;
use wusong8899\Funds\Validator\WithdrawalPlatformValidator;

class CreateWithdrawalPlatformController extends AbstractCreateController
{
    public $serializer = WithdrawalPlatformSerializer::class;

    private WithdrawalPlatformValidator $validator;

    public function __construct()
    {
        $this->validator = new WithdrawalPlatformValidator();
    }

    /**
     * @param ServerRequestInterface $request
     * @param Document $document
     * @return WithdrawalPlatform
     * @throws PermissionDeniedException
     * @throws InvalidArgumentException
     */
    protected function data(ServerRequestInterface $request, Document $document): WithdrawalPlatform
    {
        $actor = RequestUtil::getActor($request);

        if (!$actor->isAdmin()) {
            throw new PermissionDeniedException();
        }

        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);

        // Validate input data
        $this->validator->validateCreate($attributes);

        // Extract validated fields
        $name = (string) Arr::get($attributes, 'name', '');
        $symbol = (string) Arr::get($attributes, 'symbol', '');
        $minAmount = (float) Arr::get($attributes, 'minAmount', 0);
        $maxAmount = (float) Arr::get($attributes, 'maxAmount', 0);
        $fee = (float) Arr::get($attributes, 'fee', 0);
        $iconUrl = Arr::get($attributes, 'iconUrl');
        $iconClass = Arr::get($attributes, 'iconClass');
        $isActive = (bool) Arr::get($attributes, 'isActive', true);

        $platform = new WithdrawalPlatform();
        $platform->name = trim($name);
        $platform->symbol = trim($symbol);
        $platform->min_amount = $minAmount;
        $platform->max_amount = $maxAmount;
        $platform->fee = $fee;
        $platform->icon_url = $iconUrl ? trim((string) $iconUrl) : null;
        $platform->icon_class = $iconClass ? trim((string) $iconClass) : null;
        $platform->is_active = $isActive;
        $platform->created_at = Carbon::now();
        $platform->save();

        return $platform;
    }
}
