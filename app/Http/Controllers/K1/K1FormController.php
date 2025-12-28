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
        
        // Default tax year begin/end if not provided
        if (empty($validated['partnership_tax_year_begin'])) {
            $validated['partnership_tax_year_begin'] = $validated['tax_year'] . '-01-01';
        }
        if (empty($validated['partnership_tax_year_end'])) {
            $validated['partnership_tax_year_end'] = $validated['tax_year'] . '-12-31';
        }
        
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

    /**
     * Extract K-1 data from an uploaded PDF using Gemini API.
     */
    public function extractFromPdf(Request $request, K1Company $company, K1Form $form): JsonResponse
    {
        if ($form->company_id !== $company->id) {
            abort(404);
        }

        $request->validate([
            'pdf' => 'required|file|mimes:pdf|max:10240',
        ]);

        $apiKey = config('services.gemini.api_key');
        if (empty($apiKey)) {
            return response()->json([
                'error' => 'Gemini API key not configured. Set GEMINI_API_KEY in .env',
            ], 500);
        }

        $file = $request->file('pdf');
        $pdfContent = base64_encode(file_get_contents($file->path()));

        // Construct the Gemini API request
        $prompt = <<<PROMPT
You are an expert tax document processor. Extract all data from this IRS Schedule K-1 (Form 1065) PDF document.

Return the extracted data as a JSON object with the following structure. Use null for any fields that are not present or cannot be extracted. For numeric values, return them as numbers without currency formatting. For percentages, return the percentage value (e.g., 50 for 50%).

{
  "partnership_name": "Partnership name from Box A",
  "partnership_address": "Partnership address",
  "partnership_ein": "Partnership EIN (XX-XXXXXXX format)",
  "partnership_tax_year_begin": "YYYY-MM-DD format",
  "partnership_tax_year_end": "YYYY-MM-DD format",
  "irs_center": "IRS Center from Box B",
  "is_publicly_traded": true/false from Box C,
  
  "partner_ssn_ein": "Partner SSN/EIN from Box D",
  "partner_name": "Partner name from Box E",
  "partner_address": "Partner address",
  "is_general_partner": true/false from Box F,
  "is_limited_partner": true/false from Box F,
  "is_domestic_partner": true/false from Box G,
  "is_foreign_partner": true/false from Box G,
  "is_disregarded_entity": true/false from Box H,
  "entity_type_code": "Entity type code from Box I1",
  "is_retirement_plan": true/false from Box I2,
  
  "share_of_profit_beginning": percentage from Box J,
  "share_of_profit_ending": percentage from Box J,
  "share_of_loss_beginning": percentage from Box J,
  "share_of_loss_ending": percentage from Box J,
  "share_of_capital_beginning": percentage from Box J,
  "share_of_capital_ending": percentage from Box J,
  
  "nonrecourse_liabilities": number from Box K,
  "qualified_nonrecourse_financing": number from Box K,
  "recourse_liabilities": number from Box K,
  "total_liabilities": number from Box K (sum or stated total),
  
  "beginning_capital_account": number from Box L,
  "capital_contributed": number from Box L,
  "current_year_income_loss": number from Box L,
  "withdrawals_distributions": number from Box L,
  "other_increase_decrease": number from Box L,
  "ending_capital_account": number from Box L,
  "capital_account_tax_basis": true/false from Box L method checkbox,
  "capital_account_gaap": true/false from Box L method checkbox,
  "capital_account_section_704b": true/false from Box L method checkbox,
  "capital_account_other": true/false from Box L method checkbox,
  
  "box_1_ordinary_income": number from Box 1,
  "box_2_net_rental_real_estate": number from Box 2,
  "box_3_other_net_rental": number from Box 3,
  "box_4a_guaranteed_payments_services": number from Box 4a,
  "box_4b_guaranteed_payments_capital": number from Box 4b,
  "box_4c_guaranteed_payments_total": number from Box 4c,
  "box_5_interest_income": number from Box 5,
  "box_6a_ordinary_dividends": number from Box 6a,
  "box_6b_qualified_dividends": number from Box 6b,
  "box_6c_dividend_equivalents": number from Box 6c,
  "box_7_royalties": number from Box 7,
  "box_8_net_short_term_capital_gain": number from Box 8,
  "box_9a_net_long_term_capital_gain": number from Box 9a,
  "box_9b_collectibles_gain": number from Box 9b,
  "box_9c_unrecaptured_1250_gain": number from Box 9c,
  "box_10_net_section_1231_gain": number from Box 10,
  "box_11_other_income": "Text/JSON for Box 11 codes and amounts",
  "box_12_section_179_deduction": number from Box 12,
  "box_13_other_deductions": "Text/JSON for Box 13 codes and amounts",
  "box_14_self_employment_earnings": number from Box 14,
  "box_15_credits": "Text/JSON for Box 15 codes and amounts",
  "box_16_foreign_transactions": "Text/JSON for Box 16 codes and amounts",
  "box_17_amt_items": "Text/JSON for Box 17 codes and amounts",
  "box_18_tax_exempt_income": "Text/JSON for Box 18 codes and amounts",
  "box_19_distributions": "Text/JSON for Box 19 codes and amounts",
  "box_20_other_info": "Text/JSON for Box 20 codes and amounts",
  "box_21_foreign_taxes_paid": "Text/JSON for Box 21",
  "box_22_more_info": "Text/JSON for Box 22"
}

Return ONLY the JSON object, no additional text or markdown formatting.
PROMPT;

        try {
            // Call Gemini 2.5 Flash API
            $response = \Illuminate\Support\Facades\Http::timeout(120)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={$apiKey}", [
                    'contents' => [
                        [
                            'parts' => [
                                [
                                    'inline_data' => [
                                        'mime_type' => 'application/pdf',
                                        'data' => $pdfContent,
                                    ],
                                ],
                                [
                                    'text' => $prompt,
                                ],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.1,
                        'maxOutputTokens' => 8192,
                    ],
                ]);

            if (!$response->successful()) {
                \Log::error('Gemini API error', ['response' => $response->body()]);
                return response()->json([
                    'error' => 'Failed to extract data from PDF',
                    'details' => $response->json(),
                ], 500);
            }

            $responseData = $response->json();
            $extractedText = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? '';

            // Clean up the response - remove markdown code blocks if present
            $extractedText = preg_replace('/^```json\s*/i', '', $extractedText);
            $extractedText = preg_replace('/\s*```$/i', '', $extractedText);
            $extractedText = trim($extractedText);

            $extractedData = json_decode($extractedText, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                \Log::error('Failed to parse Gemini response as JSON', ['text' => $extractedText]);
                return response()->json([
                    'error' => 'Failed to parse extracted data',
                    'raw_response' => $extractedText,
                ], 500);
            }

            // Filter out null values to only return extracted fields
            $extractedData = array_filter($extractedData, fn($v) => $v !== null);

            // Also save the uploaded PDF
            $path = $file->store("k1-forms/{$company->id}/{$form->tax_year}", 'private');
            if ($form->form_file_path) {
                Storage::disk('private')->delete($form->form_file_path);
            }
            $form->update([
                'form_file_path' => $path,
                'form_file_name' => $file->getClientOriginalName(),
            ]);

            return response()->json([
                'message' => 'Data extracted successfully',
                'extracted_data' => $extractedData,
            ]);

        } catch (\Exception $e) {
            \Log::error('PDF extraction error', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to process PDF: ' . $e->getMessage(),
            ], 500);
        }
    }
}
