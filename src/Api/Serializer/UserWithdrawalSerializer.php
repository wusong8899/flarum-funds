<?php

namespace wusong8899\Withdrawal\Api\Serializer;

use Flarum\Api\Serializer\UserSerializer;
use Flarum\User\User;

class UserWithdrawalSerializer
{
    public function __invoke(UserSerializer $serializer, User $user, array $attributes): array
    {
        // Add money balance from antoinefr/flarum-ext-money extension
        if (class_exists('AntoineFr\Money\User\UserMoney')) {
            $money = $user->money ?? 0;
            $attributes['money'] = (float) $money;
        } else {
            // Fallback if money extension is not available
            $attributes['money'] = 0.0;
        }

        // Add phone verification status
        // This would typically come from a phone verification extension
        // For now, we'll check if the user has a phone number field
        $attributes['phoneVerified'] = !empty($user->phone) || !empty($user->phone_number);

        // Add 2FA status
        // This would typically come from a 2FA extension like fof/two-factor
        // For now, we'll default to false
        $attributes['twoFactorEnabled'] = false;

        // Check if user has 2FA enabled using common 2FA extension patterns
        if (method_exists($user, 'getTwoFactorEnabled')) {
            $attributes['twoFactorEnabled'] = $user->getTwoFactorEnabled();
        } elseif (isset($user->two_factor_enabled)) {
            $attributes['twoFactorEnabled'] = (bool) $user->two_factor_enabled;
        } elseif (isset($user->totp_secret)) {
            $attributes['twoFactorEnabled'] = !empty($user->totp_secret);
        }

        return $attributes;
    }
}