<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->table('withdrawal_platforms', function (Blueprint $table) {
            $table->string('symbol', 10)->nullable()->after('name');
            $table->decimal('min_amount', 20, 8)->default(0.001)->after('symbol');
            $table->decimal('max_amount', 20, 8)->default(10.0)->after('min_amount');
            $table->decimal('fee', 20, 8)->default(0.0005)->after('max_amount');
            $table->string('icon')->nullable()->after('fee');
            $table->boolean('is_active')->default(true)->after('icon');
        });
    },
    'down' => function (Builder $schema) {
        $schema->table('withdrawal_platforms', function (Blueprint $table) {
            $table->dropColumn([
                'symbol',
                'min_amount', 
                'max_amount',
                'fee',
                'icon',
                'is_active'
            ]);
        });
    }
];