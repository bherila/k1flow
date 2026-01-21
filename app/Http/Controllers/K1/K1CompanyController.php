<?php

namespace App\Http\Controllers\K1;

use App\Http\Controllers\Controller;
use App\Models\K1\K1Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class K1CompanyController extends Controller
{
    /**
     * Display a listing of companies.
     */
    public function index(): JsonResponse
    {
        $companies = K1Company::withCount('k1Forms')
            ->orderBy('name')
            ->get();

        return response()->json($companies);
    }

    /**
     * Store a newly created company.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'ein' => 'nullable|string|max:20',
            'entity_type' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:2',
            'zip' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
        ]);

        $company = K1Company::create($validated);

        return response()->json($company, 201);
    }

    /**
     * Display the specified company.
     */
    public function show(K1Company $company): JsonResponse
    {
        return response()->json($company);
    }

    /**
     * Update the specified company.
     */
    public function update(Request $request, K1Company $company): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'ein' => 'nullable|string|max:20',
            'entity_type' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:2',
            'zip' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
        ]);

        $company->update($validated);

        return response()->json($company);
    }

    /**
     * Remove the specified company.
     */
    public function destroy(K1Company $company): JsonResponse
    {
        $company->delete();

        return response()->json(null, 204);
    }
}
