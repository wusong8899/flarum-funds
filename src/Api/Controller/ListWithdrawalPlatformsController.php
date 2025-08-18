<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Database\Eloquent\Collection;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\WithdrawalPlatformSerializer;
use wusong8899\Withdrawal\Repository\WithdrawalPlatformRepository;

class ListWithdrawalPlatformsController extends AbstractListController
{
    public $serializer = WithdrawalPlatformSerializer::class;

    private WithdrawalPlatformRepository $repository;

    public function __construct()
    {
        $this->repository = new WithdrawalPlatformRepository();
    }

    /**
     * @param ServerRequestInterface $request
     * @param Document $document
     * @return Collection
     * @throws PermissionDeniedException
     */
    protected function data(ServerRequestInterface $request, Document $document): Collection
    {
        $actor = RequestUtil::getActor($request);

        if (!$actor->isGuest()) {
            return $this->repository->all();
        }

        throw new PermissionDeniedException();
    }
}
