<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        // Insert default network types
        $connection = $schema->getConnection();
        
        $networkTypes = [
            [
                'name' => 'TRON (TRC20)',
                'code' => 'TRC20',
                'description' => 'TRON blockchain network using TRC20 standard',
                'icon_class' => 'fab fa-tron',
                'sort_order' => 10,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ethereum (ERC20)',
                'code' => 'ERC20', 
                'description' => 'Ethereum blockchain network using ERC20 standard',
                'icon_class' => 'fab fa-ethereum',
                'sort_order' => 20,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Binance Smart Chain (BSC)',
                'code' => 'BSC',
                'description' => 'Binance Smart Chain network',
                'icon_class' => 'fas fa-coins',
                'sort_order' => 30,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Polygon (MATIC)',
                'code' => 'POLYGON',
                'description' => 'Polygon network (formerly Matic)',
                'icon_class' => 'fas fa-gem',
                'sort_order' => 40,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Arbitrum',
                'code' => 'ARB',
                'description' => 'Arbitrum Layer 2 network',
                'icon_class' => 'fas fa-layer-group',
                'sort_order' => 50,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Only insert if table is empty to prevent duplicates
        if ($connection->table('network_types')->count() === 0) {
            $connection->table('network_types')->insert($networkTypes);
        }
    },
    
    'down' => function (Builder $schema) {
        $connection = $schema->getConnection();
        
        // Delete seeded network types
        $connection->table('network_types')->whereIn('code', [
            'TRC20', 'ERC20', 'BSC', 'POLYGON', 'ARB'
        ])->delete();
    }
];