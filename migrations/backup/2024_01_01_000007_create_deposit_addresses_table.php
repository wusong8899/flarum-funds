<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;

return Migration::createTable('deposit_addresses', function (Blueprint $table) {
    $table->increments('id');
    $table->unsignedInteger('user_id');
    $table->unsignedInteger('platform_id');
    $table->string('address'); // Generated deposit address for this user/platform
    $table->string('address_tag')->nullable(); // Memo/Tag for some networks (like XRP, EOS)
    $table->boolean('is_active')->default(true);
    $table->timestamp('last_used_at')->nullable();
    $table->timestamps();

    // Foreign keys
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('platform_id')->references('id')->on('deposit_platforms')->onDelete('cascade');
    
    // Unique constraint: one active address per user per platform
    $table->unique(['user_id', 'platform_id']);
    
    // Indexes for performance
    $table->index(['address']);
    $table->index(['is_active']);
    $table->index(['user_id', 'is_active']);
});