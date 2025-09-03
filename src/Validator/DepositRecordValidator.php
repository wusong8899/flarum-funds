<?php

declare(strict_types=1);

namespace wusong8899\Funds\Validator;

use Flarum\Foundation\AbstractValidator;

class DepositRecordValidator extends AbstractValidator
{
    protected function getRules()
    {
        return [
            'platformId' => ['required', 'integer', 'min:1'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'screenshotUrl' => ['nullable', 'url', 'max:500'],
            'userMessage' => ['nullable', 'string', 'max:1000'],
        ];
    }

    protected function getMessages()
    {
        return [
            'platformId.required' => 'Please select a deposit platform.',
            'platformId.integer' => 'Invalid platform selection.',
            'amount.required' => 'Deposit amount is required.',
            'amount.numeric' => 'Deposit amount must be a valid number.',
            'amount.min' => 'Deposit amount must be greater than zero.',
            'screenshotUrl.url' => 'Screenshot URL must be a valid URL.',
            'screenshotUrl.max' => 'Screenshot URL cannot exceed 500 characters.',
            'userMessage.max' => 'Message cannot exceed 1000 characters.',
        ];
    }
}
