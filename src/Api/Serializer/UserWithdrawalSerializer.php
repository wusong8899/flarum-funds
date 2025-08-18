<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Serializer;

use Flarum\Api\Serializer\UserSerializer;
use Flarum\User\User;

class UserWithdrawalSerializer
{
    /**
     * @param UserSerializer $serializer
     * @param User $user
     * @param array<string, mixed> $attributes
     * @return array<string, mixed>
     */
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

        return $attributes;
    }
}
