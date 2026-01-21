import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { K1Form, K1Company, OwnershipInterest } from '@/types/k1';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Save, Upload, FileUp, Loader2 } from 'lucide-react';

interface Props {
  interestId: number;
  formId: number;
}

export default function K1FormDetail({ interestId, formId }: Props) {
  const [form, setForm] = useState<K1Form | null>(null);
  const [interest, setInterest] = useState<OwnershipInterest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Use refs for form data to avoid re-rendering on every keystroke
  const formDataRef = useRef<Partial<K1Form>>({});
  const pendingChangesRef = useRef<Set<keyof K1Form>>(new Set());
  
  // PDF upload state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [interestId, formId]);

  const loadData = async () => {
    try {
      const [formDataResult, interestResult] = await Promise.all([
        fetchWrapper.get(`/api/forms/${formId}`),
        fetchWrapper.get(`/api/ownership-interests/${interestId}`),
      ]);
      setForm(formDataResult);
      setInterest(interestResult);
      formDataRef.current = { ...formDataResult };
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save on blur - only saves changed fields
  const saveField = useCallback(async (field: keyof K1Form) => {
    if (!pendingChangesRef.current.has(field)) return;
    
    setSaveStatus('saving');
    setSaving(true);
    try {
      const payload = { [field]: formDataRef.current[field] };
      const updated = await fetchWrapper.put(`/api/forms/${formId}`, payload);
      // Only update the ref, not the state, to prevent re-render and focus loss
      formDataRef.current = { ...updated };
      pendingChangesRef.current.delete(field);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }, [formId]);

  // Handle field change - stores in ref without re-render
  const handleChange = useCallback((field: keyof K1Form, value: any) => {
    formDataRef.current = { ...formDataRef.current, [field]: value };
    pendingChangesRef.current.add(field);
  }, []);

  // Full save for manual trigger
  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('saving');
    try {
      const updated = await fetchWrapper.put(`/api/forms/${formId}`, formDataRef.current);
      setForm(updated);
      formDataRef.current = { ...updated };
      pendingChangesRef.current.clear();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  // PDF upload handler
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress('Uploading PDF...');

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      setUploadProgress('Processing with Gemini AI... This may take a moment.');
      
      const result = await fetchWrapper.post(
        `/api/forms/${formId}/extract-pdf`,
        formData
      );

      if (result.extracted_data) {
        // Merge extracted data with current form
        formDataRef.current = { ...formDataRef.current, ...result.extracted_data };
        setForm(prev => prev ? { ...prev, ...result.extracted_data } : prev);
        setUploadProgress('Data extracted successfully! Review and save.');
        
        // Mark all extracted fields as pending
        Object.keys(result.extracted_data).forEach(key => {
          pendingChangesRef.current.add(key as keyof K1Form);
        });
      }

      // Close modal after success
      setTimeout(() => {
        setUploadModalOpen(false);
        setUploadProgress('');
      }, 2000);
    } catch (error) {
      console.error('Failed to upload/extract PDF:', error);
      setUploadProgress('Failed to extract data. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">K-1 Form not found</h2>
        <Button variant="link" onClick={() => window.location.href = '/'}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to companies
        </Button>
      </div>
    );
  }

  const companyName = interest?.owned_company?.name || 'Company';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/" className="hover:text-foreground">Companies</a>
        <ChevronRight className="h-4 w-4" />
        {interest?.owner_company_id && (
           <>
             <a href={`/company/${interest.owner_company_id}`} className="hover:text-foreground">
                {interest.owner_company?.name || 'Owner'}
             </a>
             <ChevronRight className="h-4 w-4" />
           </>
        )}
        <span className="text-foreground">K-1: {companyName} ({form.tax_year})</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Schedule K-1 - {form.tax_year}
          </h1>
          <p className="text-muted-foreground mt-1">
            Partner's Share of Income, Deductions, Credits, etc.
          </p>
          {/* Auto-save status indicator */}
          {saveStatus === 'saving' && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </p>
          )}
          {saveStatus === 'saved' && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">✓ Saved</p>
          )}
          {saveStatus === 'error' && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">Failed to save</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setUploadModalOpen(true)}>
            <FileUp className="mr-2 h-4 w-4" />
            Import K-1 PDF
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </div>

      {/* PDF Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import K-1 from PDF</DialogTitle>
            <DialogDescription>
              Upload a Schedule K-1 PDF document. Gemini AI will extract the data and populate the form fields.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {uploading ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">{uploadProgress}</p>
              </div>
            ) : (
              <>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click to select a PDF file
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ position: 'relative' }}
                  />
                </div>
                {uploadProgress && (
                  <p className={`text-sm text-center ${uploadProgress.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                    {uploadProgress}
                  </p>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs for different K-1 sections */}
      <Tabs defaultValue="partnership" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="partnership">Part I</TabsTrigger>
          <TabsTrigger value="partner">Part II</TabsTrigger>
          <TabsTrigger value="income">Part III</TabsTrigger>
        </TabsList>

        {/* Part I - Partnership Info */}
        <TabsContent value="partnership">
          <Card>
            <CardHeader>
              <CardTitle>Part I - Information About the Partnership</CardTitle>
              <CardDescription>Partnership identification and tax year information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <TextInput 
                  label="Partnership Name (Box A)" 
                  field="partnership_name" 
                  value={form.partnership_name} 
                  onChange={handleChange} 
                  onSave={saveField} 
                />
                <TextInput 
                  label="Partnership EIN" 
                  field="partnership_ein" 
                  placeholder="XX-XXXXXXX" 
                  value={form.partnership_ein} 
                  onChange={handleChange} 
                  onSave={saveField} 
                />
              </div>
              <TextInput 
                label="Partnership Address" 
                field="partnership_address" 
                value={form.partnership_address} 
                onChange={handleChange} 
                onSave={saveField} 
              />
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="partnership_tax_year_begin">Tax Year Begin</Label>
                  <Input
                    id="partnership_tax_year_begin"
                    type="date"
                    defaultValue={(form.partnership_tax_year_begin as string)?.substring(0, 10) ?? ''}
                    onChange={(e) => handleChange('partnership_tax_year_begin', e.target.value || null)}
                    onBlur={() => saveField('partnership_tax_year_begin')}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="partnership_tax_year_end">Tax Year End</Label>
                  <Input
                    id="partnership_tax_year_end"
                    type="date"
                    defaultValue={(form.partnership_tax_year_end as string)?.substring(0, 10) ?? ''}
                    onChange={(e) => handleChange('partnership_tax_year_end', e.target.value || null)}
                    onBlur={() => saveField('partnership_tax_year_end')}
                  />
                </div>
                <TextInput 
                  label="IRS Center (Box B)" 
                  field="irs_center" 
                  value={form.irs_center} 
                  onChange={handleChange} 
                  onSave={saveField} 
                />
              </div>
              <CheckboxInput 
                label="Publicly Traded Partnership (Box C)" 
                field="is_publicly_traded" 
                value={form.is_publicly_traded} 
                onChange={handleChange} 
                onSave={saveField} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Part II - Partner Info */}
        <TabsContent value="partner">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Part II - Information About the Partner</CardTitle>
                <CardDescription>Partner identification and classification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <TextInput 
                    label="Partner Name (Box E)" 
                    field="partner_name" 
                    value={form.partner_name} 
                    onChange={handleChange} 
                    onSave={saveField} 
                  />
                  <TextInput 
                    label="Partner SSN/EIN (Box D)" 
                    field="partner_ssn_ein" 
                    value={form.partner_ssn_ein} 
                    onChange={handleChange} 
                    onSave={saveField} 
                  />
                </div>
                <TextInput 
                  label="Partner Address" 
                  field="partner_address" 
                  value={form.partner_address} 
                  onChange={handleChange} 
                  onSave={saveField} 
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Partner Type (Box F)</Label>
                    <div className="space-y-2">
                      <CheckboxInput 
                        label="General Partner" 
                        field="is_general_partner" 
                        value={form.is_general_partner} 
                        onChange={handleChange} 
                        onSave={saveField} 
                      />
                      <CheckboxInput 
                        label="Limited Partner" 
                        field="is_limited_partner" 
                        value={form.is_limited_partner} 
                        onChange={handleChange} 
                        onSave={saveField} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Domestic/Foreign (Box G)</Label>
                    <div className="space-y-2">
                      <CheckboxInput 
                        label="Domestic Partner" 
                        field="is_domestic_partner" 
                        value={form.is_domestic_partner} 
                        onChange={handleChange} 
                        onSave={saveField} 
                      />
                      <CheckboxInput 
                        label="Foreign Partner" 
                        field="is_foreign_partner" 
                        value={form.is_foreign_partner} 
                        onChange={handleChange} 
                        onSave={saveField} 
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <TextInput 
                    label="Entity Type Code (Box I1)" 
                    field="entity_type_code" 
                    value={form.entity_type_code} 
                    onChange={handleChange} 
                    onSave={saveField} 
                  />
                  <div className="col-span-2 space-y-2">
                    <CheckboxInput 
                      label="Disregarded Entity (Box H)" 
                      field="is_disregarded_entity" 
                      value={form.is_disregarded_entity} 
                      onChange={handleChange} 
                      onSave={saveField} 
                    />
                    <CheckboxInput 
                      label="IRA/Retirement Plan (Box I2)" 
                      field="is_retirement_plan" 
                      value={form.is_retirement_plan} 
                      onChange={handleChange} 
                      onSave={saveField} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Box J - Partner's Share of Profit, Loss, and Capital</CardTitle>
                <CardDescription>Ownership percentages at beginning and end of year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div></div>
                  <Label className="text-center">Beginning %</Label>
                  <Label className="text-center">Ending %</Label>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <Label className="self-center">Profit</Label>
                  <PercentInput label="" field="share_of_profit_beginning" value={form.share_of_profit_beginning} onChange={handleChange} onSave={saveField} />
                  <PercentInput label="" field="share_of_profit_ending" value={form.share_of_profit_ending} onChange={handleChange} onSave={saveField} />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <Label className="self-center">Loss</Label>
                  <PercentInput label="" field="share_of_loss_beginning" value={form.share_of_loss_beginning} onChange={handleChange} onSave={saveField} />
                  <PercentInput label="" field="share_of_loss_ending" value={form.share_of_loss_ending} onChange={handleChange} onSave={saveField} />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <Label className="self-center">Capital</Label>
                  <PercentInput label="" field="share_of_capital_beginning" value={form.share_of_capital_beginning} onChange={handleChange} onSave={saveField} />
                  <PercentInput label="" field="share_of_capital_ending" value={form.share_of_capital_ending} onChange={handleChange} onSave={saveField} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Box K - Partner's Share of Liabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <MoneyInput label="Nonrecourse" field="nonrecourse_liabilities" value={form.nonrecourse_liabilities} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Qualified Nonrecourse Financing" field="qualified_nonrecourse_financing" value={form.qualified_nonrecourse_financing} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Recourse" field="recourse_liabilities" value={form.recourse_liabilities} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Total Liabilities" field="total_liabilities" value={form.total_liabilities} onChange={handleChange} onSave={saveField} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Box L - Partner's Capital Account Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <MoneyInput label="Beginning Capital Account" field="beginning_capital_account" value={form.beginning_capital_account} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Capital Contributed" field="capital_contributed" value={form.capital_contributed} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Current Year Income (Loss)" field="current_year_income_loss" value={form.current_year_income_loss} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Withdrawals & Distributions" field="withdrawals_distributions" value={form.withdrawals_distributions} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Other Increase (Decrease)" field="other_increase_decrease" value={form.other_increase_decrease} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Ending Capital Account" field="ending_capital_account" value={form.ending_capital_account} onChange={handleChange} onSave={saveField} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Capital Account Method</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <CheckboxInput label="Tax Basis" field="capital_account_tax_basis" value={form.capital_account_tax_basis} onChange={handleChange} onSave={saveField} />
                    <CheckboxInput label="GAAP" field="capital_account_gaap" value={form.capital_account_gaap} onChange={handleChange} onSave={saveField} />
                    <CheckboxInput label="Section 704(b)" field="capital_account_section_704b" value={form.capital_account_section_704b} onChange={handleChange} onSave={saveField} />
                    <CheckboxInput label="Other" field="capital_account_other" value={form.capital_account_other} onChange={handleChange} onSave={saveField} />
                  </div>
                  {form.capital_account_other && (
                    <TextInput label="Other Method Description" field="capital_account_other_description" value={form.capital_account_other_description} onChange={handleChange} onSave={saveField} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Part III - Income/Deductions */}
        <TabsContent value="income">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Part III - Partner's Share of Current Year Income, Deductions, Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <MoneyInput label="Box 1 - Ordinary Business Income (Loss)" field="box_1_ordinary_income" value={form.box_1_ordinary_income} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Box 2 - Net Rental Real Estate Income (Loss)" field="box_2_net_rental_real_estate" value={form.box_2_net_rental_real_estate} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Box 3 - Other Net Rental Income (Loss)" field="box_3_other_net_rental" value={form.box_3_other_net_rental} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Box 4a - Guaranteed Payments (Services)" field="box_4a_guaranteed_payments_services" value={form.box_4a_guaranteed_payments_services} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Box 4b - Guaranteed Payments (Capital)" field="box_4b_guaranteed_payments_capital" value={form.box_4b_guaranteed_payments_capital} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Box 4c - Guaranteed Payments (Total)" field="box_4c_guaranteed_payments_total" value={form.box_4c_guaranteed_payments_total} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Box 5 - Interest Income" field="box_5_interest_income" value={form.box_5_interest_income} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Box 6a - Ordinary Dividends" field="box_6a_ordinary_dividends" value={form.box_6a_ordinary_dividends} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Box 6b - Qualified Dividends" field="box_6b_qualified_dividends" value={form.box_6b_qualified_dividends} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Box 6c - Dividend Equivalents" field="box_6c_dividend_equivalents" value={form.box_6c_dividend_equivalents} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Box 7 - Royalties" field="box_7_royalties" value={form.box_7_royalties} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Box 8 - Net Short-Term Capital Gain (Loss)" field="box_8_net_short_term_capital_gain" value={form.box_8_net_short_term_capital_gain} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Box 9a - Net Long-Term Capital Gain (Loss)" field="box_9a_net_long_term_capital_gain" value={form.box_9a_net_long_term_capital_gain} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Box 9b - Collectibles (28%) Gain (Loss)" field="box_9b_collectibles_gain" value={form.box_9b_collectibles_gain} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Box 9c - Unrecaptured Section 1250 Gain" field="box_9c_unrecaptured_1250_gain" value={form.box_9c_unrecaptured_1250_gain} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Box 10 - Net Section 1231 Gain (Loss)" field="box_10_net_section_1231_gain" value={form.box_10_net_section_1231_gain} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Box 12 - Section 179 Deduction" field="box_12_section_179_deduction" value={form.box_12_section_179_deduction} onChange={handleChange} onSave={saveField} />
                  <MoneyInput label="Box 14 - Self-Employment Earnings" field="box_14_self_employment_earnings" value={form.box_14_self_employment_earnings} onChange={handleChange} onSave={saveField} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Other Items (Text/Coded Entries)</CardTitle>
                <CardDescription>For complex items with multiple codes, enter as text or JSON</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="box_11_other_income">Box 11 - Other Income (Loss)</Label>
                  <Textarea
                    id="box_11_other_income"
                    defaultValue={(form.box_11_other_income as string) ?? ''}
                    onChange={(e) => handleChange('box_11_other_income', e.target.value || null)}
                    onBlur={() => saveField('box_11_other_income')}
                    placeholder="e.g., Code A: $1,000, Code B: $500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="box_13_other_deductions">Box 13 - Other Deductions</Label>
                  <Textarea
                    id="box_13_other_deductions"
                    defaultValue={(form.box_13_other_deductions as string) ?? ''}
                    onChange={(e) => handleChange('box_13_other_deductions', e.target.value || null)}
                    onBlur={() => saveField('box_13_other_deductions')}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="box_20_other_info">Box 20 - Other Information</Label>
                  <Textarea
                    id="box_20_other_info"
                    defaultValue={(form.box_20_other_info as string) ?? ''}
                    onChange={(e) => handleChange('box_20_other_info', e.target.value || null)}
                    onBlur={() => saveField('box_20_other_info')}
                    placeholder="Code Z, AH, etc."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            defaultValue={(form.notes as string) ?? ''}
            onChange={(e) => handleChange('notes', e.target.value || null)}
            onBlur={() => saveField('notes')}
            placeholder="Add any notes about this K-1 form..."
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
}

const MoneyInput = ({ 
  label, 
  field, 
  value,
  onChange,
  onSave,
  description 
}: { 
  label: string; 
  field: keyof K1Form; 
  value: any;
  onChange: (field: keyof K1Form, value: any) => void;
  onSave: (field: keyof K1Form) => void;
  description?: string 
}) => (
  <div className="grid gap-2">
    <Label htmlFor={field}>{label}</Label>
    <Input
      id={field}
      type="number"
      step="0.01"
      defaultValue={(value as string | number | undefined) ?? ''}
      onChange={(e) => onChange(field, e.target.value || null)}
      onBlur={() => onSave(field)}
      className="font-mono"
    />
    {description && <p className="text-xs text-muted-foreground">{description}</p>}
  </div>
);

const PercentInput = ({ 
  label, 
  field,
  value,
  onChange,
  onSave 
}: { 
  label: string; 
  field: keyof K1Form; 
  value: any;
  onChange: (field: keyof K1Form, value: any) => void;
  onSave: (field: keyof K1Form) => void;
}) => (
  <div className="grid gap-2">
    <Label htmlFor={field}>{label}</Label>
    <Input
      id={field}
      type="number"
      step="0.0001"
      min="0"
      max="100"
      defaultValue={(value as string | number | undefined) ?? ''}
      onChange={(e) => onChange(field, e.target.value || null)}
      onBlur={() => onSave(field)}
      className="font-mono"
    />
  </div>
);

const TextInput = ({ 
  label, 
  field, 
  placeholder,
  value,
  onChange,
  onSave
}: { 
  label: string; 
  field: keyof K1Form; 
  placeholder?: string;
  value: any;
  onChange: (field: keyof K1Form, value: any) => void;
  onSave: (field: keyof K1Form) => void;
}) => (
  <div className="grid gap-2">
    <Label htmlFor={field}>{label}</Label>
    <Input
      id={field}
      defaultValue={(value as string) ?? ''}
      onChange={(e) => onChange(field, e.target.value || null)}
      onBlur={() => onSave(field)}
      placeholder={placeholder}
    />
  </div>
);

const CheckboxInput = ({ 
  label, 
  field,
  value,
  onChange,
  onSave 
}: { 
  label: string; 
  field: keyof K1Form; 
  value: any;
  onChange: (field: keyof K1Form, value: any) => void;
  onSave: (field: keyof K1Form) => void;
}) => (
  <div className="flex items-center space-x-2">
    <Checkbox
      id={field}
      defaultChecked={!!value}
      onCheckedChange={(checked) => {
        onChange(field, checked);
        onSave(field);
      }}
    />
    <Label htmlFor={field} className="text-sm font-normal">{label}</Label>
  </div>
);