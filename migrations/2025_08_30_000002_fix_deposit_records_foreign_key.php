<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;

return Migration::schema()
    ->table('wusong8899_deposit_records', function (Blueprint $table) {
        // Add the missing foreign key constraints that failed in the previous migration
        $table->foreign('platform_id')->references('id')->on('deposit_platforms')->onDelete('cascade');
        $table->foreign('processed_by')->references('id')->on('users')->onDelete('set null');
    });