<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Controller\CurrencyIcon;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Illuminate\Contracts\Validation\Factory as ValidatorFactory;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Funds\Api\Serializer\CurrencyIconSerializer;
use wusong8899\Funds\Model\CurrencyIcon;
use Flarum\Foundation\ValidationException;

class UpdateCurrencyIconController extends AbstractShowController
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

        $id = (int) $request->getAttribute('id');
        $attributes = $request->getParsedBody()['data']['attributes'] ?? [];

        $currencyIcon = CurrencyIcon::findOrFail($id);

        // Validate attributes
        $this->validateAttributes($attributes);

        // Check for duplicate currency symbol (if changing)
        if (
            isset($attributes['currencySymbol']) &&
            strtoupper($attributes['currencySymbol']) !== $currencyIcon->currency_symbol
        ) {
            $existingCurrency = CurrencyIcon::where('currency_symbol', strtoupper($attributes['currencySymbol']))
                ->where('id', '!=', $currencyIcon->id)
                ->first();
            if ($existingCurrency) {
                throw new ValidationException([
                    'Currency symbol already exists'
                ]);
            }
        }

        // Update fields
        if (isset($attributes['currencySymbol'])) {
            $currencyIcon->currency_symbol = strtoupper($attributes['currencySymbol']);
        }
        if (isset($attributes['currencyName'])) {
            $currencyIcon->currency_name = $attributes['currencyName'];
        }
        if (array_key_exists('currencyIconUrl', $attributes)) {
            $currencyIcon->currency_icon_url = $attributes['currencyIconUrl'];
        }
        if (array_key_exists('currencyIconClass', $attributes)) {
            $currencyIcon->currency_icon_class = $attributes['currencyIconClass'];
        }
        if (array_key_exists('currencyUnicodeSymbol', $attributes)) {
            $currencyIcon->currency_unicode_symbol = $attributes['currencyUnicodeSymbol'];
        }
        if (isset($attributes['displayPriority'])) {
            $currencyIcon->display_priority = $attributes['displayPriority'];
        }
        if (isset($attributes['isActive'])) {
            $currencyIcon->is_active = $attributes['isActive'];
        }

        $currencyIcon->save();

        return $currencyIcon;
    }

    private function validateAttributes(array $attributes): void
    {
        $rules = [
            'currencySymbol' => 'sometimes|required|string|max:10',
            'currencyName' => 'sometimes|required|string|max:100',
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
