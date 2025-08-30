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

        // Clear existing platforms - no default data will be inserted
        // Platforms should be configured through the admin panel
        $schema->getConnection()->table('withdrawal_platforms')->delete();
    },
    'down' => function (Builder $schema) {
        // Clear all platforms
        $schema->getConnection()->table('withdrawal_platforms')->delete();
    }
];