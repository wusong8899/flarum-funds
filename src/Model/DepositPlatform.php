<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Model;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $name
 * @property string $symbol
 * @property string|null $network
 * @property int|null $network_type_id
 * @property float $min_amount
 * @property float|null $max_amount
 * @property float $fee
 * @property string|null $address
 * @property string|null $qr_code_image_url
 * @property string|null $icon_url
 * @property string|null $icon_class
 * @property string|null $warning_text
 * @property array|null $network_config
 * @property bool $is_active
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class DepositPlatform extends AbstractModel
{
    protected $table = 'deposit_platforms';

    public $timestamps = true;

    protected $fillable = [
        'name',
        'symbol',
        'network',
        'network_type_id',
        'min_amount',
        'max_amount',
        'fee',
        'address',
        'qr_code_image_url',
        'icon_url',
        'icon_class',
        'warning_text',
        'network_config',
        'is_active'
    ];

    protected $casts = [
        'network_type_id' => 'integer',
        'min_amount' => 'decimal:8',
        'max_amount' => 'decimal:8',
        'fee' => 'decimal:8',
        'network_config' => 'json',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function networkType(): BelongsTo
    {
        return $this->belongsTo(NetworkType::class, 'network_type_id');
    }

    /**
     * Get the display name for the platform (currency + network)
     */
    public function getDisplayNameAttribute(): string
    {
        $network = $this->network ?: ($this->networkType ? $this->networkType->name : 'Unknown');
        return "{$this->symbol}" . ($network ? " ({$network})" : '');
    }

    /**
     * Get deposit address (simplified - no templates)
     */
    public function getDepositAddress(): ?string
    {
        return $this->address;
    }

}
