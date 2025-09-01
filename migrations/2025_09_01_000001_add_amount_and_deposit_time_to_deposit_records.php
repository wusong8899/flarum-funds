<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if ($schema->hasTable('wusong8899_funds_deposit_records')) {
            $schema->table('wusong8899_funds_deposit_records', function (Blueprint $table) use ($schema) {
                // Check if amount column doesn't exist before adding
                if (!$schema->hasColumn('wusong8899_funds_deposit_records', 'amount')) {
                    $table->decimal('amount', 15, 2)->after('platform_id')->comment('存款金额');
                }
                
                // Check if deposit_time column doesn't exist before adding
                if (!$schema->hasColumn('wusong8899_funds_deposit_records', 'deposit_time')) {
                    $table->timestamp('deposit_time')->after('amount')->comment('实际存款时间');
                }
                
                // Add indexes only if they don't exist (MySQL will skip if they already exist)
                try {
                    $table->index(['amount', 'status'], 'idx_deposit_amount_status'); // 金额和状态组合查询
                } catch (\Exception $e) {
                    // Index already exists, skip
                }
                
                try {
                    $table->index(['deposit_time'], 'idx_deposit_time'); // 存款时间查询
                } catch (\Exception $e) {
                    // Index already exists, skip
                }
            });
        }
    },

    'down' => function (Builder $schema) {
        if ($schema->hasTable('wusong8899_funds_deposit_records')) {
            $schema->table('wusong8899_funds_deposit_records', function (Blueprint $table) use ($schema) {
                // Only drop columns if they exist
                $columnsToDrop = [];
                
                if ($schema->hasColumn('wusong8899_funds_deposit_records', 'amount')) {
                    $columnsToDrop[] = 'amount';
                }
                
                if ($schema->hasColumn('wusong8899_funds_deposit_records', 'deposit_time')) {
                    $columnsToDrop[] = 'deposit_time';
                }
                
                if (!empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }
    }
];