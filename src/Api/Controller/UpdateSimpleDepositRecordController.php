<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Illuminate\Validation\ValidationException;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\SimpleDepositRecordSerializer;
use wusong8899\Withdrawal\Model\SimpleDepositRecord;

class UpdateSimpleDepositRecordController extends AbstractShowController
{
    public $serializer = SimpleDepositRecordSerializer::class;

    public $include = [
        'user',
        'processedByUser'
    ];

    protected $validation;

    public function __construct(ValidationFactory $validation)
    {
        $this->validation = $validation;
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $id = array_get($request->getQueryParams(), 'id');

        $depositRecord = SimpleDepositRecord::findOrFail($id);

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

    protected function processAdminUpdate(SimpleDepositRecord $record, array $attributes, int $adminId): void
    {
        $validator = $this->validation->make($attributes, [
            'status' => 'required|in:' . implode(',', SimpleDepositRecord::STATUSES),
            'adminNotes' => 'nullable|string|max:1000'
        ], [
            'status.required' => '状态不能为空',
            'status.in' => '状态值无效',
            'adminNotes.max' => '管理员备注不能超过1000个字符'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $status = $attributes['status'];
        $adminNotes = $attributes['adminNotes'] ?? null;

        switch ($status) {
            case SimpleDepositRecord::STATUS_APPROVED:
                $record->approve($adminId, $adminNotes);
                break;
            case SimpleDepositRecord::STATUS_REJECTED:
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

    protected function processUserUpdate(SimpleDepositRecord $record, array $attributes): void
    {
        $validator = $this->validation->make($attributes, [
            'depositAddress' => 'sometimes|required|string|max:255',
            'qrCodeUrl' => 'nullable|url|max:500',
            'userMessage' => 'nullable|string|max:1000'
        ], [
            'depositAddress.required' => '存款地址不能为空',
            'depositAddress.max' => '存款地址不能超过255个字符',
            'qrCodeUrl.url' => '二维码链接格式不正确',
            'qrCodeUrl.max' => '二维码链接不能超过500个字符',
            'userMessage.max' => '留言不能超过1000个字符'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // 只更新允许用户修改的字段
        if (isset($attributes['depositAddress'])) {
            $record->deposit_address = $attributes['depositAddress'];
        }
        if (array_key_exists('qrCodeUrl', $attributes)) {
            $record->qr_code_url = $attributes['qrCodeUrl'];
        }
        if (array_key_exists('userMessage', $attributes)) {
            $record->user_message = $attributes['userMessage'];
        }

        $record->save();
    }
}
