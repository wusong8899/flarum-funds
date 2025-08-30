<?php

use Flarum\Database\Migration;

return Migration::addColumns('deposit_platforms', [
    'fee' => ['decimal', 'precision' => 10, 'scale' => 8, 'default' => 0, 'after' => 'max_amount']
]);