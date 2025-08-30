<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Flarum\Query\QueryCriteria;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\WithdrawalRequestSerializer;
use wusong8899\Withdrawal\Model\WithdrawalRequest;

class ListWithdrawalRequestsController extends AbstractListController
{
    public $serializer = WithdrawalRequestSerializer::class;

    public $include = ['user', 'platform'];

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);

        if ($actor->isGuest()) {
            throw new PermissionDeniedException();
        }

        $query = WithdrawalRequest::query()->with(['user', 'platform']);

        if (!$actor->isAdmin()) {
            $query->where('user_id', $actor->id);
        }

        $query->orderBy('created_at', 'desc');

        return $query->get();
    }
}
