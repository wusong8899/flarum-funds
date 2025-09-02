<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        // 1. Drop the currency_icons table entirely
        $schema->dropIfExists('wusong8899_funds_currency_icons');

        // 2. Simplify withdrawal_platforms table - remove all icon override fields, rename platform_specific to simple icon
        if ($schema->hasTable('wusong8899_funds_withdrawal_platforms')) {
            $schema->table('wusong8899_funds_withdrawal_platforms', function (Blueprint $table) use ($schema) {
                // Drop all override icon fields
                if ($schema->hasColumn('wusong8899_funds_withdrawal_platforms', 'currency_icon_override_url')) {
                    $table->dropColumn('currency_icon_override_url');
                }
                if ($schema->hasColumn('wusong8899_funds_withdrawal_platforms', 'currency_icon_override_class')) {
                    $table->dropColumn('currency_icon_override_class');
                }
                if ($schema->hasColumn('wusong8899_funds_withdrawal_platforms', 'network_icon_override_url')) {
                    $table->dropColumn('network_icon_override_url');
                }
                if ($schema->hasColumn('wusong8899_funds_withdrawal_platforms', 'network_icon_override_class')) {
                    $table->dropColumn('network_icon_override_class');
                }
            });

            // Rename platform_specific_* to platform_icon_*
            $schema->table('wusong8899_funds_withdrawal_platforms', function (Blueprint $table) use ($schema) {
                if ($schema->hasColumn('wusong8899_funds_withdrawal_platforms', 'platform_specific_icon_url')) {
                    $table->renameColumn('platform_specific_icon_url', 'platform_icon_url');
                }
                if ($schema->hasColumn('wusong8899_funds_withdrawal_platforms', 'platform_specific_icon_class')) {
                    $table->renameColumn('platform_specific_icon_class', 'platform_icon_class');
                }
            });
        }

        // 3. Simplify deposit_platforms table - same changes
        if ($schema->hasTable('wusong8899_funds_deposit_platforms')) {
            $schema->table('wusong8899_funds_deposit_platforms', function (Blueprint $table) use ($schema) {
                // Drop all override icon fields
                if ($schema->hasColumn('wusong8899_funds_deposit_platforms', 'currency_icon_override_url')) {
                    $table->dropColumn('currency_icon_override_url');
                }
                if ($schema->hasColumn('wusong8899_funds_deposit_platforms', 'currency_icon_override_class')) {
                    $table->dropColumn('currency_icon_override_class');
                }
                if ($schema->hasColumn('wusong8899_funds_deposit_platforms', 'network_icon_override_url')) {
                    $table->dropColumn('network_icon_override_url');
                }
                if ($schema->hasColumn('wusong8899_funds_deposit_platforms', 'network_icon_override_class')) {
                    $table->dropColumn('network_icon_override_class');
                }
            });

            // Rename platform_specific_* to platform_icon_*
            $schema->table('wusong8899_funds_deposit_platforms', function (Blueprint $table) use ($schema) {
                if ($schema->hasColumn('wusong8899_funds_deposit_platforms', 'platform_specific_icon_url')) {
                    $table->renameColumn('platform_specific_icon_url', 'platform_icon_url');
                }
                if ($schema->hasColumn('wusong8899_funds_deposit_platforms', 'platform_specific_icon_class')) {
                    $table->renameColumn('platform_specific_icon_class', 'platform_icon_class');
                }
            });
        }
    },

    'down' => function (Builder $schema) {
        // Recreate currency_icons table
        if (!$schema->hasTable('wusong8899_funds_currency_icons')) {
            $schema->create('wusong8899_funds_currency_icons', function (Blueprint $table) {
                $table->increments('id');
                $table->string('currency_symbol', 10)->unique();
                $table->string('currency_name', 100);
                $table->string('currency_icon_url', 500)->nullable();
                $table->string('currency_icon_class', 100)->nullable();
                $table->string('currency_unicode_symbol', 10)->nullable();
                $table->integer('display_priority')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->index(['is_active', 'display_priority']);
                $table->index(['currency_symbol']);
            });
        }

        // Revert withdrawal_platforms table
        if ($schema->hasTable('wusong8899_funds_withdrawal_platforms')) {
            // Rename platform_icon_* back to platform_specific_*
            $schema->table('wusong8899_funds_withdrawal_platforms', function (Blueprint $table) use ($schema) {
                if ($schema->hasColumn('wusong8899_funds_withdrawal_platforms', 'platform_icon_url')) {
                    $table->renameColumn('platform_icon_url', 'platform_specific_icon_url');
                }
                if ($schema->hasColumn('wusong8899_funds_withdrawal_platforms', 'platform_icon_class')) {
                    $table->renameColumn('platform_icon_class', 'platform_specific_icon_class');
                }
            });

            // Add back all override icon fields
            $schema->table('wusong8899_funds_withdrawal_platforms', function (Blueprint $table) {
                $table->string('currency_icon_override_url', 500)->nullable();
                $table->string('currency_icon_override_class', 100)->nullable();
                $table->string('network_icon_override_url', 500)->nullable();
                $table->string('network_icon_override_class', 100)->nullable();
            });
        }

        // Revert deposit_platforms table
        if ($schema->hasTable('wusong8899_funds_deposit_platforms')) {
            // Rename platform_icon_* back to platform_specific_*
            $schema->table('wusong8899_funds_deposit_platforms', function (Blueprint $table) use ($schema) {
                if ($schema->hasColumn('wusong8899_funds_deposit_platforms', 'platform_icon_url')) {
                    $table->renameColumn('platform_icon_url', 'platform_specific_icon_url');
                }
                if ($schema->hasColumn('wusong8899_funds_deposit_platforms', 'platform_icon_class')) {
                    $table->renameColumn('platform_icon_class', 'platform_specific_icon_class');
                }
            });

            // Add back all override icon fields
            $schema->table('wusong8899_funds_deposit_platforms', function (Blueprint $table) {
                $table->string('currency_icon_override_url', 500)->nullable();
                $table->string('currency_icon_override_class', 100)->nullable();
                $table->string('network_icon_override_url', 500)->nullable();
                $table->string('network_icon_override_class', 100)->nullable();
            });
        }
    }
];