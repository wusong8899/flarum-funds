<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        // First, ensure the crypto fields exist (in case previous migration didn't run)
        if (!$schema->hasColumn('withdrawal_platforms', 'symbol')) {
            $schema->table('withdrawal_platforms', function (Blueprint $table) {
                $table->string('symbol', 10)->nullable()->after('name');
                $table->decimal('min_amount', 20, 8)->default(0.001)->after('symbol');
                $table->decimal('max_amount', 20, 8)->default(10.0)->after('min_amount');
                $table->decimal('fee', 20, 8)->default(0.0005)->after('max_amount');
                $table->string('icon')->nullable()->after('fee');
                $table->boolean('is_active')->default(true)->after('icon');
            });
        }

        // Clear existing incomplete platforms
        $schema->getConnection()->table('withdrawal_platforms')->delete();

        // Insert complete test platforms with crypto data
        $schema->getConnection()->table('withdrawal_platforms')->insert([
            [
                'name' => 'Bitcoin',
                'symbol' => 'BTC',
                'min_amount' => '0.00100000',
                'max_amount' => '10.00000000',
                'fee' => '0.00050000',
                'icon' => 'fab fa-bitcoin',
                'is_active' => true,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'name' => 'Tether USD',
                'symbol' => 'USDT',
                'min_amount' => '1.00000000',
                'max_amount' => '50000.00000000',
                'fee' => '1.00000000',
                'icon' => 'fas fa-dollar-sign',
                'is_active' => true,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'name' => 'Ethereum',
                'symbol' => 'ETH',
                'min_amount' => '0.01000000',
                'max_amount' => '100.00000000',
                'fee' => '0.00500000',
                'icon' => 'fab fa-ethereum',
                'is_active' => true,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'name' => 'Binance Coin',
                'symbol' => 'BNB',
                'min_amount' => '0.10000000',
                'max_amount' => '1000.00000000',
                'fee' => '0.01000000',
                'icon' => 'fas fa-coins',
                'is_active' => true,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]
        ]);
    },
    'down' => function (Builder $schema) {
        // Clear all platforms
        $schema->getConnection()->table('withdrawal_platforms')->delete();
    }
];