<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Flarum\Foundation\ValidationException;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Funds\Api\Serializer\DepositRecordSerializer;
use wusong8899\Funds\Model\DepositRecord;

class CreateDepositRecordController extends AbstractCreateController
{
    public $serializer = DepositRecordSerializer::class;

    protected $validation;

    public function __construct(ValidationFactory $validation)
    {
        $this->validation = $validation;
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);

        // 确保用户已认证
        $actor->assertRegistered();

        $attributes = $request->getParsedBody()['data']['attributes'] ?? [];

        // 验证输入数据
        $validator = $this->validation->make($attributes, [
            'platformId' => 'required|integer|exists:wusong8899_funds_deposit_platforms,id',
            'amount' => 'required|numeric|min:0.01',
            'depositTime' => 'required|date',
            'userMessage' => 'nullable|string|max:1000'
        ], [
            'platformId.required' => '平台ID不能为空',
            'platformId.exists' => '指定的平台不存在',
            'amount.required' => '存款金额不能为空',
            'amount.numeric' => '存款金额必须是数字',
            'amount.min' => '存款金额必须大于0.01',
            'depositTime.required' => '存款时间不能为空',
            'depositTime.date' => '存款时间格式不正确',
            'userMessage.max' => '留言不能超过1000个字符'
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors();
            $flattenedErrors = [];
            
            foreach ($errors->toArray() as $field => $messages) {
                foreach ($messages as $message) {
                    $flattenedErrors[] = $message;
                }
            }
            
            throw new ValidationException($flattenedErrors);
        }

        // 检查用户是否有待处理的申请（可选：限制重复申请）
        $pendingCount = DepositRecord::where('user_id', $actor->id)
            ->where('status', DepositRecord::STATUS_PENDING)
            ->count();

        if ($pendingCount >= 3) { // 最多允许3个待处理申请
            throw new ValidationException([
                '您已有多个待处理的存款申请，请等待审核后再提交新申请'
            ]);
        }

        // 创建存款记录
        $depositRecord = DepositRecord::create([
            'user_id' => $actor->id,
            'platform_id' => $attributes['platformId'],
            'amount' => $attributes['amount'],
            'deposit_time' => $attributes['depositTime'],
            'user_message' => $attributes['userMessage'] ?? null,
            'status' => DepositRecord::STATUS_PENDING,
        ]);

        // 加载关联关系
        $depositRecord->load(['user', 'platform']);

        return $depositRecord;
    }
}
