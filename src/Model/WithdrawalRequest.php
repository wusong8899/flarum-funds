<?php

declare(strict_types=1);

namespace wusong8899\Funds\Model;

use Flarum\Database\AbstractModel;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property int $platform_id
 * @property float $amount
 * @property string $account_details
 * @property string|null $message
 * @property string $status
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property-read User $user
 * @property-read WithdrawalPlatform $platform
 */
class WithdrawalRequest extends AbstractModel
{
    protected $table = 'wusong8899_funds_withdrawal_requests';

    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'platform_id',
        'amount',
        'account_details',
        'message',
        'status'
    ];

    protected $casts = [
        'amount' => 'decimal:8',
        'user_id' => 'integer',
        'platform_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function platform(): BelongsTo
    {
        return $this->belongsTo(WithdrawalPlatform::class, 'platform_id');
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    public function approve(): void
    {
        $this->status = self::STATUS_APPROVED;
    }

    public function reject(): void
    {
        $this->status = self::STATUS_REJECTED;
    }
}
