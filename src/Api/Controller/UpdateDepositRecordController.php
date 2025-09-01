<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Controller;

use Illuminate\Support\Arr;
use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Flarum\User\User;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Validation\ValidationException;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Funds\Api\Serializer\DepositRecordSerializer;
use wusong8899\Funds\Model\DepositRecord;

class UpdateDepositRecordController extends AbstractShowController
{
    public $serializer = DepositRecordSerializer::class;

    public $include = [
        'user',
        'processedByUser'
    ];

    protected $validation;
    protected $db;

    public function __construct(ValidationFactory $validation, ConnectionInterface $db)
    {
        $this->validation = $validation;
        $this->db = $db;
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $id = Arr::get($request->getQueryParams(), 'id');

        $depositRecord = DepositRecord::findOrFail($id);

        // 权限检查：管理员可以更新任何记录，用户只能更新自己待处理的记录
        if (!$actor->isAdmin() && ($depositRecord->user_id !== $actor->id || !$depositRecord->isPending())) {
            $actor->assertCan('update', $depositRecord);
        }

        $attributes = $request->getParsedBody()['data']['attributes'] ?? [];

        // 管理员更新（审核操作）
        if ($actor->isAdmin() && isset($attributes['status'])) {
            $this->processAdminUpdate($depositRecord, $attributes, $actor->id);
        }
        // 用户更新（仅限待处理的记录）
        elseif ($depositRecord->user_id === $actor->id && $depositRecord->isPending()) {
            $this->processUserUpdate($depositRecord, $attributes);
        } else {
            throw new \RuntimeException('无权限修改此记录');
        }

        $depositRecord->load($this->include);

        return $depositRecord;
    }

    protected function processAdminUpdate(DepositRecord $record, array $attributes, int $adminId): void
    {
        $validator = $this->validation->make($attributes, [
            'status' => 'required|in:' . implode(',', DepositRecord::STATUSES),
            'creditedAmount' => 'nullable|numeric|min:0.01',
            'adminNotes' => 'nullable|string|max:1000'
        ], [
            'status.required' => '状态不能为空',
            'status.in' => '状态值无效',
            'creditedAmount.numeric' => '充值金额必须是数字',
            'creditedAmount.min' => '充值金额必须大于0.01',
            'adminNotes.max' => '管理员备注不能超过1000个字符'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $status = $attributes['status'];
        $adminNotes = $attributes['adminNotes'] ?? null;
        $creditedAmount = $attributes['creditedAmount'] ?? $record->amount;

        switch ($status) {
            case DepositRecord::STATUS_APPROVED:
                $this->approveAndCreditMoney($record, $adminId, $adminNotes, (float) $creditedAmount);
                break;
            case DepositRecord::STATUS_REJECTED:
                $record->reject($adminId, $adminNotes);
                break;
            default:
                $record->status = $status;
                if ($adminNotes) {
                    $record->admin_notes = $adminNotes;
                }
                break;
        }

        $record->save();
    }

    /**
     * 批准存款记录并为用户充值
     */
    private function approveAndCreditMoney(DepositRecord $record, int $adminId, ?string $adminNotes, float $creditedAmount): void
    {
        $this->db->transaction(function () use ($record, $adminId, $adminNotes, $creditedAmount) {
            // 锁定用户记录防止并发问题
            $user = User::where('id', $record->user_id)->lockForUpdate()->first();

            if (!$user) {
                throw new \RuntimeException('用户不存在');
            }

            // 给用户充值
            $user->money = ($user->money ?? 0) + $creditedAmount;
            $user->save();

            // 批准存款记录
            $record->approve($adminId, $adminNotes);
            $record->save();
        });
    }

    protected function processUserUpdate(DepositRecord $record, array $attributes): void
    {
        $validator = $this->validation->make($attributes, [
            'userMessage' => 'nullable|string|max:1000'
        ], [
            'userMessage.max' => '留言不能超过1000个字符'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // 只更新允许用户修改的字段
        if (array_key_exists('userMessage', $attributes)) {
            $record->user_message = $attributes['userMessage'];
        }

        $record->save();
    }
}
