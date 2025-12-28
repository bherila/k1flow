<?php

namespace App\Http\Controllers\K1;

use App\Http\Controllers\Controller;
use App\Models\K1\K1Form;
use App\Models\K1\K1OutsideBasis;
use App\Models\K1\K1ObAdjustment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class K1OutsideBasisController extends Controller
{
    /**
     * Get or create outside basis for a K-1 form.
     */
    public function show(K1Form $form): JsonResponse
    {
        $outsideBasis = $form->outsideBasis()->with('adjustments')->first();

        if (!$outsideBasis) {
            // Create a default outside basis record
            $outsideBasis = K1OutsideBasis::create([
                'k1_form_id' => $form->id,
            ]);
            $outsideBasis->load('adjustments');
        }

        return response()->json($outsideBasis);
    }

    /**
     * Update outside basis for a K-1 form.
     */
    public function update(Request $request, K1Form $form): JsonResponse
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

        $outsideBasis = $form->outsideBasis;

        if (!$outsideBasis) {
            $validated['k1_form_id'] = $form->id;
            $outsideBasis = K1OutsideBasis::create($validated);
        } else {
            $outsideBasis->update($validated);
        }

        return response()->json($outsideBasis);
    }

    /**
     * Add an adjustment to outside basis.
     */
    public function storeAdjustment(Request $request, K1Form $form): JsonResponse
    {
        $outsideBasis = $form->outsideBasis;

        if (!$outsideBasis) {
            $outsideBasis = K1OutsideBasis::create([
                'k1_form_id' => $form->id,
            ]);
        }

        $validated = $request->validate([
            'adjustment_category' => 'required|in:increase,decrease',
            'contributed_cash_property' => 'nullable|numeric',
            'increase_share_liabilities' => 'nullable|numeric',
            'share_income_gain' => 'nullable|numeric',
            'excess_depletion' => 'nullable|numeric',
            'distributions' => 'nullable|numeric',
            'losses' => 'nullable|numeric',
            'decrease_share_liabilities' => 'nullable|numeric',
            'description' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $validated['outside_basis_id'] = $outsideBasis->id;
        $adjustment = K1ObAdjustment::create($validated);

        return response()->json($adjustment, 201);
    }

    /**
     * Update an adjustment.
     */
    public function updateAdjustment(Request $request, K1Form $form, K1ObAdjustment $adjustment): JsonResponse
    {
        // Verify the adjustment belongs to this form's outside basis
        if (!$form->outsideBasis || $adjustment->outside_basis_id !== $form->outsideBasis->id) {
            abort(404);
        }

        $validated = $request->validate([
            'adjustment_category' => 'sometimes|required|in:increase,decrease',
            'contributed_cash_property' => 'nullable|numeric',
            'increase_share_liabilities' => 'nullable|numeric',
            'share_income_gain' => 'nullable|numeric',
            'excess_depletion' => 'nullable|numeric',
            'distributions' => 'nullable|numeric',
            'losses' => 'nullable|numeric',
            'decrease_share_liabilities' => 'nullable|numeric',
            'description' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $adjustment->update($validated);

        return response()->json($adjustment);
    }

    /**
     * Delete an adjustment.
     */
    public function destroyAdjustment(K1Form $form, K1ObAdjustment $adjustment): JsonResponse
    {
        if (!$form->outsideBasis || $adjustment->outside_basis_id !== $form->outsideBasis->id) {
            abort(404);
        }

        $adjustment->delete();

        return response()->json(null, 204);
    }
}
