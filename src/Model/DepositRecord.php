<?php

declare(strict_types=1);

namespace wusong8899\Funds\Model;

use Carbon\Carbon;
use Flarum\Database\AbstractModel;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 存款记录模型
 *
 * @property int $id
 * @property int $user_id
 * @property string $deposit_address 存款地址
 * @property string|null $qr_code_url 收款二维码URL
 * @property string|null $user_message 用户留言
 * @property string $status 状态: pending, approved, rejected
 * @property \Carbon\Carbon|null $processed_at 处理时间
 * @property int|null $processed_by 处理人ID
 * @property string|null $admin_notes 管理员备注
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property-read User $user
 * @property-read User|null $processedByUser
 */
class DepositRecord extends AbstractModel
{
    // Note: Table name retains 'simple' for backward compatibility with existing migrations
    protected $table = 'wusong8899_funds_simple_deposit_records';

    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'deposit_address',
        'qr_code_url',
        'user_message',
        'status',
        'processed_at',
        'processed_by',
        'admin_notes'
    ];

    protected $casts = [
        'user_id' => 'integer',
        'processed_by' => 'integer',
        'processed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // 状态常量
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_APPROVED,
        self::STATUS_REJECTED
    ];

    /**
     * 关联用户
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 关联处理人
     */
    public function processedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * 检查是否为待处理状态
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * 检查是否已批准
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * 检查是否已拒绝
     */
    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * 批准记录
     */
    public function approve(?int $processedBy = null, ?string $adminNotes = null): void
    {
        $this->status = self::STATUS_APPROVED;
        $this->processed_at = Carbon::now();
        $this->processed_by = $processedBy;
        if ($adminNotes) {
            $this->admin_notes = $adminNotes;
        }
    }

    /**
     * 拒绝记录
     */
    public function reject(?int $processedBy = null, ?string $adminNotes = null): void
    {
        $this->status = self::STATUS_REJECTED;
        $this->processed_at = Carbon::now();
        $this->processed_by = $processedBy;
        if ($adminNotes) {
            $this->admin_notes = $adminNotes;
        }
    }

    /**
     * 获取状态文本
     */
    public function getStatusText(): string
    {
        switch ($this->status) {
            case self::STATUS_PENDING:
                return '待处理';
            case self::STATUS_APPROVED:
                return '已批准';
            case self::STATUS_REJECTED:
                return '已拒绝';
            default:
                return '未知';
        }
    }

    /**
     * 获取格式化的创建时间
     */
    public function getFormattedCreatedAt(): string
    {
        return $this->created_at->format('Y-m-d H:i:s');
    }

    /**
     * 获取格式化的处理时间
     */
    public function getFormattedProcessedAt(): ?string
    {
        return $this->processed_at?->format('Y-m-d H:i:s');
    }

    /**
     * 作用域：仅获取待处理的记录
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * 作用域：仅获取已批准的记录
     */
    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    /**
     * 作用域：仅获取已拒绝的记录
     */
    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    /**
     * 作用域：按创建时间降序排序
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * 作用域：获取指定用户的记录
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
