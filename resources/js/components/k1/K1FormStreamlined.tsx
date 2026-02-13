import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fetchWrapper } from '@/fetchWrapper';
import type { K1Form, OwnershipInterest } from '@/types/k1';

interface Props {
  interestId: number;
}

// Define field metadata for display
interface K1FieldMeta {
  key: keyof K1Form;
  label: string;
  type: 'text' | 'number' | 'percent' | 'money' | 'boolean' | 'textarea' | 'date';
}

// All K1 fields organized by section
const K1_FIELDS: { [section: string]: K1FieldMeta[] } = {
  'Part I - Partnership Information': [
    { key: 'partnership_name', label: 'Partnership Name', type: 'text' },
    { key: 'partnership_ein', label: 'Partnership EIN', type: 'text' },
    { key: 'partnership_address', label: 'Partnership Address', type: 'text' },
    { key: 'partnership_tax_year_begin', label: 'Tax Year Begin', type: 'date' },
    { key: 'partnership_tax_year_end', label: 'Tax Year End', type: 'date' },
    { key: 'irs_center', label: 'IRS Center', type: 'text' },
    { key: 'is_publicly_traded', label: 'Publicly Traded?', type: 'boolean' },
  ],
  'Part II - Partner Information': [
    { key: 'partner_ssn_ein', label: 'Partner SSN/EIN', type: 'text' },
    { key: 'partner_name', label: 'Partner Name', type: 'text' },
    { key: 'partner_address', label: 'Partner Address', type: 'text' },
    { key: 'is_general_partner', label: 'General Partner?', type: 'boolean' },
    { key: 'is_limited_partner', label: 'Limited Partner?', type: 'boolean' },
    { key: 'is_domestic_partner', label: 'Domestic Partner?', type: 'boolean' },
    { key: 'is_foreign_partner', label: 'Foreign Partner?', type: 'boolean' },
    { key: 'is_disregarded_entity', label: 'Disregarded Entity?', type: 'boolean' },
    { key: 'entity_type_code', label: 'Entity Type Code', type: 'text' },
    { key: 'is_retirement_plan', label: 'Retirement Plan?', type: 'boolean' },
  ],
  'Part II - Box J - Share of Profit, Loss, and Capital': [
    { key: 'share_of_profit_beginning', label: 'Profit % (Beginning)', type: 'percent' },
    { key: 'share_of_profit_ending', label: 'Profit % (Ending)', type: 'percent' },
    { key: 'share_of_loss_beginning', label: 'Loss % (Beginning)', type: 'percent' },
    { key: 'share_of_loss_ending', label: 'Loss % (Ending)', type: 'percent' },
    { key: 'share_of_capital_beginning', label: 'Capital % (Beginning)', type: 'percent' },
    { key: 'share_of_capital_ending', label: 'Capital % (Ending)', type: 'percent' },
  ],
  'Part II - Box K - Partner\'s Share of Liabilities': [
    { key: 'nonrecourse_liabilities', label: 'Nonrecourse Liabilities', type: 'money' },
    { key: 'qualified_nonrecourse_financing', label: 'Qualified Nonrecourse Financing', type: 'money' },
    { key: 'recourse_liabilities', label: 'Recourse Liabilities', type: 'money' },
    { key: 'total_liabilities', label: 'Total Liabilities', type: 'money' },
  ],
  'Part II - Box L - Partner\'s Capital Account Analysis': [
    { key: 'beginning_capital_account', label: 'Beginning Capital Account', type: 'money' },
    { key: 'capital_contributed', label: 'Capital Contributed', type: 'money' },
    { key: 'current_year_income_loss', label: 'Current Year Income (Loss)', type: 'money' },
    { key: 'withdrawals_distributions', label: 'Withdrawals & Distributions', type: 'money' },
    { key: 'other_increase_decrease', label: 'Other Increase (Decrease)', type: 'money' },
    { key: 'ending_capital_account', label: 'Ending Capital Account', type: 'money' },
    { key: 'capital_account_tax_basis', label: 'Capital Account Method: Tax Basis', type: 'boolean' },
    { key: 'capital_account_gaap', label: 'Capital Account Method: GAAP', type: 'boolean' },
    { key: 'capital_account_section_704b', label: 'Capital Account Method: Section 704(b)', type: 'boolean' },
    { key: 'capital_account_other', label: 'Capital Account Method: Other', type: 'boolean' },
    { key: 'capital_account_other_description', label: 'Capital Account Method: Other Description', type: 'text' },
  ],
  'Part III - Income, Deductions, Credits': [
    { key: 'box_1_ordinary_income', label: 'Box 1 - Ordinary Business Income (Loss)', type: 'money' },
    { key: 'box_2_net_rental_real_estate', label: 'Box 2 - Net Rental Real Estate Income (Loss)', type: 'money' },
    { key: 'box_3_other_net_rental', label: 'Box 3 - Other Net Rental Income (Loss)', type: 'money' },
    { key: 'box_4a_guaranteed_payments_services', label: 'Box 4a - Guaranteed Payments (Services)', type: 'money' },
    { key: 'box_4b_guaranteed_payments_capital', label: 'Box 4b - Guaranteed Payments (Capital)', type: 'money' },
    { key: 'box_4c_guaranteed_payments_total', label: 'Box 4c - Guaranteed Payments (Total)', type: 'money' },
    { key: 'box_5_interest_income', label: 'Box 5 - Interest Income', type: 'money' },
    { key: 'box_6a_ordinary_dividends', label: 'Box 6a - Ordinary Dividends', type: 'money' },
    { key: 'box_6b_qualified_dividends', label: 'Box 6b - Qualified Dividends', type: 'money' },
    { key: 'box_6c_dividend_equivalents', label: 'Box 6c - Dividend Equivalents', type: 'money' },
    { key: 'box_7_royalties', label: 'Box 7 - Royalties', type: 'money' },
    { key: 'box_8_net_short_term_capital_gain', label: 'Box 8 - Net Short-Term Capital Gain (Loss)', type: 'money' },
    { key: 'box_9a_net_long_term_capital_gain', label: 'Box 9a - Net Long-Term Capital Gain (Loss)', type: 'money' },
    { key: 'box_9b_collectibles_gain', label: 'Box 9b - Collectibles (28%) Gain (Loss)', type: 'money' },
    { key: 'box_9c_unrecaptured_1250_gain', label: 'Box 9c - Unrecaptured Section 1250 Gain', type: 'money' },
    { key: 'box_10_net_section_1231_gain', label: 'Box 10 - Net Section 1231 Gain (Loss)', type: 'money' },
    { key: 'box_11_other_income', label: 'Box 11 - Other Income (Loss)', type: 'money' },
    { key: 'box_12_section_179_deduction', label: 'Box 12 - Section 179 Deduction', type: 'money' },
    { key: 'box_13_other_deductions', label: 'Box 13 - Other Deductions', type: 'money' },
    { key: 'box_14_self_employment_earnings', label: 'Box 14 - Self-Employment Earnings', type: 'money' },
    { key: 'box_15_credits', label: 'Box 15 - Credits', type: 'money' },
    { key: 'box_16_foreign_transactions', label: 'Box 16 - Foreign Transactions', type: 'money' },
    { key: 'box_17_amt_items', label: 'Box 17 - Alternative Minimum Tax (AMT) Items', type: 'money' },
    { key: 'box_18_tax_exempt_income', label: 'Box 18 - Tax-Exempt Income', type: 'money' },
    { key: 'box_19_distributions', label: 'Box 19 - Distributions', type: 'money' },
    { key: 'box_20_other_info', label: 'Box 20 - Other Information', type: 'money' },
    { key: 'box_21_foreign_taxes_paid', label: 'Box 21 - Foreign Taxes Paid', type: 'money' },
    { key: 'box_22_more_info', label: 'Box 22 - More Information', type: 'money' },
  ],
  'Notes': [
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
};

export default function K1FormStreamlined({ interestId }: Props) {
  const [interest, setInterest] = useState<OwnershipInterest | null>(null);
  const [loading, setLoading] = useState(true);
  const [readOnly, setReadOnly] = useState(false);

  // Store form data in refs — client state is source of truth.
  // formsDataRef: year -> field values (mutable, not linked to React state)
  const formsDataRef = useRef<Map<number, Partial<K1Form>>>(new Map());

  // Track currently focused cell for navigation
  const cellRefs = useRef<Map<string, HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement>>(new Map());

  const loadData = useCallback(async () => {
    try {
      const [interestResult, formsResult] = await Promise.all([
        fetchWrapper.get(`/api/ownership-interests/${interestId}`),
        fetchWrapper.get(`/api/ownership-interests/${interestId}/k1s`),
      ]);
      setInterest(interestResult);

      // Initialize refs from loaded data
      const dataMap = new Map<number, Partial<K1Form>>();
      formsResult.forEach((form: K1Form) => {
        dataMap.set(form.tax_year, { ...form });
      });
      formsDataRef.current = dataMap;
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [interestId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate years to display
  const years = useMemo(() => {
    if (!interest) return [];

    const currentYear = new Date().getFullYear();
    const startYear = interest.inception_basis_year || currentYear;
    const endYear = interest.effective_to
      ? new Date(interest.effective_to).getFullYear()
      : currentYear;

    const yearsList: number[] = [];
    for (let y = startYear; y <= endYear; y++) {
      yearsList.push(y);
    }
    return yearsList;
  }, [interest]);

  // Get or create form data for a year (reads from ref, no state)
  const getFormForYear = useCallback((year: number): Partial<K1Form> => {
    if (!formsDataRef.current.has(year)) {
      formsDataRef.current.set(year, { tax_year: year, ownership_interest_id: interestId });
    }
    return formsDataRef.current.get(year)!;
  }, [interestId]);

  // Save a single field for a year — runs in background, no re-render on success
  const saveField = useCallback(async (year: number, field: keyof K1Form, value: any) => {
    if (readOnly) return;

    // Update the ref with the new value
    const formData = getFormForYear(year);
    (formData as any)[field] = value;
    formsDataRef.current.set(year, formData);

    const toastId = toast.loading(`Saving ${year}...`);

    try {
      const payload = { tax_year: year, [field]: value };

      const updated = await fetchWrapper.post(`/api/ownership-interests/${interestId}/k1s`, payload);

      // Silently update ref data with server response — no state change, no re-render
      formsDataRef.current.set(year, { ...updated });

      toast.success(`Saved ${year}`, { id: toastId });
    } catch (error) {
      console.error('Failed to save:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred while saving.';
      toast.error(`Failed to save ${field} for ${year}: ${message}`, { id: toastId });
      setReadOnly(true);
    }
  }, [interestId, getFormForYear, readOnly]);

  // Keyboard navigation handlers
  const handleKeyDown = useCallback((
    e: React.KeyboardEvent,
    rowIndex: number,
    colIndex: number,
  ) => {
    const totalRows = Object.values(K1_FIELDS).flat().length;
    const totalCols = years.length;

    let nextRow = rowIndex;
    let nextCol = colIndex;

    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        nextCol = colIndex - 1;
        if (nextCol < 0) {
          nextCol = totalCols - 1;
          nextRow = rowIndex - 1;
          if (nextRow < 0) nextRow = totalRows - 1;
        }
      } else {
        nextCol = colIndex + 1;
        if (nextCol >= totalCols) {
          nextCol = 0;
          nextRow = rowIndex + 1;
          if (nextRow >= totalRows) nextRow = 0;
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      nextRow = rowIndex - 1;
      if (nextRow < 0) nextRow = totalRows - 1;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      nextRow = rowIndex + 1;
      if (nextRow >= totalRows) nextRow = 0;
    } else if (e.key === 'ArrowLeft' && e.ctrlKey) {
      e.preventDefault();
      nextCol = colIndex - 1;
      if (nextCol < 0) nextCol = totalCols - 1;
    } else if (e.key === 'ArrowRight' && e.ctrlKey) {
      e.preventDefault();
      nextCol = colIndex + 1;
      if (nextCol >= totalCols) nextCol = 0;
    } else {
      return;
    }

    const allFields = Object.values(K1_FIELDS).flat();
    if (nextRow >= 0 && nextRow < allFields.length && nextCol >= 0 && nextCol < totalCols) {
      const nextField = allFields[nextRow];
      if (nextField) {
        const nextYear = years[nextCol];
        const cellKey = `${nextYear}-${nextField.key}`;
        const nextCell = cellRefs.current.get(cellKey);
        if (nextCell) {
          nextCell.focus();
        }
      }
    }
  }, [years]);

  // Register cell ref
  const registerCellRef = useCallback((key: string, element: HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | null) => {
    if (element) {
      cellRefs.current.set(key, element);
    } else {
      cellRefs.current.delete(key);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (!interest) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Ownership Interest not found</h2>
        <Button variant="link" onClick={() => window.location.href = '/'}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to companies
        </Button>
      </div>
    );
  }

  const companyName = interest.owned_company?.name || 'Company';

  // Get all fields flattened with section info
  const allFieldsWithSections: Array<{ section: string; field: K1FieldMeta; globalIndex: number }> = [];
  let globalIndex = 0;
  Object.entries(K1_FIELDS).forEach(([section, fields]) => {
    fields.forEach(field => {
      allFieldsWithSections.push({ section, field, globalIndex: globalIndex++ });
    });
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/" className="hover:text-foreground">Companies</a>
        <ChevronRight className="h-4 w-4" />
        {interest.owner_company_id && (
          <>
            <a href={`/company/${interest.owner_company_id}`} className="hover:text-foreground">
              {interest.owner_company?.name || 'Owner'}
            </a>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-foreground">K-1 Multi-Year: {companyName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Schedule K-1 Multi-Year View
          </h1>
          <p className="text-muted-foreground mt-1">
            {companyName} - All Years
          </p>
        </div>
      </div>

      {/* Error alert — shown when save fails, page becomes readonly */}
      {readOnly && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Save Error — Editing Disabled</AlertTitle>
          <AlertDescription>
            A save error occurred. Refresh the page to restore editing.
          </AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation Tips</CardTitle>
          <CardDescription>
            Use Tab/Shift+Tab to move horizontally between years, Up/Down arrows to move vertically between fields.
            Click on a year header to view the single-year K-1 form.
            {readOnly && ' (Editing is currently disabled due to a save error.)'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Multi-year table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-30">
              <tr>
                <th className="p-3 text-left border-b border-r font-semibold min-w-[300px] bg-muted sticky left-0 z-40">
                  Field
                </th>
                {years.map((year) => {
                  return (
                    <th key={year} className="p-3 text-center border-b font-semibold min-w-[150px] bg-muted">
                      <a
                        href={`/ownership/${interestId}/k1/${year}`}
                        className="hover:underline cursor-pointer text-primary"
                        title="Click to view single-year form"
                      >
                        {year}
                      </a>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {allFieldsWithSections.map(({ section, field, globalIndex: gIdx }, rowIndex) => {
                const prevSection = allFieldsWithSections[rowIndex - 1];
                const isFirstInSection = rowIndex === 0 ||
                  (prevSection && prevSection.section !== section);

                return (
                  <React.Fragment key={field.key}>
                    {isFirstInSection && (
                      <tr className="sticky top-[45px] z-20">
                        <td
                          className="p-2 font-semibold text-sm border-b sticky left-0 bg-secondary text-secondary-foreground z-30"
                        >
                          {section}
                        </td>
                        <td
                          colSpan={years.length}
                          className="p-2 border-b bg-secondary"
                        />
                      </tr>
                    )}
                    <tr className="hover:bg-muted/30 group">
                      <td className="p-3 border-b border-r text-sm font-medium sticky left-0 z-10 bg-background group-hover:bg-muted transition-colors">
                        {field.label}
                      </td>
                      {years.map((year, colIndex) => {
                        const formData = getFormForYear(year);
                        const cellKey = `${year}-${field.key}`;
                        const initialValue = formData[field.key];

                        return (
                          <td key={year} className="p-2 border-b">
                            <K1Cell
                              field={field}
                              year={year}
                              initialValue={initialValue}
                              readOnly={readOnly}
                              onSave={(value) => saveField(year, field.key, value)}
                              onKeyDown={(e) => handleKeyDown(e, gIdx, colIndex)}
                              cellRef={(el) => registerCellRef(cellKey, el)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// K1Cell component — fully uncontrolled, manages own local state.
// Saves on blur only. Memoized to prevent re-renders from parent.
interface K1CellProps {
  field: K1FieldMeta;
  year: number;
  initialValue: any;
  readOnly: boolean;
  onSave: (value: any) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  cellRef: (el: HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | null) => void;
}

const K1Cell = React.memo(function K1Cell({
  field,
  year,
  initialValue,
  readOnly,
  onSave,
  onKeyDown,
  cellRef,
}: K1CellProps) {
  // Local state for the cell value — completely independent of parent
  const [localValue, setLocalValue] = useState(initialValue);
  const initialValueRef = useRef(initialValue);

  // Synchronize local state if initialValue changes from parent (e.g. after load)
  useEffect(() => {
    setLocalValue(initialValue);
    initialValueRef.current = initialValue;
  }, [initialValue]);

  // Track whether the value has been modified since focus
  const handleBlur = useCallback(() => {
    // Only save if value actually changed from the initial value loaded
    if (localValue !== initialValueRef.current) {
      initialValueRef.current = localValue;
      onSave(localValue);
    }
  }, [localValue, onSave]);

  if (field.type === 'boolean') {
    const checked = !!localValue;
    return (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={checked}
          disabled={readOnly}
          onCheckedChange={(newChecked) => {
            setLocalValue(newChecked);
            initialValueRef.current = newChecked;
            onSave(newChecked);
          }}
          onKeyDown={onKeyDown}
          ref={cellRef as any}
        />
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <Textarea
        value={(localValue as string) ?? ''}
        readOnly={readOnly}
        onChange={(e) => setLocalValue(e.target.value || null)}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        ref={cellRef as any}
        className="min-h-[60px] text-sm"
      />
    );
  }

  // text, number, money, percent, date
  const inputType = field.type === 'date' ? 'date' :
                    (field.type === 'money' || field.type === 'number' || field.type === 'percent') ? 'number' :
                    'text';
  const step = (field.type === 'money' || field.type === 'number') ? '0.01' :
               field.type === 'percent' ? '0.0001' : undefined;

  // Tax year date optimization: show placeholder for default dates
  let placeholder: string | undefined;
  if (field.key === 'partnership_tax_year_begin') {
    placeholder = `${year}-01-01`;
  } else if (field.key === 'partnership_tax_year_end') {
    placeholder = `${year}-12-31`;
  }

  // For date fields, normalize value for the input
  const displayValue = field.type === 'date'
    ? ((localValue as string)?.substring(0, 10) ?? '')
    : ((localValue as string | number) ?? '');

  return (
    <Input
      type={inputType}
      step={step}
      value={displayValue}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={(e) => setLocalValue(e.target.value || null)}
      onBlur={handleBlur}
      onKeyDown={onKeyDown}
      ref={cellRef as any}
      className="text-sm font-mono"
    />
  );
});
