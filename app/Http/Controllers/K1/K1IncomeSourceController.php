<?php

namespace App\Http\Controllers\K1;

use App\Http\Controllers\Controller;
use App\Models\K1\K1Form;
use App\Models\K1\K1IncomeSource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class K1IncomeSourceController extends Controller
{
    /**
     * List income sources for a K-1 form.
     */
    public function index(K1Form $form): JsonResponse
    {
        $sources = $form->incomeSources()->orderBy('income_type')->get();

        return response()->json($sources);
    }

    /**
     * Store a new income source.
     */
    public function store(Request $request, K1Form $form): JsonResponse
    {
        $validated = $request->validate([
            'income_type' => 'required|in:passive,non_passive,capital,trade_or_business_461l',
            'description' => 'nullable|string|max:255',
            'amount' => 'required|numeric',
            'k1_box_reference' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $validated['k1_form_id'] = $form->id;
        $source = K1IncomeSource::create($validated);

        return response()->json($source, 201);
    }

    /**
     * Update an income source.
     */
    public function update(Request $request, K1Form $form, K1IncomeSource $source): JsonResponse
    {
        if ($source->k1_form_id !== $form->id) {
            abort(404);
        }

        $validated = $request->validate([
            'income_type' => 'sometimes|required|in:passive,non_passive,capital,trade_or_business_461l',
            'description' => 'nullable|string|max:255',
            'amount' => 'sometimes|required|numeric',
            'k1_box_reference' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $source->update($validated);

        return response()->json($source);
    }

    /**
     * Delete an income source.
     */
    public function destroy(K1Form $form, K1IncomeSource $source): JsonResponse
    {
        if ($source->k1_form_id !== $form->id) {
            abort(404);
        }

        $source->delete();

        return response()->json(null, 204);
    }
}
