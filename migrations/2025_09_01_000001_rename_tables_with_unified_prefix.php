<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        // Rename tables to use unified wusong8899_funds_ prefix
        // Order is important due to foreign key constraints
        
        // First, rename tables without foreign key dependencies
        if ($schema->hasTable('network_types') && !$schema->hasTable('wusong8899_funds_network_types')) {
            $schema->rename('network_types', 'wusong8899_funds_network_types');
        }
        
        if ($schema->hasTable('currency_icons') && !$schema->hasTable('wusong8899_funds_currency_icons')) {
            $schema->rename('currency_icons', 'wusong8899_funds_currency_icons');
        }
        
        // Rename platform tables (they reference network_types)
        if ($schema->hasTable('withdrawal_platforms') && !$schema->hasTable('wusong8899_funds_withdrawal_platforms')) {
            $schema->rename('withdrawal_platforms', 'wusong8899_funds_withdrawal_platforms');
        }
        
        if ($schema->hasTable('deposit_platforms') && !$schema->hasTable('wusong8899_funds_deposit_platforms')) {
            $schema->rename('deposit_platforms', 'wusong8899_funds_deposit_platforms');
        }
        
        // Rename request/transaction tables (they reference platform tables)
        if ($schema->hasTable('withdrawal_requests') && !$schema->hasTable('wusong8899_funds_withdrawal_requests')) {
            $schema->rename('withdrawal_requests', 'wusong8899_funds_withdrawal_requests');
        }
        
        if ($schema->hasTable('deposit_addresses') && !$schema->hasTable('wusong8899_funds_deposit_addresses')) {
            $schema->rename('deposit_addresses', 'wusong8899_funds_deposit_addresses');
        }
        
        // Rename deposit record tables
        if ($schema->hasTable('simple_deposit_records') && !$schema->hasTable('wusong8899_funds_simple_deposit_records')) {
            $schema->rename('simple_deposit_records', 'wusong8899_funds_simple_deposit_records');
        }
        
        // Rename existing wusong8899_deposit_records to match new pattern
        if ($schema->hasTable('wusong8899_deposit_records') && !$schema->hasTable('wusong8899_funds_deposit_records')) {
            $schema->rename('wusong8899_deposit_records', 'wusong8899_funds_deposit_records');
        }
        
        // Update foreign key constraints to reference new table names
        // This is necessary because foreign keys may still point to old table names
        
        // Update withdrawal_requests foreign keys
        if ($schema->hasTable('wusong8899_funds_withdrawal_requests')) {
            $schema->table('wusong8899_funds_withdrawal_requests', function (Blueprint $table) use ($schema) {
                // Drop existing foreign keys
                if ($schema->hasColumn('wusong8899_funds_withdrawal_requests', 'platform_id')) {
                    try {
                        $table->dropForeign(['platform_id']);
                    } catch (\Exception $e) {
                        // Foreign key might not exist or have different name
                    }
                }
                
                // Recreate foreign key with new table reference
                $table->foreign('platform_id')
                      ->references('id')
                      ->on('wusong8899_funds_withdrawal_platforms')
                      ->onDelete('cascade');
            });
        }
        
        // Update deposit_platforms foreign keys
        if ($schema->hasTable('wusong8899_funds_deposit_platforms')) {
            $schema->table('wusong8899_funds_deposit_platforms', function (Blueprint $table) use ($schema) {
                // Drop existing foreign keys
                if ($schema->hasColumn('wusong8899_funds_deposit_platforms', 'network_type_id')) {
                    try {
                        $table->dropForeign(['network_type_id']);
                    } catch (\Exception $e) {
                        // Foreign key might not exist or have different name
                    }
                }
                
                // Recreate foreign key with new table reference
                $table->foreign('network_type_id')
                      ->references('id')
                      ->on('wusong8899_funds_network_types')
                      ->onDelete('set null');
            });
        }
        
        // Update deposit_addresses foreign keys
        if ($schema->hasTable('wusong8899_funds_deposit_addresses')) {
            $schema->table('wusong8899_funds_deposit_addresses', function (Blueprint $table) use ($schema) {
                // Drop existing foreign keys
                if ($schema->hasColumn('wusong8899_funds_deposit_addresses', 'platform_id')) {
                    try {
                        $table->dropForeign(['platform_id']);
                    } catch (\Exception $e) {
                        // Foreign key might not exist or have different name
                    }
                }
                
                // Recreate foreign key with new table reference
                $table->foreign('platform_id')
                      ->references('id')
                      ->on('wusong8899_funds_deposit_platforms')
                      ->onDelete('cascade');
            });
        }
        
        // Update deposit_records foreign keys
        if ($schema->hasTable('wusong8899_funds_deposit_records')) {
            $schema->table('wusong8899_funds_deposit_records', function (Blueprint $table) use ($schema) {
                // Drop existing foreign keys
                if ($schema->hasColumn('wusong8899_funds_deposit_records', 'platform_id')) {
                    try {
                        $table->dropForeign(['platform_id']);
                    } catch (\Exception $e) {
                        // Foreign key might not exist or have different name
                    }
                }
                
                // Recreate foreign key with new table reference
                $table->foreign('platform_id')
                      ->references('id')
                      ->on('wusong8899_funds_deposit_platforms')
                      ->onDelete('cascade');
            });
        }
    },

    'down' => function (Builder $schema) {
        // Rollback: rename tables back to original names
        // Order is reverse of 'up' due to foreign key constraints
        
        // First, update foreign keys back to original table names
        
        // Update withdrawal_requests foreign keys
        if ($schema->hasTable('wusong8899_funds_withdrawal_requests')) {
            $schema->table('wusong8899_funds_withdrawal_requests', function (Blueprint $table) use ($schema) {
                try {
                    $table->dropForeign(['platform_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist
                }
                
                $table->foreign('platform_id')
                      ->references('id')
                      ->on('withdrawal_platforms')
                      ->onDelete('cascade');
            });
        }
        
        // Update deposit_platforms foreign keys
        if ($schema->hasTable('wusong8899_funds_deposit_platforms')) {
            $schema->table('wusong8899_funds_deposit_platforms', function (Blueprint $table) use ($schema) {
                try {
                    $table->dropForeign(['network_type_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist
                }
                
                $table->foreign('network_type_id')
                      ->references('id')
                      ->on('network_types')
                      ->onDelete('set null');
            });
        }
        
        // Update deposit_addresses foreign keys
        if ($schema->hasTable('wusong8899_funds_deposit_addresses')) {
            $schema->table('wusong8899_funds_deposit_addresses', function (Blueprint $table) use ($schema) {
                try {
                    $table->dropForeign(['platform_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist
                }
                
                $table->foreign('platform_id')
                      ->references('id')
                      ->on('deposit_platforms')
                      ->onDelete('cascade');
            });
        }
        
        // Update deposit_records foreign keys
        if ($schema->hasTable('wusong8899_funds_deposit_records')) {
            $schema->table('wusong8899_funds_deposit_records', function (Blueprint $table) use ($schema) {
                try {
                    $table->dropForeign(['platform_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist
                }
                
                $table->foreign('platform_id')
                      ->references('id')
                      ->on('deposit_platforms')
                      ->onDelete('cascade');
            });
        }
        
        // Now rename tables back to original names
        
        // Rename deposit record tables
        if ($schema->hasTable('wusong8899_funds_deposit_records') && !$schema->hasTable('wusong8899_deposit_records')) {
            $schema->rename('wusong8899_funds_deposit_records', 'wusong8899_deposit_records');
        }
        
        if ($schema->hasTable('wusong8899_funds_simple_deposit_records') && !$schema->hasTable('simple_deposit_records')) {
            $schema->rename('wusong8899_funds_simple_deposit_records', 'simple_deposit_records');
        }
        
        // Rename request/transaction tables
        if ($schema->hasTable('wusong8899_funds_deposit_addresses') && !$schema->hasTable('deposit_addresses')) {
            $schema->rename('wusong8899_funds_deposit_addresses', 'deposit_addresses');
        }
        
        if ($schema->hasTable('wusong8899_funds_withdrawal_requests') && !$schema->hasTable('withdrawal_requests')) {
            $schema->rename('wusong8899_funds_withdrawal_requests', 'withdrawal_requests');
        }
        
        // Rename platform tables
        if ($schema->hasTable('wusong8899_funds_deposit_platforms') && !$schema->hasTable('deposit_platforms')) {
            $schema->rename('wusong8899_funds_deposit_platforms', 'deposit_platforms');
        }
        
        if ($schema->hasTable('wusong8899_funds_withdrawal_platforms') && !$schema->hasTable('withdrawal_platforms')) {
            $schema->rename('wusong8899_funds_withdrawal_platforms', 'withdrawal_platforms');
        }
        
        // Rename network types table
        if ($schema->hasTable('wusong8899_funds_network_types') && !$schema->hasTable('network_types')) {
            $schema->rename('wusong8899_funds_network_types', 'network_types');
        }
        
        if ($schema->hasTable('wusong8899_funds_currency_icons') && !$schema->hasTable('currency_icons')) {
            $schema->rename('wusong8899_funds_currency_icons', 'currency_icons');
        }
    }
];