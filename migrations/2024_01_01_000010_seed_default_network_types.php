<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        // Insert default network types
        $schema->getConnection()->table('network_types')->insert([
            [
                'name' => 'TRON (TRC20)',
                'code' => 'TRC20',
                'description' => 'TRON blockchain network for TRC20 tokens',
                'icon_class' => 'fab fa-tron',
                'config' => json_encode([
                    'explorer_url' => 'https://tronscan.org/#/transaction/{hash}',
                    'address_format' => 'T[A-Za-z0-9]{33}',
                    'required_confirmations' => 1
                ]),
                'is_active' => true,
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Ethereum (ERC20)',
                'code' => 'ERC20',
                'description' => 'Ethereum blockchain network for ERC20 tokens',
                'icon_class' => 'fab fa-ethereum',
                'config' => json_encode([
                    'explorer_url' => 'https://etherscan.io/tx/{hash}',
                    'address_format' => '0x[a-fA-F0-9]{40}',
                    'required_confirmations' => 12
                ]),
                'is_active' => true,
                'sort_order' => 20,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Binance Smart Chain (BEP20)',
                'code' => 'BSC',
                'description' => 'Binance Smart Chain network for BEP20 tokens',
                'icon_class' => 'fab fa-bitcoin',
                'config' => json_encode([
                    'explorer_url' => 'https://bscscan.com/tx/{hash}',
                    'address_format' => '0x[a-fA-F0-9]{40}',
                    'required_confirmations' => 3
                ]),
                'is_active' => true,
                'sort_order' => 30,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Polygon',
                'code' => 'POLYGON',
                'description' => 'Polygon network for MATIC tokens',
                'icon_class' => 'fas fa-coins',
                'config' => json_encode([
                    'explorer_url' => 'https://polygonscan.com/tx/{hash}',
                    'address_format' => '0x[a-fA-F0-9]{40}',
                    'required_confirmations' => 10
                ]),
                'is_active' => true,
                'sort_order' => 40,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Arbitrum',
                'code' => 'ARBITRUM',
                'description' => 'Arbitrum Layer 2 network',
                'icon_class' => 'fas fa-layer-group',
                'config' => json_encode([
                    'explorer_url' => 'https://arbiscan.io/tx/{hash}',
                    'address_format' => '0x[a-fA-F0-9]{40}',
                    'required_confirmations' => 1
                ]),
                'is_active' => true,
                'sort_order' => 50,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Optimism',
                'code' => 'OPTIMISM',
                'description' => 'Optimism Layer 2 network',
                'icon_class' => 'fas fa-rocket',
                'config' => json_encode([
                    'explorer_url' => 'https://optimistic.etherscan.io/tx/{hash}',
                    'address_format' => '0x[a-fA-F0-9]{40}',
                    'required_confirmations' => 1
                ]),
                'is_active' => true,
                'sort_order' => 60,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    },
    'down' => function (Builder $schema) {
        // Remove all default network types
        $schema->getConnection()->table('network_types')->truncate();
    }
];