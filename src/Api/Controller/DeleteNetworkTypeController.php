<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Controller;

use Flarum\Api\Controller\AbstractDeleteController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use wusong8899\Funds\Model\NetworkType;

class DeleteNetworkTypeController extends AbstractDeleteController
{
    protected function delete(ServerRequestInterface $request): void
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertAdmin();

        $id = Arr::get($request->getQueryParams(), 'id');
        $networkType = NetworkType::findOrFail($id);

        // Check if network type is being used by deposit platforms
        $platformsCount = $networkType->depositPlatforms()->count();
        if ($platformsCount > 0) {
            throw new \Flarum\Foundation\ValidationException([
                'network_type' => "Cannot delete network type: it is used by {$platformsCount} deposit platform(s)"
            ]);
        }

        $networkType->delete();
    }
}
