<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $connection = $schema->getConnection();
        
        // Rename tables to add unified prefix
        // Foreign key constraints will be automatically handled by MySQL
        
        $tablesToRename = [
            // [old_name, new_name]
            ['network_types', 'wusong8899_funds_network_types'],
            ['currency_icons', 'wusong8899_funds_currency_icons'],
            ['withdrawal_platforms', 'wusong8899_funds_withdrawal_platforms'],
            ['deposit_platforms', 'wusong8899_funds_deposit_platforms'],
            ['withdrawal_requests', 'wusong8899_funds_withdrawal_requests'],
            ['deposit_addresses', 'wusong8899_funds_deposit_addresses'],
            ['deposit_records', 'wusong8899_funds_deposit_records'],
            ['wusong8899_deposit_records', 'wusong8899_funds_deposit_records'],
        ];
        
        foreach ($tablesToRename as [$oldName, $newName]) {
            // Check if old table exists and new table doesn't exist
            $oldTableExists = $connection->getSchemaBuilder()->hasTable($oldName);
            $newTableExists = $connection->getSchemaBuilder()->hasTable($newName);
            
            if ($oldTableExists && !$newTableExists) {
                $connection->statement("RENAME TABLE `{$oldName}` TO `{$newName}`");
            }
        }
    },

    'down' => function (Builder $schema) {
        $connection = $schema->getConnection();
        
        // Reverse the table renames
        $tablesToRename = [
            // [new_name, old_name] - reversed from up()
            ['wusong8899_funds_deposit_records', 'wusong8899_deposit_records'],
            ['wusong8899_funds_deposit_records', 'deposit_records'],
            ['wusong8899_funds_deposit_addresses', 'deposit_addresses'],
            ['wusong8899_funds_withdrawal_requests', 'withdrawal_requests'],
            ['wusong8899_funds_deposit_platforms', 'deposit_platforms'],
            ['wusong8899_funds_withdrawal_platforms', 'withdrawal_platforms'],
            ['wusong8899_funds_currency_icons', 'currency_icons'],
            ['wusong8899_funds_network_types', 'network_types'],
        ];
        
        foreach ($tablesToRename as [$newName, $oldName]) {
            // Check if new table exists and old table doesn't exist
            $newTableExists = $connection->getSchemaBuilder()->hasTable($newName);
            $oldTableExists = $connection->getSchemaBuilder()->hasTable($oldName);
            
            if ($newTableExists && !$oldTableExists) {
                $connection->statement("RENAME TABLE `{$newName}` TO `{$oldName}`");
            }
        }
    }
];