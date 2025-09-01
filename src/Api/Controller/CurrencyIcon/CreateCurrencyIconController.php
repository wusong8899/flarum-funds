<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Controller\CurrencyIcon;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Illuminate\Contracts\Validation\Factory as ValidatorFactory;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Funds\Api\Serializer\CurrencyIconSerializer;
use wusong8899\Funds\Model\CurrencyIcon;
use Flarum\Foundation\ValidationException;

class CreateCurrencyIconController extends AbstractCreateController
{
    public $serializer = CurrencyIconSerializer::class;

    protected ValidatorFactory $validator;

    public function __construct(ValidatorFactory $validator)
    {
        $this->validator = $validator;
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertAdmin();

        $attributes = $request->getParsedBody()['data']['attributes'] ?? [];

        // Validate required fields
        $this->validateAttributes($attributes);

        // Check for duplicate currency symbol
        $existingCurrency = CurrencyIcon::where('currency_symbol', strtoupper($attributes['currencySymbol']))->first();
        if ($existingCurrency) {
            throw new ValidationException([
                'Currency symbol already exists'
            ]);
        }

        $currencyIcon = new CurrencyIcon();
        $currencyIcon->currency_symbol = strtoupper($attributes['currencySymbol']);
        $currencyIcon->currency_name = $attributes['currencyName'];
        $currencyIcon->currency_icon_url = $attributes['currencyIconUrl'] ?? null;
        $currencyIcon->currency_icon_class = $attributes['currencyIconClass'] ?? null;
        $currencyIcon->currency_unicode_symbol = $attributes['currencyUnicodeSymbol'] ?? null;
        $currencyIcon->display_priority = $attributes['displayPriority'] ?? 0;
        $currencyIcon->is_active = $attributes['isActive'] ?? true;

        $currencyIcon->save();

        return $currencyIcon;
    }

    private function validateAttributes(array $attributes): void
    {
        $rules = [
            'currencySymbol' => 'required|string|max:10',
            'currencyName' => 'required|string|max:100',
            'currencyIconUrl' => 'nullable|string|max:500|url',
            'currencyIconClass' => 'nullable|string|max:100',
            'currencyUnicodeSymbol' => 'nullable|string|max:10',
            'displayPriority' => 'nullable|integer',
            'isActive' => 'nullable|boolean',
        ];

        $validator = $this->validator->make($attributes, $rules);

        if ($validator->fails()) {
            $errors = $validator->errors();
            $flattenedErrors = [];
            
            foreach ($errors->toArray() as $field => $messages) {
                foreach ($messages as $message) {
                    $flattenedErrors[] = $message;
                }
            }
            
            throw new ValidationException($flattenedErrors);
        }
    }
}
