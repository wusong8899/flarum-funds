<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Validator;

use Flarum\Foundation\AbstractValidator;

class DepositRecordValidator extends AbstractValidator
{
    protected function getRules()
    {
        return [
            'platformId' => ['required', 'integer', 'min:1'],
            'platformAccount' => ['required', 'string', 'max:255'],
            'realName' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'depositTime' => ['required', 'date'],
            'screenshotUrl' => ['nullable', 'url', 'max:500'],
            'userMessage' => ['nullable', 'string', 'max:1000'],
        ];
    }

    protected function getMessages()
    {
        return [
            'platformId.required' => 'Please select a deposit platform.',
            'platformId.integer' => 'Invalid platform selection.',
            'platformAccount.required' => 'Platform account is required.',
            'platformAccount.max' => 'Platform account cannot exceed 255 characters.',
            'realName.max' => 'Real name cannot exceed 255 characters.',
            'amount.required' => 'Deposit amount is required.',
            'amount.numeric' => 'Deposit amount must be a valid number.',
            'amount.min' => 'Deposit amount must be greater than zero.',
            'depositTime.required' => 'Deposit time is required.',
            'depositTime.date' => 'Please provide a valid deposit time.',
            'screenshotUrl.url' => 'Screenshot URL must be a valid URL.',
            'screenshotUrl.max' => 'Screenshot URL cannot exceed 500 characters.',
            'userMessage.max' => 'Message cannot exceed 1000 characters.',
        ];
    }
}
