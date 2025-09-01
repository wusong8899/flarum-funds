<?php

declare(strict_types=1);

namespace wusong8899\Funds\Validator;

use InvalidArgumentException;

class WithdrawalPlatformValidator
{
    /**
     * Validate platform creation data
     *
     * @param array<string, mixed> $data
     * @return void
     * @throws InvalidArgumentException
     */
    public function validateCreate(array $data): void
    {
        $this->validateName($data['name'] ?? null);
        $this->validateSymbol($data['symbol'] ?? null);
        $this->validateAmounts($data['minAmount'] ?? null, $data['maxAmount'] ?? null);
        $this->validateFee($data['fee'] ?? null);
        $this->validateIconUrl($data['iconUrl'] ?? null);
        $this->validateIconClass($data['iconClass'] ?? null);
    }

    /**
     * Validate platform update data
     *
     * @param array<string, mixed> $data
     * @return void
     * @throws InvalidArgumentException
     */
    public function validateUpdate(array $data): void
    {
        if (isset($data['name'])) {
            $this->validateName($data['name']);
        }

        if (isset($data['symbol'])) {
            $this->validateSymbol($data['symbol']);
        }

        if (isset($data['minAmount']) || isset($data['maxAmount'])) {
            $minAmount = $data['minAmount'] ?? null;
            $maxAmount = $data['maxAmount'] ?? null;

            if ($minAmount !== null && $maxAmount !== null) {
                $this->validateAmounts($minAmount, $maxAmount);
            } elseif ($minAmount !== null) {
                $this->validateMinAmount($minAmount);
            } elseif ($maxAmount !== null) {
                $this->validateMaxAmount($maxAmount);
            }
        }

        if (isset($data['fee'])) {
            $this->validateFee($data['fee']);
        }

        if (isset($data['iconUrl'])) {
            $this->validateIconUrl($data['iconUrl']);
        }

        if (isset($data['iconClass'])) {
            $this->validateIconClass($data['iconClass']);
        }
    }

    /**
     * Validate platform name
     *
     * @param mixed $name
     * @return void
     * @throws InvalidArgumentException
     */
    private function validateName($name): void
    {
        if (empty($name) || !is_string($name)) {
            throw new InvalidArgumentException('Platform name is required and must be a string.');
        }

        if (strlen($name) > 100) {
            throw new InvalidArgumentException('Platform name must not exceed 100 characters.');
        }
    }

    /**
     * Validate currency symbol
     *
     * @param mixed $symbol
     * @return void
     * @throws InvalidArgumentException
     */
    private function validateSymbol($symbol): void
    {
        if (empty($symbol) || !is_string($symbol)) {
            throw new InvalidArgumentException('Currency symbol is required and must be a string.');
        }

        if (strlen($symbol) > 10) {
            throw new InvalidArgumentException('Currency symbol must not exceed 10 characters.');
        }
    }

    /**
     * Validate minimum and maximum amounts
     *
     * @param mixed $minAmount
     * @param mixed $maxAmount
     * @return void
     * @throws InvalidArgumentException
     */
    private function validateAmounts($minAmount, $maxAmount): void
    {
        $this->validateMinAmount($minAmount);
        $this->validateMaxAmount($maxAmount);

        if ((float) $maxAmount < (float) $minAmount) {
            throw new InvalidArgumentException('Maximum amount must be greater than or equal to minimum amount.');
        }
    }

    /**
     * Validate minimum amount
     *
     * @param mixed $minAmount
     * @return void
     * @throws InvalidArgumentException
     */
    private function validateMinAmount($minAmount): void
    {
        if (!is_numeric($minAmount) || (float) $minAmount <= 0) {
            throw new InvalidArgumentException('Minimum amount must be a positive number.');
        }

        if ((float) $minAmount > 1000000) {
            throw new InvalidArgumentException('Minimum amount is too large.');
        }
    }

    /**
     * Validate maximum amount
     *
     * @param mixed $maxAmount
     * @return void
     * @throws InvalidArgumentException
     */
    private function validateMaxAmount($maxAmount): void
    {
        if (!is_numeric($maxAmount) || (float) $maxAmount <= 0) {
            throw new InvalidArgumentException('Maximum amount must be a positive number.');
        }

        if ((float) $maxAmount > 1000000) {
            throw new InvalidArgumentException('Maximum amount is too large.');
        }
    }

    /**
     * Validate fee
     *
     * @param mixed $fee
     * @return void
     * @throws InvalidArgumentException
     */
    private function validateFee($fee): void
    {
        if ($fee !== null && !is_numeric($fee)) {
            throw new InvalidArgumentException('Fee must be a numeric value.');
        }

        if ($fee !== null && (float) $fee < 0) {
            throw new InvalidArgumentException('Fee cannot be negative.');
        }

        if ($fee !== null && (float) $fee > 10000) {
            throw new InvalidArgumentException('Fee is too large.');
        }
    }

    /**
     * Validate icon URL
     *
     * @param mixed $iconUrl
     * @return void
     * @throws InvalidArgumentException
     */
    private function validateIconUrl($iconUrl): void
    {
        if ($iconUrl === null) {
            return;
        }

        if (!is_string($iconUrl)) {
            throw new InvalidArgumentException('Icon URL must be a string.');
        }

        if (strlen($iconUrl) > 500) {
            throw new InvalidArgumentException('Icon URL must not exceed 500 characters.');
        }

        if (!empty($iconUrl) && !filter_var($iconUrl, FILTER_VALIDATE_URL)) {
            throw new InvalidArgumentException('Icon URL must be a valid URL.');
        }
    }

    /**
     * Validate icon class
     *
     * @param mixed $iconClass
     * @return void
     * @throws InvalidArgumentException
     */
    private function validateIconClass($iconClass): void
    {
        if ($iconClass === null) {
            return;
        }

        if (!is_string($iconClass)) {
            throw new InvalidArgumentException('Icon class must be a string.');
        }

        if (strlen($iconClass) > 100) {
            throw new InvalidArgumentException('Icon class must not exceed 100 characters.');
        }

        // Validate that icon class contains only safe characters
        if (!empty($iconClass) && !preg_match('/^[a-zA-Z0-9\s\-_]+$/', $iconClass)) {
            throw new InvalidArgumentException('Icon class contains invalid characters.');
        }
    }
}
