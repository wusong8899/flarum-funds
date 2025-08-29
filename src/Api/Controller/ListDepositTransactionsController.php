<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Flarum\Query\QueryCriteria;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\DepositTransactionSerializer;
use wusong8899\Withdrawal\Model\DepositTransaction;

class ListDepositTransactionsController extends AbstractListController
{
    public $serializer = DepositTransactionSerializer::class;

    public $include = ['user', 'platform', 'depositAddress', 'processedBy'];

    protected function data(ServerRequestInterface $request, Document $document): iterable
    {
        $actor = RequestUtil::getActor($request);
        
        $query = DepositTransaction::query();

        if (!$actor->isAdmin()) {
            // Regular users only see their own transactions
            $query->where('user_id', $actor->id);
        } else {
            // Admins can filter by user if specified
            $userId = Arr::get($request->getQueryParams(), 'filter.user');
            if ($userId) {
                $query->where('user_id', $userId);
            }
        }

        // Filter by status
        $status = Arr::get($request->getQueryParams(), 'filter.status');
        if ($status) {
            $query->where('status', $status);
        }

        // Filter by platform
        $platformId = Arr::get($request->getQueryParams(), 'filter.platform');
        if ($platformId) {
            $query->where('platform_id', $platformId);
        }

        // Order by creation date (newest first)
        $query->orderBy('created_at', 'desc');

        // Apply pagination
        $limit = $this->extractLimit($request);
        $offset = $this->extractOffset($request);
        
        if ($limit) {
            $query->limit($limit);
        }
        
        if ($offset) {
            $query->offset($offset);
        }

        return $query->with(['user', 'platform', 'depositAddress', 'processedBy'])->get();
    }
}