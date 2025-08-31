<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use wusong8899\Withdrawal\Model\CurrencyIcon;

class CurrencyIconSerializer extends AbstractSerializer
{
    protected $type = 'currency-icons';

    /**
     * @param CurrencyIcon $currencyIcon
     */
    protected function getDefaultAttributes($currencyIcon)
    {
        return [
            'id' => (int) $currencyIcon->id,
            'currencySymbol' => $currencyIcon->currency_symbol,
            'currencyName' => $currencyIcon->currency_name,
            'currencyIconUrl' => $currencyIcon->currency_icon_url,
            'currencyIconClass' => $currencyIcon->currency_icon_class,
            'currencyUnicodeSymbol' => $currencyIcon->currency_unicode_symbol,
            'displayPriority' => (int) $currencyIcon->display_priority,
            'isActive' => (bool) $currencyIcon->is_active,
            'createdAt' => $currencyIcon->created_at?->toISOString(),
            'updatedAt' => $currencyIcon->updated_at?->toISOString(),
        ];
    }

    /**
     * Include the best available icon representation
     */
    public function bestIcon($currencyIcon)
    {
        return $currencyIcon->getBestIcon();
    }
}