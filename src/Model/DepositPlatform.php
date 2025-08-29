<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Model;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $symbol
 * @property string $network
 * @property float $min_amount
 * @property float|null $max_amount
 * @property string|null $address
 * @property string|null $address_template
 * @property string|null $icon_url
 * @property string|null $icon_class
 * @property string|null $qr_code_template
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
        'min_amount',
        'max_amount',
        'address',
        'address_template',
        'icon_url',
        'icon_class',
        'qr_code_template',
        'warning_text',
        'network_config',
        'is_active'
    ];

    protected $casts = [
        'min_amount' => 'decimal:8',
        'max_amount' => 'decimal:8',
        'network_config' => 'json',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function depositAddresses(): HasMany
    {
        return $this->hasMany(DepositAddress::class, 'platform_id');
    }

    public function depositTransactions(): HasMany
    {
        return $this->hasMany(DepositTransaction::class, 'platform_id');
    }

    /**
     * Get the display name for the platform (currency + network)
     */
    public function getDisplayNameAttribute(): string
    {
        return "{$this->symbol} ({$this->network})";
    }

    /**
     * Generate a deposit address for a specific user
     */
    public function generateDepositAddress(int $userId): string
    {
        if ($this->address) {
            // Use shared address
            return $this->address;
        }

        if ($this->address_template) {
            // Generate user-specific address using template
            return str_replace('{user_id}', (string) $userId, $this->address_template);
        }

        // Fallback - this should be configured properly
        throw new \InvalidArgumentException("No address or address template configured for platform {$this->id}");
    }

    /**
     * Get QR code data for deposit
     */
    public function getQrCodeData(string $address, ?float $amount = null): string
    {
        if ($this->qr_code_template) {
            $data = str_replace('{address}', $address, $this->qr_code_template);
            if ($amount) {
                $data = str_replace('{amount}', (string) $amount, $data);
            }
            return $data;
        }

        // Default to just the address
        return $address;
    }
}