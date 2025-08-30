<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Model;

use Flarum\Database\AbstractModel;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $platform_id
 * @property string $address
 * @property string|null $address_tag
 * @property bool $is_active
 * @property \Carbon\Carbon|null $last_used_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property User $user
 * @property DepositPlatform $platform
 */
class DepositAddress extends AbstractModel
{
    protected $table = 'deposit_addresses';

    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'platform_id',
        'address',
        'address_tag',
        'is_active',
        'last_used_at'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function platform(): BelongsTo
    {
        return $this->belongsTo(DepositPlatform::class);
    }


    /**
     * Update the last used timestamp
     */
    public function markAsUsed(): void
    {
        $this->update(['last_used_at' => Carbon::now()]);
    }

    /**
     * Get full address display (address + tag if needed)
     */
    public function getFullAddressAttribute(): string
    {
        if ($this->address_tag) {
            return "{$this->address} (Tag: {$this->address_tag})";
        }

        return $this->address;
    }
}
