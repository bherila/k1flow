<?php

namespace App\Http\Controllers\K1;

use App\Http\Controllers\Controller;
use App\Models\K1\OwnershipInterest;
use App\Models\K1\LossLimitation;
use App\Models\K1\LossCarryforward;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LossLimitationController extends Controller
{
    /**
     * Get loss limitations for an ownership interest and tax year.
     * Creates if it doesn't exist.
     */
    public function show(OwnershipInterest $interest, int $taxYear): JsonResponse
    {
        $limitation = LossLimitation::firstOrCreate(
            [
                'ownership_interest_id' => $interest->id,
                'tax_year' => $taxYear,
            ],
            [
                'notes' => null,
            ]
        );

        return response()->json($limitation);
    }

    /**
     * Update loss limitations for an ownership interest and tax year.
     */
    public function update(Request $request, OwnershipInterest $interest, int $taxYear): JsonResponse
    {
        $validated = $request->validate([
            'capital_at_risk' => 'nullable|numeric',
            'at_risk_deductible' => 'nullable|numeric',
            'at_risk_carryover' => 'nullable|numeric',
            'passive_activity_loss' => 'nullable|numeric',
            'passive_loss_allowed' => 'nullable|numeric',
            'passive_loss_carryover' => 'nullable|numeric',
            'excess_business_loss' => 'nullable|numeric',
            'excess_business_loss_carryover' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        $limitation = LossLimitation::firstOrCreate(
            [
                'ownership_interest_id' => $interest->id,
                'tax_year' => $taxYear,
            ],
            []
        );

        $limitation->update($validated);

        return response()->json($limitation);
    }

    /**
     * Get all loss carryforwards for an ownership interest.
     */
    public function carryforwards(OwnershipInterest $interest): JsonResponse
    {
        $carryforwards = LossCarryforward::where('ownership_interest_id', $interest->id)
            ->orderBy('origin_year', 'desc')
            ->orderBy('carryforward_type')
            ->get();

        return response()->json($carryforwards);
    }

    /**
     * Store a new loss carryforward.
     */
    public function storeCarryforward(Request $request, OwnershipInterest $interest): JsonResponse
    {
        $validated = $request->validate([
            'origin_year' => 'required|integer|min:1900|max:2100',
            'carryforward_type' => 'required|in:at_risk,passive,excess_business_loss',
            'loss_character' => 'nullable|string|max:50',
            'original_amount' => 'required|numeric',
            'remaining_amount' => 'required|numeric',
            'notes' => 'nullable|string',
        ]);

        $validated['ownership_interest_id'] = $interest->id;
        $carryforward = LossCarryforward::create($validated);

        return response()->json($carryforward, 201);
    }

    /**
     * Update a loss carryforward.
     */
    public function updateCarryforward(Request $request, LossCarryforward $carryforward): JsonResponse
    {
        $validated = $request->validate([
            'origin_year' => 'sometimes|required|integer|min:1900|max:2100',
            'carryforward_type' => 'sometimes|required|in:at_risk,passive,excess_business_loss',
            'loss_character' => 'nullable|string|max:50',
            'original_amount' => 'sometimes|required|numeric',
            'remaining_amount' => 'sometimes|required|numeric',
            'notes' => 'nullable|string',
        ]);

        $carryforward->update($validated);

        return response()->json($carryforward);
    }

    /**
     * Delete a loss carryforward.
     */
    public function destroyCarryforward(LossCarryforward $carryforward): JsonResponse
    {
        $carryforward->delete();

        return response()->json(null, 204);
    }
}
