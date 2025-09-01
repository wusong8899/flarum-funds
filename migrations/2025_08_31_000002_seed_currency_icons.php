<?php

use Carbon\Carbon;
use Flarum\Database\Migration;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $connection = $schema->getConnection();

        // Seed common currency icons
        $currencies = [
            [
                'currency_symbol' => 'USDT',
                'currency_name' => 'Tether',
                'currency_icon_class' => 'fas fa-dollar-sign',
                'currency_unicode_symbol' => '₮',
                'display_priority' => 10,
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'currency_symbol' => 'USDC',
                'currency_name' => 'USD Coin',
                'currency_icon_class' => 'fas fa-circle-dollar-to-slot',
                'currency_unicode_symbol' => '$',
                'display_priority' => 9,
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'currency_symbol' => 'BTC',
                'currency_name' => 'Bitcoin',
                'currency_icon_class' => 'fab fa-bitcoin',
                'currency_unicode_symbol' => '₿',
                'display_priority' => 8,
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'currency_symbol' => 'ETH',
                'currency_name' => 'Ethereum',
                'currency_icon_class' => 'fab fa-ethereum',
                'currency_unicode_symbol' => 'Ξ',
                'display_priority' => 7,
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'currency_symbol' => 'BNB',
                'currency_name' => 'BNB',
                'currency_icon_class' => 'fas fa-coins',
                'currency_unicode_symbol' => 'Ⓑ',
                'display_priority' => 6,
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'currency_symbol' => 'TRX',
                'currency_name' => 'TRON',
                'currency_icon_class' => 'fas fa-bolt',
                'currency_unicode_symbol' => 'Ŧ',
                'display_priority' => 5,
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ];

        foreach ($currencies as $currency) {
            $connection->table('wusong8899_funds_currency_icons')->insert($currency);
        }
    },

    'down' => function (Builder $schema) {
        $connection = $schema->getConnection();
        $connection->table('wusong8899_funds_currency_icons')->truncate();
    }
];
