<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;

return Migration::addColumns('deposit_platforms', [
    'qr_code_image_url' => ['string', 'length' => 500, 'nullable' => true, 'after' => 'qr_code_template']
]);