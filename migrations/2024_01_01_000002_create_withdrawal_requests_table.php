<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;

return Migration::createTable(
    'withdrawal_requests',
    function (Blueprint $table) {
        $table->increments('id');
        $table->unsignedInteger('user_id');
        $table->unsignedInteger('platform_id');
        $table->decimal('amount', 10, 2);
        $table->text('account_details');
        $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
        $table->timestamps();

        $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        $table->foreign('platform_id')->references('id')->on('withdrawal_platforms')->onDelete('cascade');
        
        $table->index(['user_id', 'status']);
        $table->index('created_at');
    }
);