<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Controller\CurrencyIcon;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Funds\Api\Serializer\CurrencyIconSerializer;
use wusong8899\Funds\Model\CurrencyIcon;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ShowCurrencyIconController extends AbstractShowController
{
    public $serializer = CurrencyIconSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertAdmin();

        $id = (int) $request->getAttribute('id');

        $currencyIcon = CurrencyIcon::findOrFail($id);

        return $currencyIcon;
    }
}
