<?php

declare(strict_types=1);

namespace wusong8899\Funds\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\Funds\Api\Serializer\NetworkTypeSerializer;
use wusong8899\Funds\Model\NetworkType;

class UpdateNetworkTypeController extends AbstractShowController
{
    public $serializer = NetworkTypeSerializer::class;

    public function __construct(
        protected ValidationFactory $validation
    ) {}

    protected function data(ServerRequestInterface $request, Document $document): NetworkType
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertAdmin();

        $id = Arr::get($request->getQueryParams(), 'id');
        $networkType = NetworkType::findOrFail($id);

        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);

        // Validate the input
        $validator = $this->validation->make($attributes, [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:50|unique:network_types,code,' . $networkType->id,
            'description' => 'nullable|string',
            'iconUrl' => 'nullable|url',
            'iconClass' => 'nullable|string|max:100',
            'config' => 'nullable|array',
            'isActive' => 'boolean',
            'sortOrder' => 'integer|min:0'
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors();
            $flattenedErrors = [];
            
            foreach ($errors->toArray() as $field => $messages) {
                foreach ($messages as $message) {
                    $flattenedErrors[] = $message;
                }
            }
            
            throw new \Flarum\Foundation\ValidationException($flattenedErrors);
        }

        // Update fields if provided
        if (isset($attributes['name'])) {
            $networkType->name = $attributes['name'];
        }
        if (isset($attributes['code'])) {
            $networkType->code = strtoupper($attributes['code']);
        }
        if (array_key_exists('description', $attributes)) {
            $networkType->description = $attributes['description'];
        }
        if (array_key_exists('iconUrl', $attributes)) {
            $networkType->icon_url = $attributes['iconUrl'];
        }
        if (array_key_exists('iconClass', $attributes)) {
            $networkType->icon_class = $attributes['iconClass'];
        }
        if (array_key_exists('config', $attributes)) {
            $networkType->config = $attributes['config'];
        }
        if (isset($attributes['isActive'])) {
            $networkType->is_active = $attributes['isActive'];
        }
        if (isset($attributes['sortOrder'])) {
            $networkType->sort_order = $attributes['sortOrder'];
        }

        $networkType->save();

        return $networkType;
    }
}
