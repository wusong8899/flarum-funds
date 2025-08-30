<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Model;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $code
 * @property string|null $description
 * @property string|null $icon_url
 * @property string|null $icon_class
 * @property array|null $config
 * @property bool $is_active
 * @property int $sort_order
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class NetworkType extends AbstractModel
{
    protected $table = 'network_types';

    public $timestamps = true;

    protected $fillable = [
        'name',
        'code',
        'description',
        'icon_url',
        'icon_class',
        'config',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'config' => 'json',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function depositPlatforms(): HasMany
    {
        return $this->hasMany(DepositPlatform::class, 'network_type_id');
    }

    /**
     * Get active network types ordered by sort_order
     */
    public static function getActive()
    {
        return static::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    /**
     * Get explorer URL for a transaction hash
     */
    public function getExplorerUrl(?string $hash): ?string
    {
        if (!$hash || !$this->config) {
            return null;
        }

        $explorerUrl = $this->config['explorer_url'] ?? null;
        if (!$explorerUrl) {
            return null;
        }

        return str_replace('{hash}', $hash, $explorerUrl);
    }

    /**
     * Get required confirmations for this network
     */
    public function getRequiredConfirmations(): int
    {
        return $this->config['required_confirmations'] ?? 1;
    }

    /**
     * Get address format regex pattern
     */
    public function getAddressFormat(): ?string
    {
        return $this->config['address_format'] ?? null;
    }

    /**
     * Validate address format for this network
     */
    public function isValidAddress(string $address): bool
    {
        $format = $this->getAddressFormat();
        if (!$format) {
            return true; // No validation available
        }

        return (bool) preg_match('/^' . $format . '$/', $address);
    }
}
