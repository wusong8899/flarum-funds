<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;

return Migration::createTable(
    'wusong8899_deposit_records',
    function (Blueprint $table) {
        $table->increments('id');
        $table->unsignedInteger('user_id');
        $table->unsignedInteger('platform_id');
        
        // Submission Data
        $table->string('platform_account')->comment('User account on deposit platform');
        $table->string('real_name', 255)->nullable()->comment('Optional real name verification');
        $table->decimal('amount', 20, 8)->comment('Deposit amount');
        $table->timestamp('deposit_time')->comment('When deposit was made externally');
        $table->string('screenshot_url', 500)->nullable()->comment('Optional screenshot proof');
        $table->text('user_message')->nullable()->comment('Optional user message');
        
        // Processing Data
        $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
        $table->timestamp('processed_at')->nullable()->comment('When admin processed the record');
        $table->unsignedInteger('processed_by')->nullable()->comment('Admin who processed');
        $table->text('admin_notes')->nullable()->comment('Admin notes or rejection reason');
        $table->decimal('credited_amount', 20, 8)->nullable()->comment('Amount actually credited to user');
        
        $table->timestamps();
        
        // Foreign key constraints
        $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        $table->foreign('platform_id')->references('id')->on('deposit_platforms')->onDelete('cascade');
        $table->foreign('processed_by')->references('id')->on('users')->onDelete('set null');
        
        // Indexes for performance
        $table->index(['user_id', 'status']);
        $table->index(['platform_id']);
        $table->index(['status']);
        $table->index(['processed_at']);
        $table->index(['created_at']);
    }
);