<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if ($schema->hasTable('wusong8899_funds_deposit_records')) {
            $schema->table('wusong8899_funds_deposit_records', function (Blueprint $table) {
                // Add amount field - the deposit amount entered by user
                $table->decimal('amount', 15, 2)->after('platform_id')->comment('存款金额');
                
                // Add deposit_time field - when the user actually made the deposit
                $table->timestamp('deposit_time')->after('amount')->comment('实际存款时间');
                
                // Add index for amount queries
                $table->index(['amount', 'status']); // 金额和状态组合查询
                $table->index(['deposit_time']); // 存款时间查询
            });
        }
    },

    'down' => function (Builder $schema) {
        if ($schema->hasTable('wusong8899_funds_deposit_records')) {
            $schema->table('wusong8899_funds_deposit_records', function (Blueprint $table) {
                $table->dropColumn(['amount', 'deposit_time']);
            });
        }
    }
];