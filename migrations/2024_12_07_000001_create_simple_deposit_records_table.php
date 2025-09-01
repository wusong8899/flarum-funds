<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        // 创建简化的存款记录表
        if (!$schema->hasTable('wusong8899_funds_simple_deposit_records')) {
            $schema->create('wusong8899_funds_simple_deposit_records', function (Blueprint $table) {
                $table->increments('id');
                $table->unsignedInteger('user_id');
                $table->string('deposit_address', 255); // 存款地址
                $table->string('qr_code_url', 500)->nullable(); // 收款二维码URL
                $table->text('user_message')->nullable(); // 用户留言
                $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending'); // 状态
                $table->timestamp('processed_at')->nullable(); // 处理时间
                $table->unsignedInteger('processed_by')->nullable(); // 处理人ID
                $table->text('admin_notes')->nullable(); // 管理员备注
                $table->timestamps();

                // 外键约束
                $table->foreign('user_id')
                    ->references('id')->on('users')
                    ->onDelete('cascade');
                
                $table->foreign('processed_by')
                    ->references('id')->on('users')
                    ->onDelete('set null');

                // 索引
                $table->index(['user_id', 'created_at']); // 用户记录查询
                $table->index(['status', 'created_at']); // 管理员状态查询
                $table->index(['created_at']); // 时间排序
                $table->index(['processed_by']); // 处理人查询
            });
        }
    },

    'down' => function (Builder $schema) {
        $schema->dropIfExists('wusong8899_funds_simple_deposit_records');
    }
];