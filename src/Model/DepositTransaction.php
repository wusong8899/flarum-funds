<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Model;

use Flarum\Database\AbstractModel;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property int $platform_id
 * @property int|null $address_id
 * @property float $amount
 * @property float $fee
 * @property float|null $credited_amount
 * @property string|null $transaction_hash
 * @property string|null $from_address
 * @property string|null $memo
 * @property string|null $user_message
 * @property string $status
 * @property array|null $blockchain_data
 * @property int $confirmations
 * @property int $required_confirmations
 * @property \Carbon\Carbon|null $detected_at
 * @property \Carbon\Carbon|null $confirmed_at
 * @property \Carbon\Carbon|null $completed_at
 * @property int|null $processed_by
 * @property string|null $admin_notes
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property User $user
 * @property DepositPlatform $platform
 * @property DepositAddress|null $depositAddress
 * @property User|null $processedBy
 */
class DepositTransaction extends AbstractModel
{
    protected $table = 'deposit_transactions';

    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'platform_id',
        'address_id',
        'amount',
        'fee',
        'credited_amount',
        'transaction_hash',
        'from_address',
        'memo',
        'user_message',
        'status',
        'blockchain_data',
        'confirmations',
        'required_confirmations',
        'detected_at',
        'confirmed_at',
        'completed_at',
        'processed_by',
        'admin_notes'
    ];

    protected $casts = [
        'amount' => 'decimal:8',
        'fee' => 'decimal:8',
        'credited_amount' => 'decimal:8',
        'blockchain_data' => 'json',
        'confirmations' => 'integer',
        'required_confirmations' => 'integer',
        'detected_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Status constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';
    public const STATUS_CANCELLED = 'cancelled';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function platform(): BelongsTo
    {
        return $this->belongsTo(DepositPlatform::class);
    }

    public function depositAddress(): BelongsTo
    {
        return $this->belongsTo(DepositAddress::class, 'address_id');
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Check if transaction has enough confirmations
     */
    public function hasEnoughConfirmations(): bool
    {
        return $this->confirmations >= $this->required_confirmations;
    }

    /**
     * Check if transaction can be completed (credited to user)
     */
    public function canBeCompleted(): bool
    {
        return $this->status === self::STATUS_CONFIRMED && 
               $this->hasEnoughConfirmations() && 
               $this->credited_amount > 0;
    }

    /**
     * Mark transaction as detected
     */
    public function markAsDetected(): void
    {
        $this->update([
            'status' => self::STATUS_PENDING,
            'detected_at' => now()
        ]);
    }

    /**
     * Mark transaction as confirmed
     */
    public function markAsConfirmed(): void
    {
        $this->update([
            'status' => self::STATUS_CONFIRMED,
            'confirmed_at' => now()
        ]);
    }

    /**
     * Complete the transaction and credit user balance
     */
    public function complete(User $processedBy = null): void
    {
        if (!$this->canBeCompleted()) {
            throw new \InvalidArgumentException('Transaction cannot be completed');
        }

        $user = $this->user;
        $creditAmount = $this->credited_amount ?? $this->amount;

        // Update user balance
        $user->money = ($user->money ?? 0) + $creditAmount;
        $user->save();

        // Mark transaction as completed
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'completed_at' => now(),
            'processed_by' => $processedBy?->id
        ]);
    }

    /**
     * Get status badge color
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_PENDING => 'warning',
            self::STATUS_CONFIRMED => 'info',
            self::STATUS_COMPLETED => 'success',
            self::STATUS_FAILED => 'danger',
            self::STATUS_CANCELLED => 'secondary',
            default => 'secondary'
        };
    }

    /**
     * Get explorer URL for the transaction
     */
    public function getExplorerUrl(): ?string
    {
        if (!$this->transaction_hash) {
            return null;
        }

        $config = $this->platform->network_config ?? [];
        $explorerUrl = $config['explorer_url'] ?? null;

        if (!$explorerUrl) {
            return null;
        }

        return str_replace('{hash}', $this->transaction_hash, $explorerUrl);
    }
}