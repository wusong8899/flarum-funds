<?php

declare(strict_types=1);

namespace wusong8899\Withdrawal\Repository;

use Flarum\User\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use wusong8899\Withdrawal\Model\WithdrawalRequest;
use wusong8899\Withdrawal\Model\WithdrawalPlatform;

class WithdrawalRequestRepository
{
    /**
     * Get all requests with optional filters
     *
     * @param array<string, mixed> $filters
     * @return Collection<int, WithdrawalRequest>
     */
    public function all(array $filters = []): Collection
    {
        $query = WithdrawalRequest::with(['user', 'platform']);

        $this->applyFilters($query, $filters);

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Find request by ID
     *
     * @param int $id
     * @return WithdrawalRequest|null
     */
    public function find(int $id): ?WithdrawalRequest
    {
        return WithdrawalRequest::with(['user', 'platform'])->find($id);
    }

    /**
     * Find request by ID or throw exception
     *
     * @param int $id
     * @return WithdrawalRequest
     * @throws ModelNotFoundException
     */
    public function findOrFail(int $id): WithdrawalRequest
    {
        return WithdrawalRequest::with(['user', 'platform'])->findOrFail($id);
    }

    /**
     * Get requests for a specific user
     *
     * @param User $user
     * @param array<string, mixed> $filters
     * @return Collection<int, WithdrawalRequest>
     */
    public function forUser(User $user, array $filters = []): Collection
    {
        $query = WithdrawalRequest::with(['platform'])
            ->where('user_id', $user->id);

        $this->applyFilters($query, $filters);

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get requests for a specific platform
     *
     * @param WithdrawalPlatform $platform
     * @param array<string, mixed> $filters
     * @return Collection<int, WithdrawalRequest>
     */
    public function forPlatform(WithdrawalPlatform $platform, array $filters = []): Collection
    {
        $query = WithdrawalRequest::with(['user'])
            ->where('platform_id', $platform->id);

        $this->applyFilters($query, $filters);

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get pending requests
     *
     * @return Collection<int, WithdrawalRequest>
     */
    public function pending(): Collection
    {
        return WithdrawalRequest::with(['user', 'platform'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Get approved requests
     *
     * @return Collection<int, WithdrawalRequest>
     */
    public function approved(): Collection
    {
        return WithdrawalRequest::with(['user', 'platform'])
            ->where('status', 'approved')
            ->orderBy('updated_at', 'desc')
            ->get();
    }

    /**
     * Get rejected requests
     *
     * @return Collection<int, WithdrawalRequest>
     */
    public function rejected(): Collection
    {
        return WithdrawalRequest::with(['user', 'platform'])
            ->where('status', 'rejected')
            ->orderBy('updated_at', 'desc')
            ->get();
    }

    /**
     * Create a new withdrawal request
     *
     * @param array<string, mixed> $data
     * @return WithdrawalRequest
     */
    public function create(array $data): WithdrawalRequest
    {
        $request = new WithdrawalRequest();
        $request->user_id = $data['user_id'];
        $request->platform_id = $data['platform_id'];
        $request->amount = $data['amount'];
        $request->account_details = $data['account_details'];
        $request->status = $data['status'] ?? WithdrawalRequest::STATUS_PENDING;
        $request->save();

        $request->load(['user', 'platform']);

        return $request;
    }

    /**
     * Update withdrawal request status
     *
     * @param WithdrawalRequest $request
     * @param string $status
     * @return WithdrawalRequest
     */
    public function updateStatus(WithdrawalRequest $request, string $status): WithdrawalRequest
    {
        $request->status = $status;
        $request->save();

        return $request;
    }

    /**
     * Approve a withdrawal request
     *
     * @param WithdrawalRequest $request
     * @return WithdrawalRequest
     */
    public function approve(WithdrawalRequest $request): WithdrawalRequest
    {
        $request->approve();
        $request->save();

        return $request;
    }

    /**
     * Reject a withdrawal request
     *
     * @param WithdrawalRequest $request
     * @return WithdrawalRequest
     */
    public function reject(WithdrawalRequest $request): WithdrawalRequest
    {
        $request->reject();
        $request->save();

        return $request;
    }

    /**
     * Delete a withdrawal request
     *
     * @param WithdrawalRequest $request
     * @return bool
     */
    public function delete(WithdrawalRequest $request): bool
    {
        return $request->delete();
    }

    /**
     * Get statistics for all requests
     *
     * @return array<string, mixed>
     */
    public function getStatistics(): array
    {
        return [
            'total_requests' => WithdrawalRequest::count(),
            'pending_requests' => WithdrawalRequest::where('status', 'pending')->count(),
            'approved_requests' => WithdrawalRequest::where('status', 'approved')->count(),
            'rejected_requests' => WithdrawalRequest::where('status', 'rejected')->count(),
            'total_amount' => WithdrawalRequest::sum('amount'),
            'approved_amount' => WithdrawalRequest::where('status', 'approved')->sum('amount'),
            'pending_amount' => WithdrawalRequest::where('status', 'pending')->sum('amount'),
        ];
    }

    /**
     * Get user statistics
     *
     * @param User $user
     * @return array<string, mixed>
     */
    public function getUserStatistics(User $user): array
    {
        $requests = WithdrawalRequest::where('user_id', $user->id);

        return [
            'total_requests' => $requests->count(),
            'pending_requests' => (clone $requests)->where('status', 'pending')->count(),
            'approved_requests' => (clone $requests)->where('status', 'approved')->count(),
            'rejected_requests' => (clone $requests)->where('status', 'rejected')->count(),
            'total_withdrawn' => (clone $requests)->where('status', 'approved')->sum('amount'),
            'pending_amount' => (clone $requests)->where('status', 'pending')->sum('amount'),
        ];
    }

    /**
     * Apply filters to query
     *
     * @param Builder $query
     * @param array<string, mixed> $filters
     * @return void
     */
    private function applyFilters(Builder $query, array $filters): void
    {
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['platform_id'])) {
            $query->where('platform_id', $filters['platform_id']);
        }

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['min_amount'])) {
            $query->where('amount', '>=', $filters['min_amount']);
        }

        if (isset($filters['max_amount'])) {
            $query->where('amount', '<=', $filters['max_amount']);
        }

        if (isset($filters['from_date'])) {
            $query->where('created_at', '>=', $filters['from_date']);
        }

        if (isset($filters['to_date'])) {
            $query->where('created_at', '<=', $filters['to_date']);
        }
    }

    /**
     * Get paginated requests
     *
     * @param int $perPage
     * @param array<string, mixed> $filters
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginate(int $perPage = 20, array $filters = [])
    {
        $query = WithdrawalRequest::with(['user', 'platform']);

        $this->applyFilters($query, $filters);

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }
}
