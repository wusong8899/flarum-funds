<?php

namespace wusong8899\Withdrawal\Model;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WithdrawalPlatform extends AbstractModel
{
    protected $table = 'withdrawal_platforms';

    protected $fillable = [
        'name',
        'symbol',
        'min_amount',
        'max_amount',
        'fee',
        'icon',
        'is_active'
    ];

    protected $casts = [
        'min_amount' => 'decimal:8',
        'max_amount' => 'decimal:8',
        'fee' => 'decimal:8',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function withdrawalRequests(): HasMany
    {
        return $this->hasMany(WithdrawalRequest::class, 'platform_id');
    }
}