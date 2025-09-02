<?php

declare(strict_types=1);

namespace wusong8899\Funds\Model;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $name
 * @property string|null $symbol
 * @property string|null $network
 * @property float $min_amount
 * @property float $max_amount
 * @property float $fee
 * @property string|null $platform_icon_url
 * @property string|null $platform_icon_class
 * @property bool $is_active
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class WithdrawalPlatform extends AbstractModel
{
    protected $table = 'wusong8899_funds_withdrawal_platforms';

    public $timestamps = true;

    protected $fillable = [
        'name',
        'symbol',
        'network',
        'min_amount',
        'max_amount',
        'fee',
        'platform_icon_url',
        'platform_icon_class',
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

    /**
     * Get the display name for the platform (symbol + network)
     */
    public function getDisplayNameAttribute(): string
    {
        $display = $this->symbol ?: $this->name;

        if ($this->network) {
            $display .= " ({$this->network})";
        }

        return $display;
    }

    /**
     * Get platform icon URL
     */
    public function getPlatformIconUrl(): ?string
    {
        return $this->platform_icon_url;
    }

    /**
     * Get platform icon CSS class
     */
    public function getPlatformIconClass(): ?string
    {
        return $this->platform_icon_class;
    }

    /**
     * Get the best available icon for display
     */
    public function getBestIcon(): array
    {
        if ($this->platform_icon_url) {
            return [
                'type' => 'url',
                'value' => $this->platform_icon_url,
                'alt' => $this->name
            ];
        }

        if ($this->platform_icon_class) {
            return [
                'type' => 'class',
                'value' => $this->platform_icon_class
            ];
        }

        // Fallback
        return [
            'type' => 'class',
            'value' => 'fas fa-coins'
        ];
    }
}
