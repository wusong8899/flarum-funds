<?php

namespace wusong8899\Withdrawal\Model;

use Flarum\Database\AbstractModel;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WithdrawalRequest extends AbstractModel
{
    protected $table = 'withdrawal_requests';

    protected $fillable = [
        'user_id',
        'platform_id', 
        'amount',
        'account_details',
        'status'
    ];

    protected $dates = ['created_at', 'updated_at'];

    protected $casts = [
        'amount' => 'decimal:2',
        'user_id' => 'integer',
        'platform_id' => 'integer'
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

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