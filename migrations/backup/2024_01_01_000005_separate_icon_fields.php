<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->table('withdrawal_platforms', function (Blueprint $table) {
            // Add new separate icon fields
            $table->string('icon_url')->nullable()->after('icon');
            $table->string('icon_class')->nullable()->after('icon_url');
        });

        // Migrate existing icon data to new fields
        $connection = $schema->getConnection();
        $platforms = $connection->table('withdrawal_platforms')->get();
        
        foreach ($platforms as $platform) {
            if ($platform->icon) {
                if (filter_var($platform->icon, FILTER_VALIDATE_URL)) {
                    // It's a URL
                    $connection->table('withdrawal_platforms')
                        ->where('id', $platform->id)
                        ->update(['icon_url' => $platform->icon]);
                } else {
                    // It's a CSS class
                    $connection->table('withdrawal_platforms')
                        ->where('id', $platform->id)
                        ->update(['icon_class' => $platform->icon]);
                }
            }
        }

        // Drop old icon column
        $schema->table('withdrawal_platforms', function (Blueprint $table) {
            $table->dropColumn('icon');
        });
    },
    'down' => function (Builder $schema) {
        $schema->table('withdrawal_platforms', function (Blueprint $table) {
            // Restore original icon column
            $table->string('icon')->nullable()->after('fee');
        });

        // Migrate data back (prefer icon_url over icon_class)
        $connection = $schema->getConnection();
        $platforms = $connection->table('withdrawal_platforms')->get();
        
        foreach ($platforms as $platform) {
            $icon = $platform->icon_url ?: $platform->icon_class;
            if ($icon) {
                $connection->table('withdrawal_platforms')
                    ->where('id', $platform->id)
                    ->update(['icon' => $icon]);
            }
        }

        // Drop new icon fields
        $schema->table('withdrawal_platforms', function (Blueprint $table) {
            $table->dropColumn(['icon_url', 'icon_class']);
        });
    }
];