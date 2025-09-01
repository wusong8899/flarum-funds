<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if ($schema->hasTable('wusong8899_funds_deposit_records')) {
            $schema->table('wusong8899_funds_deposit_records', function (Blueprint $table) {
                // Drop deposit_address and qr_code_url columns
                $table->dropColumn(['deposit_address', 'qr_code_url']);
            });
        }
    },
    'down' => function (Builder $schema) {
        if ($schema->hasTable('wusong8899_funds_deposit_records')) {
            $schema->table('wusong8899_funds_deposit_records', function (Blueprint $table) {
                // Restore columns if needed for rollback
                $table->string('deposit_address', 255)->nullable();
                $table->string('qr_code_url', 500)->nullable();
            });
        }
    },
];