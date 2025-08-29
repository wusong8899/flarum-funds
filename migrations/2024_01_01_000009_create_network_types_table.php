<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;

return Migration::createTable('network_types', function (Blueprint $table) {
    $table->increments('id');
    $table->string('name'); // Display name (e.g., "TRON (TRC20)")
    $table->string('code')->unique(); // Unique code (e.g., "TRC20")
    $table->text('description')->nullable(); // Optional description
    $table->string('icon_url')->nullable(); // Network icon URL
    $table->string('icon_class')->nullable(); // CSS class for icon
    $table->json('config')->nullable(); // Additional configuration (explorer URLs, etc.)
    $table->boolean('is_active')->default(true);
    $table->unsignedInteger('sort_order')->default(0); // For custom sorting
    $table->timestamps();

    // Indexes for performance
    $table->index(['is_active', 'sort_order']);
    $table->index(['code']);
});