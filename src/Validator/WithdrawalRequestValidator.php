<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Validator;

use Flarum\User\User;
use Flarum\Foundation\ValidationException;
use wusong8899\Withdrawal\Model\WithdrawalPlatform;

class WithdrawalRequestValidator
{
    /**
     * Validate withdrawal request creation
     *
     * @param User $actor
     * @param float $amount
     * @param WithdrawalPlatform|null $platform
     * @param string $accountDetails
     * @return void
     * @throws ValidationException
     */
    public function validateCreate(
        User $actor,
        float $amount,
        ?WithdrawalPlatform $platform,
        string $accountDetails
    ): void {
        // Validate platform exists
        if (!$platform) {
            throw new ValidationException([
                'platformId' => ['Selected platform does not exist']
            ]);
        }

        // Validate platform is active
        if (!$platform->is_active) {
            throw new ValidationException([
                'platformId' => ['Selected platform is not active']
            ]);
        }

        // Validate amount against platform limits
        $this->validateAmount($amount, $platform);

        // Validate account details
        $this->validateAccountDetails($accountDetails);

        // Validate user balance (if money extension is available)
        $this->validateUserBalance($actor, $amount, $platform);
    }

    /**
     * Validate withdrawal amount
     *
     * @param float $amount
     * @param WithdrawalPlatform $platform
     * @return void
     * @throws ValidationException
     */
    private function validateAmount(float $amount, WithdrawalPlatform $platform): void
    {
        $minAmount = (float) $platform->min_amount;
        $maxAmount = (float) $platform->max_amount;

        if ($amount <= 0) {
            throw new ValidationException([
                'amount' => ['Amount must be greater than zero']
            ]);
        }

        if ($amount < $minAmount) {
            throw new ValidationException([
                'amount' => ["Amount must be at least {$minAmount} for {$platform->name}"]
            ]);
        }

        if ($amount > $maxAmount) {
            throw new ValidationException([
                'amount' => ["Amount cannot exceed {$maxAmount} for {$platform->name}"]
            ]);
        }
    }

    /**
     * Validate account details
     *
     * @param string $accountDetails
     * @return void
     * @throws ValidationException
     */
    private function validateAccountDetails(string $accountDetails): void
    {
        if (empty($accountDetails)) {
            throw new ValidationException([
                'accountDetails' => ['Account details are required']
            ]);
        }

        if (strlen($accountDetails) < 5) {
            throw new ValidationException([
                'accountDetails' => ['Account details must be at least 5 characters']
            ]);
        }

        if (strlen($accountDetails) > 500) {
            throw new ValidationException([
                'accountDetails' => ['Account details must not exceed 500 characters']
            ]);
        }
    }

    /**
     * Validate user has sufficient balance
     *
     * @param User $actor
     * @param float $amount
     * @param WithdrawalPlatform $platform
     * @return void
     * @throws ValidationException
     */
    private function validateUserBalance(User $actor, float $amount, WithdrawalPlatform $platform): void
    {
        // Check if money extension is available by checking for the correct class
        if (!class_exists('AntoineFr\Money\AddUserMoneyAttributes')) {
            return; // Skip balance validation if money extension is not available
        }

        // Check if user has money attribute (should be added by money extension)
        if (!isset($actor->money)) {
            throw new ValidationException([
                'amount' => ['Money extension is not properly configured']
            ]);
        }

        $userBalance = (float) ($actor->money ?? 0);
        $totalRequired = $amount + (float) ($platform->fee ?? 0);

        if ($userBalance < $totalRequired) {
            $feeText = $platform->fee > 0 ? " (including {$platform->fee} fee)" : '';
            throw new ValidationException([
                'amount' => ["Insufficient balance. You need {$totalRequired}{$feeText} but only have {$userBalance}"]
            ]);
        }
    }

    /**
     * Validate withdrawal request can be updated
     *
     * @param User $actor
     * @param string $currentStatus
     * @param string|null $newStatus
     * @return void
     * @throws ValidationException
     */
    public function validateUpdate(User $actor, string $currentStatus, ?string $newStatus): void
    {
        if (!$actor->isAdmin()) {
            throw new ValidationException([
                'permission' => ['Only administrators can update withdrawal requests']
            ]);
        }

        if ($newStatus !== null) {
            $this->validateStatusTransition($currentStatus, $newStatus);
        }
    }

    /**
     * Validate status transition
     *
     * @param string $currentStatus
     * @param string $newStatus
     * @return void
     * @throws ValidationException
     */
    private function validateStatusTransition(string $currentStatus, string $newStatus): void
    {
        $validStatuses = ['pending', 'approved', 'rejected'];

        if (!in_array($newStatus, $validStatuses, true)) {
            throw new ValidationException([
                'status' => ['Invalid status. Must be one of: pending, approved, rejected']
            ]);
        }

        // Don't allow changing from approved/rejected back to pending
        if (in_array($currentStatus, ['approved', 'rejected'], true) && $newStatus === 'pending') {
            throw new ValidationException([
                'status' => ['Cannot change status from ' . $currentStatus . ' back to pending']
            ]);
        }

        // Don't allow changing from rejected to approved or vice versa
        if (($currentStatus === 'approved' && $newStatus === 'rejected') ||
            ($currentStatus === 'rejected' && $newStatus === 'approved')) {
            throw new ValidationException([
                'status' => ['Cannot change status directly from ' . $currentStatus . ' to ' . $newStatus]
            ]);
        }
    }

    /**
     * Validate request can be deleted
     *
     * @param User $actor
     * @param string $status
     * @return void
     * @throws ValidationException
     */
    public function validateDelete(User $actor, string $status): void
    {
        if (!$actor->isAdmin()) {
            throw new ValidationException([
                'permission' => ['Only administrators can delete withdrawal requests']
            ]);
        }

        // Optionally, you might want to prevent deletion of approved requests
        if ($status === 'approved') {
            throw new ValidationException([
                'status' => ['Cannot delete approved withdrawal requests']
            ]);
        }
    }
}
