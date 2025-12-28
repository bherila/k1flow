<?php

namespace App\Http\Controllers\K1;

use App\Http\Controllers\Controller;
use App\Models\K1\K1Form;
use App\Models\K1\K1LossCarryforward;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class K1LossCarryforwardController extends Controller
{
    /**
     * List loss carryforwards for a K-1 form.
     */
    public function index(K1Form $form): JsonResponse
    {
        $carryforwards = $form->lossCarryforwards()
            ->orderBy('loss_type')
            ->orderBy('origination_year')
            ->get();

        return response()->json($carryforwards);
    }

    /**
     * Store a new loss carryforward.
     */
    public function store(Request $request, K1Form $form): JsonResponse
    {
        $validated = $request->validate([
            'loss_type' => 'required|in:ordinary,capital_short_term,capital_long_term,section_1231,passive,at_risk,excess_business_loss,other',
            'character' => 'nullable|string|max:100',
            'amount' => 'required|numeric',
            'origination_year' => 'nullable|integer|min:1900|max:2100',
            'utilized_current_year' => 'nullable|numeric',
            'remaining_carryforward' => 'nullable|numeric',
            'description' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $validated['k1_form_id'] = $form->id;
        $carryforward = K1LossCarryforward::create($validated);

        return response()->json($carryforward, 201);
    }

    /**
     * Update a loss carryforward.
     */
    public function update(Request $request, K1Form $form, K1LossCarryforward $carryforward): JsonResponse
    {
        if ($carryforward->k1_form_id !== $form->id) {
            abort(404);
        }

        $validated = $request->validate([
            'loss_type' => 'sometimes|required|in:ordinary,capital_short_term,capital_long_term,section_1231,passive,at_risk,excess_business_loss,other',
            'character' => 'nullable|string|max:100',
            'amount' => 'sometimes|required|numeric',
            'origination_year' => 'nullable|integer|min:1900|max:2100',
            'utilized_current_year' => 'nullable|numeric',
            'remaining_carryforward' => 'nullable|numeric',
            'description' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $carryforward->update($validated);

        return response()->json($carryforward);
    }

    /**
     * Delete a loss carryforward.
     */
    public function destroy(K1Form $form, K1LossCarryforward $carryforward): JsonResponse
    {
        if ($carryforward->k1_form_id !== $form->id) {
            abort(404);
        }

        $carryforward->delete();

        return response()->json(null, 204);
    }
}
