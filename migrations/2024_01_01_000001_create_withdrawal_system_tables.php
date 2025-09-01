<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        // Create wusong8899_funds_withdrawal_platforms table
        if (!$schema->hasTable('wusong8899_funds_withdrawal_platforms')) {
            $schema->create('wusong8899_funds_withdrawal_platforms', function (Blueprint $table) {
                $table->increments('id');
                $table->string('name');
                $table->string('symbol')->nullable(); // Currency symbol
                $table->string('network')->nullable(); // Optional network (TRC20, ERC20, etc.)
                $table->decimal('min_amount', 20, 8)->default(0);
                $table->decimal('max_amount', 20, 8)->nullable();
                $table->decimal('fee', 10, 8)->default(0); // Withdrawal fee
                $table->string('icon_url')->nullable();
                $table->string('icon_class')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                // Indexes
                $table->index(['is_active']);
                $table->index(['symbol']);
            });
        }

        // Create wusong8899_funds_network_types table (needed before deposit_platforms due to foreign key)
        if (!$schema->hasTable('wusong8899_funds_network_types')) {
            $schema->create('wusong8899_funds_network_types', function (Blueprint $table) {
                $table->increments('id');
                $table->string('name'); // e.g., "TRON (TRC20)"
                $table->string('code'); // e.g., "TRC20"
                $table->text('description')->nullable();
                $table->string('icon_url')->nullable();
                $table->string('icon_class')->nullable();
                $table->integer('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                // Unique constraint
                $table->unique(['code']);
                
                // Indexes
                $table->index(['is_active', 'sort_order']);
            });
        }

        // Create wusong8899_funds_withdrawal_requests table
        if (!$schema->hasTable('wusong8899_funds_withdrawal_requests')) {
            $schema->create('wusong8899_funds_withdrawal_requests', function (Blueprint $table) {
                $table->increments('id');
                $table->unsignedInteger('user_id');
                $table->unsignedInteger('platform_id');
                $table->decimal('amount', 20, 8);
                $table->text('account_details'); // User's account details (address, account info)
                $table->text('message')->nullable(); // Optional message from user
                $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
                $table->timestamp('approved_at')->nullable();
                $table->unsignedInteger('approved_by')->nullable();
                $table->timestamps();

                // Foreign keys
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('platform_id')->references('id')->on('wusong8899_funds_withdrawal_platforms')->onDelete('cascade');
                $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');

                // Indexes
                $table->index(['user_id', 'status']);
                $table->index(['platform_id']);
                $table->index(['status']);
            });
        }

        // Create wusong8899_funds_deposit_platforms table
        if (!$schema->hasTable('wusong8899_funds_deposit_platforms')) {
            $schema->create('wusong8899_funds_deposit_platforms', function (Blueprint $table) {
                $table->increments('id');
                $table->string('name'); // Platform name
                $table->string('symbol'); // Currency symbol
                $table->string('network')->nullable(); // Network type
                $table->unsignedInteger('network_type_id')->nullable(); // Foreign key to network_types
                $table->decimal('min_amount', 20, 8)->default(0);
                $table->decimal('max_amount', 20, 8)->nullable();
                $table->decimal('fee', 10, 8)->default(0); // Deposit fee
                $table->string('address')->nullable(); // Deposit address
                $table->string('qr_code_image_url', 500)->nullable(); // QR code image URL
                $table->string('icon_url')->nullable();
                $table->string('icon_class')->nullable();
                $table->text('warning_text')->nullable();
                $table->json('network_config')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                // Foreign keys
                $table->foreign('network_type_id')->references('id')->on('wusong8899_funds_network_types')->onDelete('set null');

                // Unique constraint
                $table->unique(['symbol', 'network']);
                
                // Indexes
                $table->index(['is_active']);
                $table->index(['symbol']);
                $table->index(['network']);
            });
        }

        // Create wusong8899_funds_deposit_addresses table
        if (!$schema->hasTable('wusong8899_funds_deposit_addresses')) {
            $schema->create('wusong8899_funds_deposit_addresses', function (Blueprint $table) {
                $table->increments('id');
                $table->unsignedInteger('user_id');
                $table->unsignedInteger('platform_id');
                $table->string('address');
                $table->timestamps();

                // Foreign keys
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('platform_id')->references('id')->on('wusong8899_funds_deposit_platforms')->onDelete('cascade');

                // Unique constraint
                $table->unique(['user_id', 'platform_id']);
                
                // Indexes
                $table->index(['user_id']);
                $table->index(['platform_id']);
            });
        }

    },

    'down' => function (Builder $schema) {
        // Drop tables in reverse order due to foreign key dependencies
        $schema->dropIfExists('wusong8899_funds_deposit_addresses');
        $schema->dropIfExists('wusong8899_funds_deposit_platforms');
        $schema->dropIfExists('wusong8899_funds_withdrawal_requests');
        $schema->dropIfExists('wusong8899_funds_network_types');
        $schema->dropIfExists('wusong8899_funds_withdrawal_platforms');
    }
];