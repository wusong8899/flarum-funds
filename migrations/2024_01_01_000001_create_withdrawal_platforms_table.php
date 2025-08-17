<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;

return Migration::createTable(
    'withdrawal_platforms',
    function (Blueprint $table) {
        $table->increments('id');
        $table->string('name');
        $table->timestamps();
    }
);