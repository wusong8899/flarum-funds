<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Flarum\User\Exception\PermissionDeniedException;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\DepositRecordSerializer;
use wusong8899\Withdrawal\Model\DepositRecord;
use Illuminate\Database\Eloquent\Builder;

class ListDepositRecordsController extends AbstractListController
{
    public $serializer = DepositRecordSerializer::class;

    public $include = [
        'user',
        'platform',
        'processedByUser'
    ];

    public $optionalInclude = [
        'user',
        'platform',
        'processedByUser'
    ];

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);

        // Check permissions
        if (!$actor->exists) {
            throw new PermissionDeniedException();
        }

        $query = DepositRecord::query()
            ->with(['user', 'platform', 'processedBy']);

        // Admin can see all records, users can only see their own
        if (!$actor->hasPermission('wusong8899-withdrawal.manageDepositRecords')) {
            $query->where('user_id', $actor->id);
        }

        // Apply filters
        $this->applyFilters($query, $request);

        // Apply sorting
        $this->applySorting($query, $request);

        // Apply pagination
        $limit = $this->extractLimit($request);
        $offset = $this->extractOffset($request);

        $records = $query->skip($offset)->take($limit + 1)->get();

        $hasMoreResults = $records->count() > $limit;
        if ($hasMoreResults) {
            $records->pop();
        }

        $document->addPaginationLinks(
            $request->getUri()->withQuery(''),
            $request->getQueryParams(),
            $offset,
            $limit,
            $hasMoreResults
        );

        return $records;
    }

    private function applyFilters(Builder $query, ServerRequestInterface $request): void
    {
        $filter = $request->getQueryParams()['filter'] ?? [];

        if (isset($filter['status'])) {
            $query->where('status', $filter['status']);
        }

        if (isset($filter['platform_id'])) {
            $query->where('platform_id', (int) $filter['platform_id']);
        }

        if (isset($filter['user_id'])) {
            $query->where('user_id', (int) $filter['user_id']);
        }

        // Date range filters
        if (isset($filter['from'])) {
            $query->where('created_at', '>=', $filter['from']);
        }

        if (isset($filter['to'])) {
            $query->where('created_at', '<=', $filter['to']);
        }
    }

    private function applySorting(Builder $query, ServerRequestInterface $request): void
    {
        $sort = $request->getQueryParams()['sort'] ?? '-created_at';

        $sortFields = explode(',', $sort);

        foreach ($sortFields as $field) {
            $direction = 'asc';

            if (str_starts_with($field, '-')) {
                $direction = 'desc';
                $field = substr($field, 1);
            }

            // Allowed sort fields
            $allowedFields = [
                'id', 'amount', 'status', 'created_at', 'updated_at',
                'deposit_time', 'processed_at'
            ];

            if (in_array($field, $allowedFields)) {
                $query->orderBy($field, $direction);
            }
        }
    }
}
