<?php

namespace App\Http\Controllers\K1;

use App\Http\Controllers\Controller;
use App\Models\K1\OwnershipInterest;
use App\Models\K1\F461Worksheet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class F461WorksheetController extends Controller
{
    /**
     * Get Form 461 worksheet for an ownership interest and tax year.
     * Creates if it doesn't exist.
     */
    public function show(OwnershipInterest $interest, int $taxYear): JsonResponse
    {
        $worksheet = F461Worksheet::firstOrCreate(
            [
                'ownership_interest_id' => $interest->id,
                'tax_year' => $taxYear,
            ],
            []
        );

        return response()->json($worksheet);
    }

    /**
     * Update Form 461 worksheet for an ownership interest and tax year.
     */
    public function update(Request $request, OwnershipInterest $interest, int $taxYear): JsonResponse
    {
        $validated = $request->validate([
            'line_2' => 'nullable|numeric',
            'line_3' => 'nullable|numeric',
            'line_4' => 'nullable|numeric',
            'line_5' => 'nullable|numeric',
            'line_6' => 'nullable|numeric',
            'line_8' => 'nullable|numeric',
            'line_10' => 'nullable|numeric',
            'line_11' => 'nullable|numeric',
            'line_15' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        $worksheet = F461Worksheet::firstOrCreate(
            [
                'ownership_interest_id' => $interest->id,
                'tax_year' => $taxYear,
            ],
            []
        );

        $worksheet->update($validated);

        return response()->json($worksheet);
    }
}
