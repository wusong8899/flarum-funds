<?php

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\WithdrawalPlatformSerializer;
use wusong8899\Withdrawal\Model\WithdrawalPlatform;

class ShowWithdrawalPlatformController extends AbstractShowController
{
    /**
     * {@inheritdoc}
     */
    public $serializer = WithdrawalPlatformSerializer::class;

    /**
     * {@inheritdoc}
     */
    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $id = Arr::get($request->getQueryParams(), 'id');

        $withdrawalPlatform = WithdrawalPlatform::findOrFail($id);

        // Check permissions - users need to be able to view active platforms
        // Admins can view all platforms
        if (!$actor->isAdmin() && !$withdrawalPlatform->is_active) {
            throw new \Flarum\Foundation\ValidationException([
                'message' => 'You do not have permission to view this platform',
            ]);
        }

        return $withdrawalPlatform;
    }
}
