<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;

return Migration::createTable('deposit_transactions', function (Blueprint $table) {
    $table->increments('id');
    $table->unsignedInteger('user_id');
    $table->unsignedInteger('platform_id');
    $table->unsignedInteger('address_id')->nullable(); // Reference to deposit address used
    $table->decimal('amount', 20, 8); // Deposit amount
    $table->decimal('fee', 20, 8)->default(0); // Network fee (if applicable)
    $table->decimal('credited_amount', 20, 8)->nullable(); // Amount credited to user (after fees)
    $table->string('transaction_hash')->nullable(); // Blockchain transaction hash
    $table->string('from_address')->nullable(); // Sender's address
    $table->text('memo')->nullable(); // User memo/note
    $table->enum('status', ['pending', 'confirmed', 'completed', 'failed', 'cancelled'])->default('pending');
    $table->json('blockchain_data')->nullable(); // Raw blockchain transaction data
    $table->unsignedInteger('confirmations')->default(0); // Number of confirmations
    $table->unsignedInteger('required_confirmations')->default(1); // Required confirmations
    $table->timestamp('detected_at')->nullable(); // When transaction was first detected
    $table->timestamp('confirmed_at')->nullable(); // When transaction was confirmed
    $table->timestamp('completed_at')->nullable(); // When user balance was updated
    $table->unsignedInteger('processed_by')->nullable(); // Admin who processed (if manual)
    $table->text('admin_notes')->nullable(); // Admin processing notes
    $table->timestamps();

    // Foreign keys
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('platform_id')->references('id')->on('deposit_platforms')->onDelete('cascade');
    $table->foreign('address_id')->references('id')->on('deposit_addresses')->onDelete('set null');
    $table->foreign('processed_by')->references('id')->on('users')->onDelete('set null');
    
    // Indexes for performance
    $table->index(['status']);
    $table->index(['user_id', 'status']);
    $table->index(['transaction_hash']);
    $table->index(['platform_id', 'status']);
    $table->index(['created_at']);
    $table->index(['detected_at']);
    $table->index(['confirmed_at']);
    
    // Unique constraint for transaction hash per platform
    $table->unique(['platform_id', 'transaction_hash']);
});