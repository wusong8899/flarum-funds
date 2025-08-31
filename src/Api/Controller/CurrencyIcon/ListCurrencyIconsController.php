<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Controller\CurrencyIcon;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\CurrencyIconSerializer;
use wusong8899\Withdrawal\Model\CurrencyIcon;

class ListCurrencyIconsController extends AbstractListController
{
    public $serializer = CurrencyIconSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertAdmin();

        $query = CurrencyIcon::query();

        // Filter by active status if requested
        $filter = $request->getQueryParams()['filter'] ?? [];
        if (isset($filter['active'])) {
            $isActive = filter_var($filter['active'], FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        // Search by symbol or name
        if (isset($filter['search'])) {
            $search = trim($filter['search']);
            $query->where(function ($q) use ($search) {
                $q->where('currency_symbol', 'LIKE', "%{$search}%")
                  ->orWhere('currency_name', 'LIKE', "%{$search}%");
            });
        }

        return $query->orderBy('display_priority', 'desc')
                     ->orderBy('currency_symbol')
                     ->get();
    }
}
