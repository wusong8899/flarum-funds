<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Repository;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use wusong8899\Withdrawal\Model\WithdrawalPlatform;

class WithdrawalPlatformRepository
{
    /**
     * Get all platforms
     *
     * @param bool $activeOnly
     * @return Collection<int, WithdrawalPlatform>
     */
    public function all(bool $activeOnly = false): Collection
    {
        $query = WithdrawalPlatform::query();

        if ($activeOnly) {
            $query->where('is_active', true);
        }

        return $query->orderBy('name')->get();
    }

    /**
     * Find platform by ID
     *
     * @param int $id
     * @return WithdrawalPlatform|null
     */
    public function find(int $id): ?WithdrawalPlatform
    {
        return WithdrawalPlatform::find($id);
    }

    /**
     * Find platform by ID or throw exception
     *
     * @param int $id
     * @return WithdrawalPlatform
     * @throws ModelNotFoundException
     */
    public function findOrFail(int $id): WithdrawalPlatform
    {
        return WithdrawalPlatform::findOrFail($id);
    }

    /**
     * Find platform by symbol
     *
     * @param string $symbol
     * @return WithdrawalPlatform|null
     */
    public function findBySymbol(string $symbol): ?WithdrawalPlatform
    {
        return WithdrawalPlatform::where('symbol', $symbol)->first();
    }

    /**
     * Create a new platform
     *
     * @param array<string, mixed> $data
     * @return WithdrawalPlatform
     */
    public function create(array $data): WithdrawalPlatform
    {
        $platform = new WithdrawalPlatform();
        $platform->name = $data['name'];
        $platform->symbol = $data['symbol'];
        $platform->min_amount = $data['min_amount'];
        $platform->max_amount = $data['max_amount'];
        $platform->fee = $data['fee'] ?? 0;
        $platform->icon_url = $data['icon_url'] ?? null;
        $platform->icon_class = $data['icon_class'] ?? null;
        $platform->is_active = $data['is_active'] ?? true;
        $platform->save();

        return $platform;
    }

    /**
     * Update a platform
     *
     * @param WithdrawalPlatform $platform
     * @param array<string, mixed> $data
     * @return WithdrawalPlatform
     */
    public function update(WithdrawalPlatform $platform, array $data): WithdrawalPlatform
    {
        if (isset($data['name'])) {
            $platform->name = $data['name'];
        }
        if (isset($data['symbol'])) {
            $platform->symbol = $data['symbol'];
        }
        if (isset($data['min_amount'])) {
            $platform->min_amount = $data['min_amount'];
        }
        if (isset($data['max_amount'])) {
            $platform->max_amount = $data['max_amount'];
        }
        if (isset($data['fee'])) {
            $platform->fee = $data['fee'];
        }
        if (isset($data['icon_url'])) {
            $platform->icon_url = $data['icon_url'];
        }
        if (isset($data['icon_class'])) {
            $platform->icon_class = $data['icon_class'];
        }
        if (isset($data['is_active'])) {
            $platform->is_active = $data['is_active'];
        }

        $platform->save();

        return $platform;
    }

    /**
     * Delete a platform
     *
     * @param WithdrawalPlatform $platform
     * @return bool
     */
    public function delete(WithdrawalPlatform $platform): bool
    {
        return $platform->delete();
    }

    /**
     * Get platforms with request counts
     *
     * @return Collection<int, WithdrawalPlatform>
     */
    public function withRequestCounts(): Collection
    {
        return WithdrawalPlatform::withCount('withdrawalRequests')
            ->orderBy('name')
            ->get();
    }

    /**
     * Get platforms with pending requests
     *
     * @return Collection<int, WithdrawalPlatform>
     */
    public function withPendingRequests(): Collection
    {
        return WithdrawalPlatform::whereHas('withdrawalRequests', function ($query) {
            $query->where('status', 'pending');
        })->get();
    }

    /**
     * Toggle platform active status
     *
     * @param WithdrawalPlatform $platform
     * @return WithdrawalPlatform
     */
    public function toggleActive(WithdrawalPlatform $platform): WithdrawalPlatform
    {
        $platform->is_active = !$platform->is_active;
        $platform->save();

        return $platform;
    }

    /**
     * Get platform statistics
     *
     * @param WithdrawalPlatform $platform
     * @return array<string, mixed>
     */
    public function getStatistics(WithdrawalPlatform $platform): array
    {
        $requests = $platform->withdrawalRequests();

        return [
            'total_requests' => $requests->count(),
            'pending_requests' => $requests->where('status', 'pending')->count(),
            'approved_requests' => $requests->where('status', 'approved')->count(),
            'rejected_requests' => $requests->where('status', 'rejected')->count(),
            'total_amount' => $requests->sum('amount'),
            'approved_amount' => $requests->where('status', 'approved')->sum('amount'),
        ];
    }
}
