<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Model;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string|null $symbol
 * @property float $min_amount
 * @property float $max_amount
 * @property float $fee
 * @property string|null $icon_url
 * @property string|null $icon_class
 * @property bool $is_active
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class WithdrawalPlatform extends AbstractModel
{
    protected $table = 'withdrawal_platforms';

    public $timestamps = true;

    protected $fillable = [
        'name',
        'symbol',
        'min_amount',
        'max_amount',
        'fee',
        'icon_url',
        'icon_class',
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
