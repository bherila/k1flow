<?php

namespace App\Http\Controllers\K1;

use App\Http\Controllers\Controller;
use App\Models\K1\OwnershipInterest;
use App\Models\K1\OutsideBasis;
use App\Models\K1\ObAdjustment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OutsideBasisController extends Controller
{
    /**
     * Get outside basis for an ownership interest and tax year.
     * Creates if it doesn't exist.
     */
    public function show(OwnershipInterest $interest, int $taxYear): JsonResponse
    {
        $basis = OutsideBasis::with('adjustments')
            ->firstOrCreate(
                [
                    'ownership_interest_id' => $interest->id,
                    'tax_year' => $taxYear,
                ],
                [
                    'notes' => null,
                ]
            );

        return response()->json($basis);
    }

    /**
     * Update outside basis for an ownership interest and tax year.
     */
    public function update(Request $request, OwnershipInterest $interest, int $taxYear): JsonResponse
    {
        $validated = $request->validate([
            'contributed_cash_property' => 'nullable|numeric',
            'purchase_price' => 'nullable|numeric',
            'gift_inheritance' => 'nullable|numeric',
            'taxable_compensation' => 'nullable|numeric',
            'inception_basis_total' => 'nullable|numeric',
            'beginning_ob' => 'nullable|numeric',
            'ending_ob' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        $basis = OutsideBasis::firstOrCreate(
            [
                'ownership_interest_id' => $interest->id,
                'tax_year' => $taxYear,
            ],
            []
        );

        $basis->update($validated);
        $basis->load('adjustments');

        return response()->json($basis);
    }

    /**
     * Store a new basis adjustment.
     */
    public function storeAdjustment(Request $request, OwnershipInterest $interest, int $taxYear): JsonResponse
    {
        $validated = $request->validate([
            'adjustment_category' => 'required|in:increase,decrease',
            'adjustment_type' => 'nullable|string|max:100',
            'amount' => 'nullable|numeric',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);

        $basis = OutsideBasis::firstOrCreate(
            [
                'ownership_interest_id' => $interest->id,
                'tax_year' => $taxYear,
            ],
            []
        );

        $validated['outside_basis_id'] = $basis->id;
        $adjustment = ObAdjustment::create($validated);

        return response()->json($adjustment, 201);
    }

    /**
     * Update a basis adjustment.
     */
    public function updateAdjustment(Request $request, ObAdjustment $adjustment): JsonResponse
    {
        $validated = $request->validate([
            'adjustment_category' => 'sometimes|required|in:increase,decrease',
            'adjustment_type' => 'nullable|string|max:100',
            'amount' => 'nullable|numeric',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);

        $adjustment->update($validated);

        return response()->json($adjustment);
    }

    /**
     * Delete a basis adjustment.
     */
    public function destroyAdjustment(ObAdjustment $adjustment): JsonResponse
    {
        $adjustment->delete();

        return response()->json(null, 204);
    }
}
