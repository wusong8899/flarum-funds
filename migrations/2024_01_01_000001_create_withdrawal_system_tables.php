<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;

return Migration::createTableIfNotExists('withdrawal_platforms', function (Blueprint $table) {
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
})
->createTableIfNotExists('withdrawal_requests', function (Blueprint $table) {
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
    $table->foreign('platform_id')->references('id')->on('withdrawal_platforms')->onDelete('cascade');
    $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');

    // Indexes
    $table->index(['user_id', 'status']);
    $table->index(['platform_id']);
    $table->index(['status']);
})
->createTableIfNotExists('network_types', function (Blueprint $table) {
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
})
->createTableIfNotExists('deposit_platforms', function (Blueprint $table) {
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
    $table->foreign('network_type_id')->references('id')->on('network_types')->onDelete('set null');

    // Unique constraint
    $table->unique(['symbol', 'network']);
    
    // Indexes
    $table->index(['is_active']);
    $table->index(['symbol']);
    $table->index(['network']);
})
->createTableIfNotExists('deposit_addresses', function (Blueprint $table) {
    $table->increments('id');
    $table->unsignedInteger('user_id');
    $table->unsignedInteger('platform_id');
    $table->string('address');
    $table->timestamps();

    // Foreign keys
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('platform_id')->references('id')->on('deposit_platforms')->onDelete('cascade');

    // Unique constraint
    $table->unique(['user_id', 'platform_id']);
    
    // Indexes
    $table->index(['user_id']);
    $table->index(['platform_id']);
})
->createTableIfNotExists('deposit_transactions', function (Blueprint $table) {
    $table->increments('id');
    $table->unsignedInteger('user_id');
    $table->unsignedInteger('platform_id');
    $table->string('tx_hash')->nullable(); // Transaction hash
    $table->decimal('amount', 20, 8);
    $table->decimal('fee', 20, 8)->default(0); // Transaction fee
    $table->string('from_address')->nullable();
    $table->string('to_address')->nullable();
    $table->enum('status', ['pending', 'confirmed', 'completed', 'failed', 'cancelled'])->default('pending');
    $table->integer('confirmations')->default(0);
    $table->text('notes')->nullable();
    $table->timestamp('processed_at')->nullable();
    $table->timestamps();

    // Foreign keys
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('platform_id')->references('id')->on('deposit_platforms')->onDelete('cascade');

    // Indexes
    $table->index(['user_id', 'status']);
    $table->index(['platform_id']);
    $table->index(['status']);
    $table->index(['tx_hash']);
});