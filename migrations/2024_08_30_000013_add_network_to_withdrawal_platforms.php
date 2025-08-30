<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->table('withdrawal_platforms', function (Blueprint $table) {
            // Add optional network field after symbol
            $table->string('network', 50)->nullable()->after('symbol');
        });
    },
    'down' => function (Builder $schema) {
        $schema->table('withdrawal_platforms', function (Blueprint $table) {
            $table->dropColumn('network');
        });
    }
];