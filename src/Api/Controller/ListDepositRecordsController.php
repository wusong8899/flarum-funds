<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Flarum\Query\QueryCriteria;
use Illuminate\Database\Eloquent\Builder;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Funds\Api\Serializer\DepositRecordSerializer;
use wusong8899\Funds\Model\DepositRecord;

class ListDepositRecordsController extends AbstractListController
{
    public $serializer = DepositRecordSerializer::class;

    public $include = [
        'user',
        'processedByUser'
    ];

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);

        // 确保用户已认证
        $actor->assertRegistered();

        $query = DepositRecord::query();

        // 普通用户只能查看自己的记录
        if (!$actor->isAdmin()) {
            $query->where('user_id', $actor->id);
        }

        // 应用过滤器
        $this->applyFilters($query, $request);

        // 默认按创建时间降序排序
        $query->latest();

        // 预加载关联
        $query->with($this->include);

        // 分页
        $limit = $this->extractLimit($request);
        $offset = $this->extractOffset($request);

        return $query->skip($offset)->take($limit + 1)->get();
    }

    protected function applyFilters(Builder $query, ServerRequestInterface $request): void
    {
        $filters = $request->getQueryParams()['filter'] ?? [];

        // 按状态过滤
        if (!empty($filters['status'])) {
            $status = $filters['status'];
            if (in_array($status, SimpleDepositRecord::STATUSES)) {
                $query->where('status', $status);
            }
        }

        // 按用户ID过滤（仅管理员）
        if (!empty($filters['user']) && RequestUtil::getActor($request)->isAdmin()) {
            $query->where('user_id', (int) $filters['user']);
        }

        // 按创建时间范围过滤
        if (!empty($filters['created_after'])) {
            $query->where('created_at', '>=', $filters['created_after']);
        }

        if (!empty($filters['created_before'])) {
            $query->where('created_at', '<=', $filters['created_before']);
        }

        // 搜索地址
        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $query->where(function (Builder $q) use ($search) {
                $q->where('deposit_address', 'like', $search)
                    ->orWhere('user_message', 'like', $search)
                    ->orWhere('admin_notes', 'like', $search);
            });
        }
    }
}
