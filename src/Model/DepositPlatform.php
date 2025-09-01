<?php

declare(strict_types=1);

namespace wusong8899\Funds\Model;

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
    protected $table = 'wusong8899_funds_deposit_platforms';

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
        'currency_icon_override_url',
        'currency_icon_override_class',
        'network_icon_override_url',
        'network_icon_override_class',
        'platform_specific_icon_url',
        'platform_specific_icon_class',
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

    public function currencyIcon(): BelongsTo
    {
        return $this->belongsTo(CurrencyIcon::class, 'symbol', 'currency_symbol');
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

    // ============ Three-Tier Icon System Methods ============

    /**
     * Get currency icon URL with platform override support
     * Priority: platform override → currency default
     */
    public function getCurrencyIconUrl(): ?string
    {
        return $this->currency_icon_override_url
            ?: $this->currencyIcon?->getCurrencyIconUrl();
    }

    /**
     * Get currency icon CSS class with platform override support
     * Priority: platform override → currency default
     */
    public function getCurrencyIconClass(): ?string
    {
        return $this->currency_icon_override_class
            ?: $this->currencyIcon?->getCurrencyIconClass();
    }

    /**
     * Get currency Unicode symbol
     */
    public function getCurrencyUnicodeSymbol(): ?string
    {
        return $this->currencyIcon?->getCurrencyUnicodeSymbol();
    }

    /**
     * Get network icon URL with platform override support
     * Priority: platform override → network default
     */
    public function getNetworkIconUrl(): ?string
    {
        return $this->network_icon_override_url
            ?: $this->networkType?->network_icon_url;
    }

    /**
     * Get network icon CSS class with platform override support
     * Priority: platform override → network default
     */
    public function getNetworkIconClass(): ?string
    {
        return $this->network_icon_override_class
            ?: $this->networkType?->network_icon_class;
    }

    /**
     * Get platform-specific icon URL
     */
    public function getPlatformSpecificIconUrl(): ?string
    {
        return $this->platform_specific_icon_url;
    }

    /**
     * Get platform-specific icon CSS class
     */
    public function getPlatformSpecificIconClass(): ?string
    {
        return $this->platform_specific_icon_class;
    }

    /**
     * Get the best available icon for display
     * Priority: Platform-specific → Network → Currency
     */
    public function getBestIcon(): array
    {
        // Platform-specific icons have highest priority
        if ($this->platform_specific_icon_url) {
            return [
                'type' => 'platform_url',
                'value' => $this->platform_specific_icon_url,
                'alt' => $this->name
            ];
        }

        if ($this->platform_specific_icon_class) {
            return [
                'type' => 'platform_class',
                'value' => $this->platform_specific_icon_class
            ];
        }

        // Network icons second priority
        if ($this->getNetworkIconUrl()) {
            return [
                'type' => 'network_url',
                'value' => $this->getNetworkIconUrl(),
                'alt' => $this->network ?: 'Network'
            ];
        }

        if ($this->getNetworkIconClass()) {
            return [
                'type' => 'network_class',
                'value' => $this->getNetworkIconClass()
            ];
        }

        // Currency icons lowest priority (but most common)
        if ($this->getCurrencyIconUrl()) {
            return [
                'type' => 'currency_url',
                'value' => $this->getCurrencyIconUrl(),
                'alt' => $this->symbol
            ];
        }

        if ($this->getCurrencyIconClass()) {
            return [
                'type' => 'currency_class',
                'value' => $this->getCurrencyIconClass()
            ];
        }

        // Unicode symbol fallback
        if ($this->getCurrencyUnicodeSymbol()) {
            return [
                'type' => 'currency_unicode',
                'value' => $this->getCurrencyUnicodeSymbol()
            ];
        }

        // Final fallback
        return [
            'type' => 'fallback',
            'value' => 'fas fa-coins'
        ];
    }

    /**
     * Get currency icon specifically (for currency display contexts)
     */
    public function getCurrencyIcon(): array
    {
        if ($this->getCurrencyIconUrl()) {
            return [
                'type' => 'currency_url',
                'value' => $this->getCurrencyIconUrl(),
                'alt' => $this->symbol
            ];
        }

        if ($this->getCurrencyIconClass()) {
            return [
                'type' => 'currency_class',
                'value' => $this->getCurrencyIconClass()
            ];
        }

        if ($this->getCurrencyUnicodeSymbol()) {
            return [
                'type' => 'currency_unicode',
                'value' => $this->getCurrencyUnicodeSymbol()
            ];
        }

        return [
            'type' => 'fallback',
            'value' => 'fas fa-coins'
        ];
    }

    /**
     * Get network icon specifically (for network display contexts)
     */
    public function getNetworkIcon(): ?array
    {
        if ($this->getNetworkIconUrl()) {
            return [
                'type' => 'network_url',
                'value' => $this->getNetworkIconUrl(),
                'alt' => $this->network ?: 'Network'
            ];
        }

        if ($this->getNetworkIconClass()) {
            return [
                'type' => 'network_class',
                'value' => $this->getNetworkIconClass()
            ];
        }

        return null; // No network icon available
    }
}
