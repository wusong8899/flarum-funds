<?php

namespace wusong8899\Withdrawal\Model;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WithdrawalPlatform extends AbstractModel
{
    protected $table = 'withdrawal_platforms';

    protected $fillable = ['name'];

    protected $dates = ['created_at', 'updated_at'];

    public function withdrawalRequests(): HasMany
    {
        return $this->hasMany(WithdrawalRequest::class, 'platform_id');
    }
}