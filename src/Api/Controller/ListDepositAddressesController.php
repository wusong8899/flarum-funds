<?php

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Flarum\Query\QueryCriteria;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\DepositAddressSerializer;
use wusong8899\Withdrawal\Model\DepositAddress;

class ListDepositAddressesController extends AbstractListController
{
    /**
     * {@inheritdoc}
     */
    public $serializer = DepositAddressSerializer::class;

    /**
     * {@inheritdoc}
     */
    public $include = ['platform', 'user'];

    /**
     * {@inheritdoc}
     */
    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $filters = $this->extractFilter($request);
        $sort = $this->extractSort($request);
        $offset = $this->extractOffset($request);
        $limit = $this->extractLimit($request);
        $include = $this->extractInclude($request);

        $query = DepositAddress::query();

        // Apply user filter - users can only see their own addresses, admins can see all
        if (isset($filters['user'])) {
            $userId = $filters['user'];
            
            // Allow admins to view any user's addresses, regular users only their own
            if (!$actor->isAdmin() && $actor->id != $userId) {
                throw new \Flarum\Foundation\ValidationException([
                    'message' => 'You can only view your own deposit addresses',
                ]);
            }
            
            $query->where('user_id', $userId);
        } else if (!$actor->isAdmin()) {
            // Non-admin users can only see their own addresses
            $query->where('user_id', $actor->id);
        }

        // Apply other filters
        if (isset($filters['platform'])) {
            $query->where('platform_id', $filters['platform']);
        }

        if (isset($filters['isActive'])) {
            $query->where('is_active', $filters['isActive']);
        }

        // Apply sorting
        if ($sort) {
            foreach ($sort as $field => $order) {
                if (in_array($field, ['created_at', 'last_used_at', 'platform_id'])) {
                    $query->orderBy($field, $order);
                }
            }
        }

        // Default sort by created_at desc
        if (empty($sort)) {
            $query->orderBy('created_at', 'desc');
        }

        // Apply includes
        if (in_array('platform', $include)) {
            $query->with('platform');
        }
        if (in_array('user', $include)) {
            $query->with('user');
        }

        // Apply pagination
        if ($offset) {
            $query->skip($offset);
        }
        if ($limit) {
            $query->take($limit);
        }

        return $query->get();
    }
}