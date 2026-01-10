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
     * Get the full basis walk for an ownership interest.
     * Returns all years from inception to current, showing:
     * - Starting basis (ending basis from prior year, or inception basis for first year)
     * - Sum of adjustments for the year
     * - Ending basis
     */
    public function basisWalk(OwnershipInterest $interest): JsonResponse
    {
        $data = $this->calculateBasisWalkData($interest);

        return response()->json([
            'ownership_interest_id' => $interest->id,
            'inception_year' => $data['inception_year'],
            'inception_basis' => $data['inception_basis'],
            'basis_walk' => array_values($data['walk']),
        ]);
    }

    /**
     * Calculate the basis walk data for all years up to current or target year.
     * 
     * @param OwnershipInterest $interest
     * @param int|null $targetYear Ensure calculations extend to at least this year
     * @return array
     */
    private function calculateBasisWalkData(OwnershipInterest $interest, ?int $targetYear = null): array
    {
        // Get all outside basis records for this interest, ordered by year
        $basisRecords = OutsideBasis::with('adjustments')
            ->where('ownership_interest_id', $interest->id)
            ->orderBy('tax_year')
            ->get();

        // Determine year range
        $inceptionYear = $interest->inception_basis_year;
        $currentYear = (int) date('Y');
        
        if (!$inceptionYear) {
            // If no inception year, use the earliest basis record or current year - 1
            $inceptionYear = $basisRecords->min('tax_year') ?? ($currentYear - 1);
        }

        $maxYear = max($currentYear, $basisRecords->max('tax_year') ?? $currentYear);
        if ($targetYear) {
            $maxYear = max($maxYear, $targetYear);
        }

        $basisWalk = [];
        $priorEndingBasis = null;

        // Build basis walk for each year from inception to current
        for ($year = $inceptionYear; $year <= $maxYear; $year++) {
            $record = $basisRecords->firstWhere('tax_year', $year);
            
            // Calculate starting basis
            $startingBasis = $priorEndingBasis;
            if ($year === $inceptionYear) {
                // First year: use inception basis total
                $startingBasis = $interest->inception_basis_total !== null 
                    ? (float) $interest->inception_basis_total 
                    : null;
            }

            // Sum adjustments
            $adjustments = $record ? $record->adjustments : collect([]);
            $increases = $adjustments->where('adjustment_category', 'increase')->sum('amount');
            $decreases = $adjustments->where('adjustment_category', 'decrease')->sum('amount');
            $netAdjustment = $increases - $decreases;

            // Get ending basis from record or calculate
            $endingBasis = $record?->ending_ob !== null 
                ? (float) $record->ending_ob 
                : ($startingBasis !== null ? $startingBasis + $netAdjustment : null);

            $basisWalk[$year] = [
                'tax_year' => $year,
                'outside_basis_id' => $record?->id,
                'starting_basis' => $startingBasis,
                'total_increases' => $increases,
                'total_decreases' => $decreases,
                'net_adjustment' => $netAdjustment,
                'ending_basis' => $endingBasis,
                'has_adjustments' => $adjustments->isNotEmpty(),
                'adjustments_count' => $adjustments->count(),
                'record' => $record,
            ];

            // Carry forward ending basis for next year
            $priorEndingBasis = $endingBasis;
        }

        return [
            'inception_year' => $inceptionYear,
            'inception_basis' => $interest->inception_basis_total,
            'walk' => $basisWalk,
        ];
    }

    /**
     * Get adjustment type options for the UI.
     */
    public function adjustmentTypes(): JsonResponse
    {
        return response()->json([
            'increase' => ObAdjustment::INCREASE_TYPES,
            'decrease' => ObAdjustment::DECREASE_TYPES,
        ]);
    }

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

        // Calculate basis walk to get correct starting and ending basis
        $walkData = $this->calculateBasisWalkData($interest, $taxYear);
        $yearData = $walkData['walk'][$taxYear] ?? null;

        return response()->json([
            ...$basis->toArray(),
            'starting_basis' => $yearData['starting_basis'] ?? null,
            'total_increases' => $yearData['total_increases'] ?? 0,
            'total_decreases' => $yearData['total_decreases'] ?? 0,
            'net_adjustment' => $yearData['net_adjustment'] ?? 0,
            'ending_basis' => $yearData['ending_basis'] ?? null,
        ]);
    }

    /**
     * Update outside basis for an ownership interest and tax year.
     */
    public function update(Request $request, OwnershipInterest $interest, int $taxYear): JsonResponse
    {
        $validated = $request->validate([
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
            'adjustment_type_code' => 'nullable|string|max:50',
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

        // Auto-assign sort order if not provided
        if (!isset($validated['sort_order'])) {
            $maxOrder = ObAdjustment::where('outside_basis_id', $basis->id)
                ->where('adjustment_category', $validated['adjustment_category'])
                ->max('sort_order');
            $validated['sort_order'] = ($maxOrder ?? -1) + 1;
        }

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
            'adjustment_type_code' => 'nullable|string|max:50',
            'adjustment_type' => 'nullable|string|max:100',
            'amount' => 'nullable|numeric',
            'description' => 'nullable|string',
            'document_path' => 'nullable|string',
            'document_name' => 'nullable|string',
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
