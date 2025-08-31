<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Model;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $currency_symbol
 * @property string $currency_name
 * @property string|null $currency_icon_url
 * @property string|null $currency_icon_class
 * @property string|null $currency_unicode_symbol
 * @property int $display_priority
 * @property bool $is_active
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class CurrencyIcon extends AbstractModel
{
    protected $table = 'currency_icons';

    public $timestamps = true;

    protected $fillable = [
        'currency_symbol',
        'currency_name',
        'currency_icon_url',
        'currency_icon_class',
        'currency_unicode_symbol',
        'display_priority',
        'is_active'
    ];

    protected $casts = [
        'display_priority' => 'integer',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the currency icon URL
     */
    public function getCurrencyIconUrl(): ?string
    {
        return $this->currency_icon_url;
    }

    /**
     * Get the currency icon CSS class
     */
    public function getCurrencyIconClass(): ?string
    {
        return $this->currency_icon_class;
    }

    /**
     * Get the currency Unicode symbol
     */
    public function getCurrencyUnicodeSymbol(): ?string
    {
        return $this->currency_unicode_symbol;
    }

    /**
     * Get the best available icon representation
     * Priority: URL > CSS Class > Unicode Symbol
     */
    public function getBestIcon(): array
    {
        if ($this->currency_icon_url) {
            return [
                'type' => 'url',
                'value' => $this->currency_icon_url,
                'alt' => $this->currency_name
            ];
        }

        if ($this->currency_icon_class) {
            return [
                'type' => 'class',
                'value' => $this->currency_icon_class
            ];
        }

        if ($this->currency_unicode_symbol) {
            return [
                'type' => 'unicode',
                'value' => $this->currency_unicode_symbol
            ];
        }

        return [
            'type' => 'class',
            'value' => 'fas fa-coins' // Fallback
        ];
    }

    /**
     * Get platforms using this currency (deposit)
     */
    public function depositPlatforms(): HasMany
    {
        return $this->hasMany(DepositPlatform::class, 'symbol', 'currency_symbol');
    }

    /**
     * Get platforms using this currency (withdrawal)
     */
    public function withdrawalPlatforms(): HasMany
    {
        return $this->hasMany(WithdrawalPlatform::class, 'symbol', 'currency_symbol');
    }

    /**
     * Get active currency icons ordered by priority
     */
    public static function getActive()
    {
        return static::where('is_active', true)
            ->orderBy('display_priority', 'desc')
            ->orderBy('currency_symbol')
            ->get();
    }

    /**
     * Find currency icon by symbol
     */
    public static function findBySymbol(string $symbol): ?self
    {
        return static::where('currency_symbol', strtoupper($symbol))->first();
    }

    /**
     * Get or create currency icon for symbol
     */
    public static function getOrCreateForSymbol(string $symbol, string $name = null): self
    {
        $currency = static::findBySymbol($symbol);

        if (!$currency) {
            $currency = new static();
            $currency->currency_symbol = strtoupper($symbol);
            $currency->currency_name = $name ?: ucfirst(strtolower($symbol));
            $currency->currency_icon_class = 'fas fa-coins';
            $currency->display_priority = 0;
            $currency->is_active = true;
            $currency->save();
        }

        return $currency;
    }

    /**
     * Update icon information
     */
    public function updateIcon(
        ?string $iconUrl = null,
        ?string $iconClass = null,
        ?string $unicodeSymbol = null
    ): self {
        if ($iconUrl !== null) {
            $this->currency_icon_url = $iconUrl;
        }

        if ($iconClass !== null) {
            $this->currency_icon_class = $iconClass;
        }

        if ($unicodeSymbol !== null) {
            $this->currency_unicode_symbol = $unicodeSymbol;
        }

        $this->save();

        return $this;
    }
}