<?php

namespace App\Http\Controllers\K1;

use App\Http\Controllers\Controller;
use App\Models\K1\K1Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class K1CompanyController extends Controller
{
    /**
     * Display a listing of companies.
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();
        
        // Get companies owned by user or where user has shared access
        $companies = K1Company::where(function ($query) use ($user) {
            $query->where('owner_user_id', $user->id)
                  ->orWhereHas('users', function ($q) use ($user) {
                      $q->where('user_id', $user->id);
                  });
        })
        ->withCount('k1Forms')
        ->orderBy('name')
        ->get();

        return response()->json($companies);
    }

    /**
     * Store a newly created company.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'ein' => 'nullable|string|max:20',
            'entity_type' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:2',
            'zip' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
        ]);

        // Set the owner to the authenticated user
        $validated['owner_user_id'] = auth()->id();
        
        $company = K1Company::create($validated);

        return response()->json($company, 201);
    }

    /**
     * Display the specified company.
     */
    public function show(K1Company $company): JsonResponse
    {
        Gate::authorize('access-company', $company);
        
        return response()->json($company);
    }

    /**
     * Update the specified company.
     */
    public function update(Request $request, K1Company $company): JsonResponse
    {
        Gate::authorize('access-company', $company);
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'ein' => 'nullable|string|max:20',
            'entity_type' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:2',
            'zip' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
        ]);

        $company->update($validated);

        return response()->json($company);
    }

    /**
     * Remove the specified company.
     */
    public function destroy(K1Company $company): JsonResponse
    {
        Gate::authorize('access-company', $company);
        
        $company->delete();

        return response()->json(null, 204);
    }

    /**
     * List users with access to the company.
     */
    public function listUsers(K1Company $company): JsonResponse
    {
        Gate::authorize('access-company', $company);
        
        $owner = $company->owner;
        $sharedUsers = $company->users;
        
        return response()->json([
            'owner' => $owner,
            'shared_users' => $sharedUsers,
        ]);
    }

    /**
     * Grant a user access to the company.
     */
    public function grantAccess(Request $request, K1Company $company): JsonResponse
    {
        Gate::authorize('access-company', $company);
        
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);
        
        // Prevent adding owner as shared user
        if ($validated['user_id'] == $company->owner_user_id) {
            return response()->json([
                'message' => 'Owner already has access to the company',
            ], 422);
        }
        
        // Check if already has access
        if ($company->users()->where('user_id', $validated['user_id'])->exists()) {
            return response()->json([
                'message' => 'User already has access to the company',
            ], 422);
        }
        
        $company->users()->attach($validated['user_id']);
        
        // Clear cache
        cache()->forget("user:{$validated['user_id']}:company:{$company->id}:access");
        
        return response()->json([
            'message' => 'Access granted successfully',
        ], 200);
    }

    /**
     * Revoke a user's access to the company.
     */
    public function revokeAccess(K1Company $company, int $userId): JsonResponse
    {
        Gate::authorize('access-company', $company);
        
        // Prevent removing owner
        if ($userId == $company->owner_user_id) {
            return response()->json([
                'message' => 'Cannot remove owner access',
            ], 422);
        }
        
        $company->users()->detach($userId);
        
        // Clear cache
        cache()->forget("user:{$userId}:company:{$company->id}:access");
        
        return response()->json([
            'message' => 'Access revoked successfully',
        ], 200);
    }
}
