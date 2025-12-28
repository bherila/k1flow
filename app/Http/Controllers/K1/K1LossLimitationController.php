<?php

namespace App\Http\Controllers\K1;

use App\Http\Controllers\Controller;
use App\Models\K1\K1Form;
use App\Models\K1\K1LossLimitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class K1LossLimitationController extends Controller
{
    /**
     * Get or create loss limitations for a K-1 form.
     */
    public function show(K1Form $form): JsonResponse
    {
        $limitations = $form->lossLimitations;

        if (!$limitations) {
            $limitations = K1LossLimitation::create([
                'k1_form_id' => $form->id,
            ]);
        }

        return response()->json($limitations);
    }

    /**
     * Update loss limitations for a K-1 form.
     */
    public function update(Request $request, K1Form $form): JsonResponse
    {
        $validated = $request->validate([
            // At-Risk (Form 6198)
            'capital_at_risk' => 'nullable|numeric',
            'at_risk_deductible' => 'nullable|numeric',
            'at_risk_carryover' => 'nullable|numeric',
            // Passive Activity (Form 8582)
            'passive_activity_loss' => 'nullable|numeric',
            'passive_loss_allowed' => 'nullable|numeric',
            'passive_loss_carryover' => 'nullable|numeric',
            // Section 461(l)
            'excess_business_loss' => 'nullable|numeric',
            'excess_business_loss_carryover' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        $limitations = $form->lossLimitations;

        if (!$limitations) {
            $validated['k1_form_id'] = $form->id;
            $limitations = K1LossLimitation::create($validated);
        } else {
            $limitations->update($validated);
        }

        return response()->json($limitations);
    }
}
