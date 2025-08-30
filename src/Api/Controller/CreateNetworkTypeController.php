<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Withdrawal\Api\Serializer\NetworkTypeSerializer;
use wusong8899\Withdrawal\Model\NetworkType;

class CreateNetworkTypeController extends AbstractCreateController
{
    public $serializer = NetworkTypeSerializer::class;

    public function __construct(
        protected ValidationFactory $validation
    ) {
    }

    protected function data(ServerRequestInterface $request, Document $document): NetworkType
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertAdmin();

        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);

        // Validate the input
        $validator = $this->validation->make($attributes, [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:network_types,code',
            'description' => 'nullable|string',
            'iconUrl' => 'nullable|url',
            'iconClass' => 'nullable|string|max:100',
            'config' => 'nullable|array',
            'isActive' => 'boolean',
            'sortOrder' => 'integer|min:0'
        ]);

        if ($validator->fails()) {
            throw new \Flarum\Foundation\ValidationException($validator->errors()->toArray());
        }

        return NetworkType::create([
            'name' => $attributes['name'],
            'code' => strtoupper($attributes['code']),
            'description' => $attributes['description'] ?? null,
            'icon_url' => $attributes['iconUrl'] ?? null,
            'icon_class' => $attributes['iconClass'] ?? null,
            'config' => $attributes['config'] ?? null,
            'is_active' => $attributes['isActive'] ?? true,
            'sort_order' => $attributes['sortOrder'] ?? 0
        ]);
    }
}
