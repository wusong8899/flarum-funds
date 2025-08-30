<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        // Remove QR code template and address template from deposit platforms
        $schema->table('deposit_platforms', function (Blueprint $table) {
            $table->dropColumn(['qr_code_template', 'address_template']);
            $table->string('network')->nullable()->change(); // Make network optional
        });

        // Add message field to withdrawal requests
        $schema->table('withdrawal_requests', function (Blueprint $table) {
            $table->text('message')->nullable()->after('account_details');
        });

        // Add user_message field to deposit transactions  
        $schema->table('deposit_transactions', function (Blueprint $table) {
            $table->text('user_message')->nullable()->after('memo');
        });

        // Add network_type_id to deposit platforms for future reference
        $schema->table('deposit_platforms', function (Blueprint $table) {
            $table->unsignedInteger('network_type_id')->nullable()->after('network');
            $table->index(['network_type_id']);
        });
    },
    'down' => function (Builder $schema) {
        // Restore QR code template and address template to deposit platforms
        $schema->table('deposit_platforms', function (Blueprint $table) {
            $table->string('qr_code_template')->nullable()->after('icon_class');
            $table->text('address_template')->nullable()->after('address');
            $table->string('network')->nullable(false)->change(); // Make network required again
        });

        // Remove message field from withdrawal requests
        $schema->table('withdrawal_requests', function (Blueprint $table) {
            $table->dropColumn('message');
        });

        // Remove user_message field from deposit transactions
        $schema->table('deposit_transactions', function (Blueprint $table) {
            $table->dropColumn('user_message');
        });

        // Remove network_type_id from deposit platforms
        $schema->table('deposit_platforms', function (Blueprint $table) {
            $table->dropIndex(['network_type_id']);
            $table->dropColumn('network_type_id');
        });
    }
];