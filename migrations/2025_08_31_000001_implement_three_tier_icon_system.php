<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        // 1. Create wusong8899_funds_currency_icons table
        if (!$schema->hasTable('wusong8899_funds_currency_icons')) {
            $schema->create('wusong8899_funds_currency_icons', function (Blueprint $table) {
                $table->increments('id');
                $table->string('currency_symbol', 10)->unique(); // USDT, BTC, ETH
                $table->string('currency_name', 100); // Tether, Bitcoin, Ethereum
                $table->string('currency_icon_url', 500)->nullable();
                $table->string('currency_icon_class', 100)->nullable();
                $table->string('currency_unicode_symbol', 10)->nullable(); // ₮, ₿, Ξ
                $table->integer('display_priority')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                // Indexes
                $table->index(['is_active', 'display_priority']);
                $table->index(['currency_symbol']);
            });
        }

        // 2. Update wusong8899_funds_network_types table - rename icon fields for clarity
        if ($schema->hasTable('wusong8899_funds_network_types')) {
            $schema->table('wusong8899_funds_network_types', function (Blueprint $table) use ($schema) {
                // Rename existing icon fields to be network-specific
                if ($schema->hasColumn('wusong8899_funds_network_types', 'icon_url')) {
                    $table->renameColumn('icon_url', 'network_icon_url');
                }
                if ($schema->hasColumn('wusong8899_funds_network_types', 'icon_class')) {
                    $table->renameColumn('icon_class', 'network_icon_class');
                }
            });
        }

        // 3. Update wusong8899_funds_deposit_platforms table - remove old fields and add explicit ones
        if ($schema->hasTable('wusong8899_funds_deposit_platforms')) {
            $schema->table('wusong8899_funds_deposit_platforms', function (Blueprint $table) use ($schema) {
                // Remove old generic icon fields
                if ($schema->hasColumn('wusong8899_funds_deposit_platforms', 'icon_url')) {
                    $table->dropColumn('icon_url');
                }
                if ($schema->hasColumn('wusong8899_funds_deposit_platforms', 'icon_class')) {
                    $table->dropColumn('icon_class');
                }

                // Add explicit three-tier icon fields
                $table->string('currency_icon_override_url', 500)->nullable();
                $table->string('currency_icon_override_class', 100)->nullable();
                $table->string('network_icon_override_url', 500)->nullable();
                $table->string('network_icon_override_class', 100)->nullable();
                $table->string('platform_specific_icon_url', 500)->nullable();
                $table->string('platform_specific_icon_class', 100)->nullable();
            });
        }

        // 4. Update wusong8899_funds_withdrawal_platforms table - same changes
        if ($schema->hasTable('wusong8899_funds_withdrawal_platforms')) {
            $schema->table('wusong8899_funds_withdrawal_platforms', function (Blueprint $table) use ($schema) {
                // Remove old generic icon fields
                if ($schema->hasColumn('wusong8899_funds_withdrawal_platforms', 'icon_url')) {
                    $table->dropColumn('icon_url');
                }
                if ($schema->hasColumn('wusong8899_funds_withdrawal_platforms', 'icon_class')) {
                    $table->dropColumn('icon_class');
                }

                // Add explicit three-tier icon fields
                $table->string('currency_icon_override_url', 500)->nullable();
                $table->string('currency_icon_override_class', 100)->nullable();
                $table->string('network_icon_override_url', 500)->nullable();
                $table->string('network_icon_override_class', 100)->nullable();
                $table->string('platform_specific_icon_url', 500)->nullable();
                $table->string('platform_specific_icon_class', 100)->nullable();
            });
        }
    },

    'down' => function (Builder $schema) {
        // Drop wusong8899_funds_currency_icons table
        $schema->dropIfExists('wusong8899_funds_currency_icons');

        // Revert wusong8899_funds_network_types table
        if ($schema->hasTable('wusong8899_funds_network_types')) {
            $schema->table('wusong8899_funds_network_types', function (Blueprint $table) use ($schema) {
                if ($schema->hasColumn('wusong8899_funds_network_types', 'network_icon_url')) {
                    $table->renameColumn('network_icon_url', 'icon_url');
                }
                if ($schema->hasColumn('wusong8899_funds_network_types', 'network_icon_class')) {
                    $table->renameColumn('network_icon_class', 'icon_class');
                }
            });
        }

        // Revert wusong8899_funds_deposit_platforms table
        if ($schema->hasTable('wusong8899_funds_deposit_platforms')) {
            $schema->table('wusong8899_funds_deposit_platforms', function (Blueprint $table) use ($schema) {
                // Remove new fields
                $table->dropColumn([
                    'currency_icon_override_url',
                    'currency_icon_override_class',
                    'network_icon_override_url',
                    'network_icon_override_class',
                    'platform_specific_icon_url',
                    'platform_specific_icon_class'
                ]);

                // Restore old fields
                $table->string('icon_url')->nullable();
                $table->string('icon_class')->nullable();
            });
        }

        // Revert wusong8899_funds_withdrawal_platforms table
        if ($schema->hasTable('wusong8899_funds_withdrawal_platforms')) {
            $schema->table('wusong8899_funds_withdrawal_platforms', function (Blueprint $table) use ($schema) {
                // Remove new fields
                $table->dropColumn([
                    'currency_icon_override_url',
                    'currency_icon_override_class',
                    'network_icon_override_url',
                    'network_icon_override_class',
                    'platform_specific_icon_url',
                    'platform_specific_icon_class'
                ]);

                // Restore old fields
                $table->string('icon_url')->nullable();
                $table->string('icon_class')->nullable();
            });
        }
    }
];