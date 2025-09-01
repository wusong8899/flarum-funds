<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Controller\CurrencyIcon;

use Flarum\Api\Controller\AbstractDeleteController;
use Flarum\Http\RequestUtil;
use Psr\Http\Message\ServerRequestInterface;
use wusong8899\Funds\Model\CurrencyIcon;
use Illuminate\Validation\ValidationException;

class DeleteCurrencyIconController extends AbstractDeleteController
{
    protected function delete(ServerRequestInterface $request)
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertAdmin();

        $id = (int) $request->getAttribute('id');

        $currencyIcon = CurrencyIcon::findOrFail($id);

        // Check if currency is in use by platforms
        $depositPlatformsCount = $currencyIcon->depositPlatforms()->count();
        $withdrawalPlatformsCount = $currencyIcon->withdrawalPlatforms()->count();

        if ($depositPlatformsCount > 0 || $withdrawalPlatformsCount > 0) {
            throw ValidationException::withMessages([
                'currencySymbol' => ['Cannot delete currency icon that is in use by platforms']
            ]);
        }

        $currencyIcon->delete();
    }
}
