<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;

return Migration::createTable('deposit_platforms', function (Blueprint $table) {
    $table->increments('id');
    $table->string('name'); // Platform name (e.g., "USDT")
    $table->string('symbol'); // Currency symbol (e.g., "USDT")
    $table->string('network'); // Network type (e.g., "TRC20", "ERC20", "BSC")
    $table->decimal('min_amount', 20, 8)->default(0); // Minimum deposit amount
    $table->decimal('max_amount', 20, 8)->nullable(); // Maximum deposit amount (null = unlimited)
    $table->string('address')->nullable(); // Platform deposit address (shared or template)
    $table->text('address_template')->nullable(); // Template for generating user-specific addresses
    $table->string('icon_url')->nullable(); // Currency icon URL
    $table->string('icon_class')->nullable(); // CSS class for icon
    $table->string('qr_code_template')->nullable(); // QR code data template
    $table->text('warning_text')->nullable(); // Network-specific warning text
    $table->json('network_config')->nullable(); // Additional network configuration
    $table->boolean('is_active')->default(true);
    $table->timestamps();

    // Unique constraint for currency-network combination
    $table->unique(['symbol', 'network']);
    
    // Indexes for performance
    $table->index(['is_active']);
    $table->index(['symbol']);
    $table->index(['network']);
});