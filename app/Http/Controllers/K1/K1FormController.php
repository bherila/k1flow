<?php

namespace App\Http\Controllers\K1;

use App\Http\Controllers\Controller;
use App\Models\K1\K1Company;
use App\Models\K1\K1Form;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class K1FormController extends Controller
{
    /**
     * Display a listing of K-1 forms for a company.
     */
    public function index(K1Company $company): JsonResponse
    {
        $forms = $company->k1Forms()
            ->with(['outsideBasis', 'lossLimitations'])
            ->orderBy('tax_year', 'desc')
            ->get();

        return response()->json($forms);
    }

    /**
     * Store a newly created K-1 form.
     */
    public function store(Request $request, K1Company $company): JsonResponse
    {
        $validated = $request->validate([
            'tax_year' => 'required|integer|min:1900|max:2100|unique:k1_forms,tax_year,NULL,id,company_id,' . $company->id,
            // Part I
            'partnership_name' => 'nullable|string|max:255',
            'partnership_address' => 'nullable|string|max:500',
            'partnership_ein' => 'nullable|string|max:20',
            'partnership_tax_year_begin' => 'nullable|date',
            'partnership_tax_year_end' => 'nullable|date',
            'irs_center' => 'nullable|string|max:100',
            'is_publicly_traded' => 'nullable|boolean',
            // Part II
            'partner_ssn_ein' => 'nullable|string|max:20',
            'partner_name' => 'nullable|string|max:255',
            'partner_address' => 'nullable|string|max:500',
            'is_general_partner' => 'nullable|boolean',
            'is_limited_partner' => 'nullable|boolean',
            'is_domestic_partner' => 'nullable|boolean',
            'is_foreign_partner' => 'nullable|boolean',
            'is_disregarded_entity' => 'nullable|boolean',
            'entity_type_code' => 'nullable|string|max:10',
            'is_retirement_plan' => 'nullable|boolean',
            // Share percentages
            'share_of_profit_beginning' => 'nullable|numeric|min:0|max:100',
            'share_of_profit_ending' => 'nullable|numeric|min:0|max:100',
            'share_of_loss_beginning' => 'nullable|numeric|min:0|max:100',
            'share_of_loss_ending' => 'nullable|numeric|min:0|max:100',
            'share_of_capital_beginning' => 'nullable|numeric|min:0|max:100',
            'share_of_capital_ending' => 'nullable|numeric|min:0|max:100',
            // Liabilities
            'nonrecourse_liabilities' => 'nullable|numeric',
            'qualified_nonrecourse_financing' => 'nullable|numeric',
            'recourse_liabilities' => 'nullable|numeric',
            'total_liabilities' => 'nullable|numeric',
            // Capital account
            'beginning_capital_account' => 'nullable|numeric',
            'capital_contributed' => 'nullable|numeric',
            'current_year_income_loss' => 'nullable|numeric',
            'withdrawals_distributions' => 'nullable|numeric',
            'other_increase_decrease' => 'nullable|numeric',
            'ending_capital_account' => 'nullable|numeric',
            'capital_account_tax_basis' => 'nullable|boolean',
            'capital_account_gaap' => 'nullable|boolean',
            'capital_account_section_704b' => 'nullable|boolean',
            'capital_account_other' => 'nullable|boolean',
            'capital_account_other_description' => 'nullable|string|max:255',
            // Part III boxes (major ones)
            'box_1_ordinary_income' => 'nullable|numeric',
            'box_2_net_rental_real_estate' => 'nullable|numeric',
            'box_3_other_net_rental' => 'nullable|numeric',
            'box_4a_guaranteed_payments_services' => 'nullable|numeric',
            'box_4b_guaranteed_payments_capital' => 'nullable|numeric',
            'box_4c_guaranteed_payments_total' => 'nullable|numeric',
            'box_5_interest_income' => 'nullable|numeric',
            'box_6a_ordinary_dividends' => 'nullable|numeric',
            'box_6b_qualified_dividends' => 'nullable|numeric',
            'box_6c_dividend_equivalents' => 'nullable|numeric',
            'box_7_royalties' => 'nullable|numeric',
            'box_8_net_short_term_capital_gain' => 'nullable|numeric',
            'box_9a_net_long_term_capital_gain' => 'nullable|numeric',
            'box_9b_collectibles_gain' => 'nullable|numeric',
            'box_9c_unrecaptured_1250_gain' => 'nullable|numeric',
            'box_10_net_section_1231_gain' => 'nullable|numeric',
            'box_11_other_income' => 'nullable|string',
            'box_12_section_179_deduction' => 'nullable|numeric',
            'box_13_other_deductions' => 'nullable|string',
            'box_14_self_employment_earnings' => 'nullable|numeric',
            'box_15_credits' => 'nullable|string',
            'box_16_foreign_transactions' => 'nullable|string',
            'box_17_amt_items' => 'nullable|string',
            'box_18_tax_exempt_income' => 'nullable|string',
            'box_19_distributions' => 'nullable|string',
            'box_20_other_info' => 'nullable|string',
            'box_21_foreign_taxes_paid' => 'nullable|string',
            'box_22_more_info' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $validated['company_id'] = $company->id;
        $form = K1Form::create($validated);

        return response()->json($form, 201);
    }

    /**
     * Display the specified K-1 form.
     */
    public function show(K1Company $company, K1Form $form): JsonResponse
    {
        // Ensure the form belongs to the company
        if ($form->company_id !== $company->id) {
            abort(404);
        }

        $form->load(['incomeSources', 'outsideBasis.adjustments', 'lossLimitations', 'lossCarryforwards']);

        return response()->json($form);
    }

    /**
     * Update the specified K-1 form.
     */
    public function update(Request $request, K1Company $company, K1Form $form): JsonResponse
    {
        if ($form->company_id !== $company->id) {
            abort(404);
        }

        $validated = $request->validate([
            'tax_year' => 'sometimes|required|integer|min:1900|max:2100|unique:k1_forms,tax_year,' . $form->id . ',id,company_id,' . $company->id,
            // All other fields same as store...
            'partnership_name' => 'nullable|string|max:255',
            'partnership_address' => 'nullable|string|max:500',
            'partnership_ein' => 'nullable|string|max:20',
            'partnership_tax_year_begin' => 'nullable|date',
            'partnership_tax_year_end' => 'nullable|date',
            'irs_center' => 'nullable|string|max:100',
            'is_publicly_traded' => 'nullable|boolean',
            'partner_ssn_ein' => 'nullable|string|max:20',
            'partner_name' => 'nullable|string|max:255',
            'partner_address' => 'nullable|string|max:500',
            'is_general_partner' => 'nullable|boolean',
            'is_limited_partner' => 'nullable|boolean',
            'is_domestic_partner' => 'nullable|boolean',
            'is_foreign_partner' => 'nullable|boolean',
            'is_disregarded_entity' => 'nullable|boolean',
            'entity_type_code' => 'nullable|string|max:10',
            'is_retirement_plan' => 'nullable|boolean',
            'share_of_profit_beginning' => 'nullable|numeric|min:0|max:100',
            'share_of_profit_ending' => 'nullable|numeric|min:0|max:100',
            'share_of_loss_beginning' => 'nullable|numeric|min:0|max:100',
            'share_of_loss_ending' => 'nullable|numeric|min:0|max:100',
            'share_of_capital_beginning' => 'nullable|numeric|min:0|max:100',
            'share_of_capital_ending' => 'nullable|numeric|min:0|max:100',
            'nonrecourse_liabilities' => 'nullable|numeric',
            'qualified_nonrecourse_financing' => 'nullable|numeric',
            'recourse_liabilities' => 'nullable|numeric',
            'total_liabilities' => 'nullable|numeric',
            'beginning_capital_account' => 'nullable|numeric',
            'capital_contributed' => 'nullable|numeric',
            'current_year_income_loss' => 'nullable|numeric',
            'withdrawals_distributions' => 'nullable|numeric',
            'other_increase_decrease' => 'nullable|numeric',
            'ending_capital_account' => 'nullable|numeric',
            'capital_account_tax_basis' => 'nullable|boolean',
            'capital_account_gaap' => 'nullable|boolean',
            'capital_account_section_704b' => 'nullable|boolean',
            'capital_account_other' => 'nullable|boolean',
            'capital_account_other_description' => 'nullable|string|max:255',
            'box_1_ordinary_income' => 'nullable|numeric',
            'box_2_net_rental_real_estate' => 'nullable|numeric',
            'box_3_other_net_rental' => 'nullable|numeric',
            'box_4a_guaranteed_payments_services' => 'nullable|numeric',
            'box_4b_guaranteed_payments_capital' => 'nullable|numeric',
            'box_4c_guaranteed_payments_total' => 'nullable|numeric',
            'box_5_interest_income' => 'nullable|numeric',
            'box_6a_ordinary_dividends' => 'nullable|numeric',
            'box_6b_qualified_dividends' => 'nullable|numeric',
            'box_6c_dividend_equivalents' => 'nullable|numeric',
            'box_7_royalties' => 'nullable|numeric',
            'box_8_net_short_term_capital_gain' => 'nullable|numeric',
            'box_9a_net_long_term_capital_gain' => 'nullable|numeric',
            'box_9b_collectibles_gain' => 'nullable|numeric',
            'box_9c_unrecaptured_1250_gain' => 'nullable|numeric',
            'box_10_net_section_1231_gain' => 'nullable|numeric',
            'box_11_other_income' => 'nullable|string',
            'box_12_section_179_deduction' => 'nullable|numeric',
            'box_13_other_deductions' => 'nullable|string',
            'box_14_self_employment_earnings' => 'nullable|numeric',
            'box_15_credits' => 'nullable|string',
            'box_16_foreign_transactions' => 'nullable|string',
            'box_17_amt_items' => 'nullable|string',
            'box_18_tax_exempt_income' => 'nullable|string',
            'box_19_distributions' => 'nullable|string',
            'box_20_other_info' => 'nullable|string',
            'box_21_foreign_taxes_paid' => 'nullable|string',
            'box_22_more_info' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $form->update($validated);

        return response()->json($form);
    }

    /**
     * Remove the specified K-1 form.
     */
    public function destroy(K1Company $company, K1Form $form): JsonResponse
    {
        if ($form->company_id !== $company->id) {
            abort(404);
        }

        $form->delete();

        return response()->json(null, 204);
    }

    /**
     * Upload a K-1 form PDF.
     */
    public function uploadForm(Request $request, K1Company $company, K1Form $form): JsonResponse
    {
        if ($form->company_id !== $company->id) {
            abort(404);
        }

        $request->validate([
            'file' => 'required|file|mimes:pdf|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store("k1-forms/{$company->id}/{$form->tax_year}", 'private');

        // Delete old file if exists
        if ($form->form_file_path) {
            Storage::disk('private')->delete($form->form_file_path);
        }

        $form->update([
            'form_file_path' => $path,
            'form_file_name' => $file->getClientOriginalName(),
        ]);

        return response()->json([
            'message' => 'File uploaded successfully',
            'file_name' => $form->form_file_name,
        ]);
    }
}
