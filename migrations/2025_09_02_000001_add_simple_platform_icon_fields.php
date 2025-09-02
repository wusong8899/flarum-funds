<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        // Add simple platform icon fields for both withdrawal and deposit platforms
        // These provide an easier way to configure icons compared to the three-tier system
        
        if ($schema->hasTable('wusong8899_funds_withdrawal_platforms')) {
            $schema->table('wusong8899_funds_withdrawal_platforms', function (Blueprint $table) {
                // Add simple platform icon configuration fields
                // These have highest priority in the icon resolution system
                $table->string('platform_icon_url', 500)->nullable()->comment('Simple platform icon URL (highest priority)');
                $table->string('platform_icon_class', 100)->nullable()->comment('Simple platform icon CSS class (URL fallback)');
            });
        }
        
        if ($schema->hasTable('wusong8899_funds_deposit_platforms')) {
            $schema->table('wusong8899_funds_deposit_platforms', function (Blueprint $table) {
                // Add simple platform icon configuration fields
                // These have highest priority in the icon resolution system
                $table->string('platform_icon_url', 500)->nullable()->comment('Simple platform icon URL (highest priority)');
                $table->string('platform_icon_class', 100)->nullable()->comment('Simple platform icon CSS class (URL fallback)');
            });
        }
    },

    'down' => function (Builder $schema) {
        // Remove the simple icon fields
        if ($schema->hasTable('wusong8899_funds_withdrawal_platforms')) {
            $schema->table('wusong8899_funds_withdrawal_platforms', function (Blueprint $table) {
                $table->dropColumn(['platform_icon_url', 'platform_icon_class']);
            });
        }
        
        if ($schema->hasTable('wusong8899_funds_deposit_platforms')) {
            $schema->table('wusong8899_funds_deposit_platforms', function (Blueprint $table) {
                $table->dropColumn(['platform_icon_url', 'platform_icon_class']);
            });
        }
    }
];