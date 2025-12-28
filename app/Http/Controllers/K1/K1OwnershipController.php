<?php

namespace App\Http\Controllers\K1;

use App\Http\Controllers\Controller;
use App\Models\K1\K1Company;
use App\Models\K1\K1Ownership;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class K1OwnershipController extends Controller
{
    /**
     * List all ownership relationships.
     */
    public function index(): JsonResponse
    {
        $ownerships = K1Ownership::with(['ownerCompany', 'ownedCompany'])
            ->orderBy('owned_company_id')
            ->get();

        return response()->json($ownerships);
    }

    /**
     * Get ownership structure for a specific company (who owns it).
     */
    public function owners(K1Company $company): JsonResponse
    {
        $owners = $company->owners()->with('ownerCompany')->get();

        return response()->json($owners);
    }

    /**
     * Get companies owned by a specific company.
     */
    public function ownedCompanies(K1Company $company): JsonResponse
    {
        $owned = $company->ownedCompanies()->with('ownedCompany')->get();

        return response()->json($owned);
    }

    /**
     * Store a new ownership relationship.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'owner_company_id' => 'nullable|exists:k1_companies,id',
            'owned_company_id' => 'required|exists:k1_companies,id|different:owner_company_id',
            'ownership_percentage' => 'required|numeric|min:0|max:100',
            'effective_from' => 'nullable|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'ownership_class' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        // Check for circular ownership (basic check)
        if ($validated['owner_company_id']) {
            $hasCircular = $this->checkCircularOwnership(
                $validated['owner_company_id'],
                $validated['owned_company_id']
            );
            if ($hasCircular) {
                return response()->json([
                    'message' => 'Circular ownership detected. This would create a loop.',
                ], 422);
            }
        }

        $ownership = K1Ownership::create($validated);
        $ownership->load(['ownerCompany', 'ownedCompany']);

        return response()->json($ownership, 201);
    }

    /**
     * Update an ownership relationship.
     */
    public function update(Request $request, K1Ownership $ownership): JsonResponse
    {
        $validated = $request->validate([
            'owner_company_id' => 'nullable|exists:k1_companies,id',
            'owned_company_id' => 'sometimes|required|exists:k1_companies,id|different:owner_company_id',
            'ownership_percentage' => 'sometimes|required|numeric|min:0|max:100',
            'effective_from' => 'nullable|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'ownership_class' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $ownership->update($validated);
        $ownership->load(['ownerCompany', 'ownedCompany']);

        return response()->json($ownership);
    }

    /**
     * Delete an ownership relationship.
     */
    public function destroy(K1Ownership $ownership): JsonResponse
    {
        $ownership->delete();

        return response()->json(null, 204);
    }

    /**
     * Basic circular ownership check.
     * Returns true if adding this ownership would create a loop.
     */
    private function checkCircularOwnership(int $ownerId, int $ownedId, array $visited = []): bool
    {
        if ($ownerId === $ownedId) {
            return true;
        }

        if (in_array($ownedId, $visited)) {
            return true;
        }

        $visited[] = $ownedId;

        // Check if the owned company owns the owner (directly or indirectly)
        $ownedCompanyOwns = K1Ownership::where('owner_company_id', $ownedId)->get();

        foreach ($ownedCompanyOwns as $relationship) {
            if ($relationship->owned_company_id === $ownerId) {
                return true;
            }
            if ($this->checkCircularOwnership($ownerId, $relationship->owned_company_id, $visited)) {
                return true;
            }
        }

        return false;
    }
}
