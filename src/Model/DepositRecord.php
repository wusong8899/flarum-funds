<?php

declare(strict_types=1);

namespace wusong8899\Funds\Model;

use Flarum\Database\AbstractModel;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;
use wusong8899\Funds\Model\DepositPlatform;

/**
 * DepositRecord Model
 *
 * @property int $id
 * @property int $user_id
 * @property int $platform_id
 * @property string $platform_account
 * @property string|null $real_name
 * @property float $amount
 * @property Carbon $deposit_time
 * @property string|null $screenshot_url
 * @property string|null $user_message
 * @property string $status
 * @property Carbon|null $processed_at
 * @property int|null $processed_by
 * @property string|null $admin_notes
 * @property float|null $credited_amount
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @property User $user
 * @property DepositPlatform $platform
 * @property User|null $processedBy
 */
class DepositRecord extends AbstractModel
{
    protected $table = 'wusong8899_funds_deposit_records';

    protected $fillable = [
        'user_id',
        'platform_id',
        'platform_account',
        'real_name',
        'amount',
        'deposit_time',
        'screenshot_url',
        'user_message',
        'status',
        'processed_at',
        'processed_by',
        'admin_notes',
        'credited_amount',
    ];

    protected $casts = [
        'amount' => 'decimal:8',
        'credited_amount' => 'decimal:8',
        'deposit_time' => 'datetime',
        'processed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Status constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    public static function getStatuses(): array
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_APPROVED,
            self::STATUS_REJECTED,
        ];
    }

    /**
     * Get the user who submitted this deposit record
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the deposit platform this record belongs to
     */
    public function platform(): BelongsTo
    {
        return $this->belongsTo(DepositPlatform::class, 'platform_id');
    }

    /**
     * Get the admin who processed this record
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Approve this deposit record
     */
    public function approve(User $admin, ?float $creditedAmount = null, ?string $notes = null): void
    {
        $this->status = self::STATUS_APPROVED;
        $this->processed_at = Carbon::now();
        $this->processed_by = $admin->id;
        $this->credited_amount = $creditedAmount ?? $this->amount;

        if ($notes) {
            $this->admin_notes = $notes;
        }

        $this->save();
    }

    /**
     * Reject this deposit record
     */
    public function reject(User $admin, string $reason): void
    {
        $this->status = self::STATUS_REJECTED;
        $this->processed_at = Carbon::now();
        $this->processed_by = $admin->id;
        $this->admin_notes = $reason;

        $this->save();
    }

    /**
     * Check if record is pending
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if record is approved
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if record is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }
}
