<?php

namespace App\Http\Controllers\K1;

use App\Http\Controllers\Controller;
use App\Models\K1\K1Company;
use App\Models\K1\OwnershipInterest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OwnershipInterestController extends Controller
{
    /**
     * Display all ownership interests.
     */
    public function index(): JsonResponse
    {
        $interests = OwnershipInterest::with(['ownerCompany', 'ownedCompany'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($interests);
    }

    /**
     * Get ownership interests for a specific company (where this company is the owner).
     */
    public function forCompany(K1Company $company): JsonResponse
    {
        $interests = OwnershipInterest::with(['ownedCompany'])
            ->where('owner_company_id', $company->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($interests);
    }

    /**
     * Get ownership interests where this company is owned by others.
     */
    public function ownedByCompany(K1Company $company): JsonResponse
    {
        $interests = OwnershipInterest::with(['ownerCompany'])
            ->where('owned_company_id', $company->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($interests);
    }

    /**
     * Store a newly created ownership interest.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'owner_company_id' => 'nullable|exists:k1_companies,id',
            'owned_company_id' => 'required|exists:k1_companies,id',
            'ownership_percentage' => 'required|numeric|min:0|max:999',
            'effective_from' => 'nullable|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'ownership_class' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        // Prevent self-ownership
        if ($validated['owner_company_id'] === $validated['owned_company_id']) {
            return response()->json(['error' => 'A company cannot own itself'], 422);
        }

        $interest = OwnershipInterest::create($validated);
        $interest->load(['ownerCompany', 'ownedCompany']);

        return response()->json($interest, 201);
    }

    /**
     * Display the specified ownership interest.
     */
    public function show(OwnershipInterest $interest): JsonResponse
    {
        $interest->load([
            'ownerCompany',
            'ownedCompany',
            'outsideBasis.adjustments',
            'lossLimitations',
            'lossCarryforwards',
        ]);

        return response()->json($interest);
    }

    /**
     * Update the specified ownership interest.
     */
    public function update(Request $request, OwnershipInterest $interest): JsonResponse
    {
        $validated = $request->validate([
            'owner_company_id' => 'nullable|exists:k1_companies,id',
            'owned_company_id' => 'sometimes|required|exists:k1_companies,id',
            'ownership_percentage' => 'sometimes|required|numeric|min:0|max:999',
            'effective_from' => 'nullable|date',
            'effective_to' => 'nullable|date',
            'ownership_class' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        // Prevent self-ownership
        $ownedId = $validated['owned_company_id'] ?? $interest->owned_company_id;
        $ownerId = $validated['owner_company_id'] ?? $interest->owner_company_id;
        if ($ownerId === $ownedId) {
            return response()->json(['error' => 'A company cannot own itself'], 422);
        }

        $interest->update($validated);
        $interest->load(['ownerCompany', 'ownedCompany']);

        return response()->json($interest);
    }

    /**
     * Remove the specified ownership interest.
     */
    public function destroy(OwnershipInterest $interest): JsonResponse
    {
        $interest->delete();

        return response()->json(null, 204);
    }
}
