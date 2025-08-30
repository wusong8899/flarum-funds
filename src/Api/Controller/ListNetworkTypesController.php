<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\NetworkTypeSerializer;
use wusong8899\Withdrawal\Model\NetworkType;

class ListNetworkTypesController extends AbstractListController
{
    public $serializer = NetworkTypeSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document): iterable
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertAdmin();

        $query = NetworkType::query();

        // Filter by active status if requested
        $filter = $request->getQueryParams()['filter'] ?? [];
        if (isset($filter['is_active'])) {
            $query->where('is_active', (bool) $filter['is_active']);
        }

        // Order by sort_order and name
        $query->orderBy('sort_order')->orderBy('name');

        return $query->get();
    }
}
