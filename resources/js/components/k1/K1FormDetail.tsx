import * as React from 'react';
import { useState, useEffect } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { K1Form, K1Company } from '@/types/k1';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Save, Upload } from 'lucide-react';

interface Props {
  companyId: number;
  formId: number;
}

export default function K1FormDetail({ companyId, formId }: Props) {
  const [company, setCompany] = useState<K1Company | null>(null);
  const [form, setForm] = useState<K1Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<K1Form>>({});

  useEffect(() => {
    loadData();
  }, [companyId, formId]);

  const loadData = async () => {
    try {
      const [companyData, formData] = await Promise.all([
        fetchWrapper.get(`/api/companies/${companyId}`),
        fetchWrapper.get(`/api/companies/${companyId}/forms/${formId}`),
      ]);
      setCompany(companyData);
      setForm(formData);
      setFormData(formData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof K1Form, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await fetchWrapper.put(`/api/companies/${companyId}/forms/${formId}`, formData);
      setForm(updated);
      setFormData(updated);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (!form || !company) {
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

  const MoneyInput = ({ label, field, description }: { label: string; field: keyof K1Form; description?: string }) => (
    <div className="grid gap-2">
      <Label htmlFor={field}>{label}</Label>
      <Input
        id={field}
        type="number"
        step="0.01"
        value={formData[field] ?? ''}
        onChange={(e) => handleChange(field, e.target.value || null)}
        className="font-mono"
      />
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );

  const PercentInput = ({ label, field }: { label: string; field: keyof K1Form }) => (
    <div className="grid gap-2">
      <Label htmlFor={field}>{label}</Label>
      <Input
        id={field}
        type="number"
        step="0.0001"
        min="0"
        max="100"
        value={formData[field] ?? ''}
        onChange={(e) => handleChange(field, e.target.value || null)}
        className="font-mono"
      />
    </div>
  );

  const TextInput = ({ label, field, placeholder }: { label: string; field: keyof K1Form; placeholder?: string }) => (
    <div className="grid gap-2">
      <Label htmlFor={field}>{label}</Label>
      <Input
        id={field}
        value={(formData[field] as string) ?? ''}
        onChange={(e) => handleChange(field, e.target.value || null)}
        placeholder={placeholder}
      />
    </div>
  );

  const CheckboxInput = ({ label, field }: { label: string; field: keyof K1Form }) => (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={field}
        checked={!!formData[field]}
        onCheckedChange={(checked) => handleChange(field, checked)}
      />
      <Label htmlFor={field} className="text-sm font-normal">{label}</Label>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/" className="hover:text-foreground">Companies</a>
        <ChevronRight className="h-4 w-4" />
        <a href={`/company/${companyId}`} className="hover:text-foreground">{company.name}</a>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Tax Year {form.tax_year}</span>
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
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Tabs for different K-1 sections */}
      <Tabs defaultValue="partnership" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="partnership">Part I</TabsTrigger>
          <TabsTrigger value="partner">Part II</TabsTrigger>
          <TabsTrigger value="income">Part III</TabsTrigger>
          <TabsTrigger value="basis">Outside Basis</TabsTrigger>
          <TabsTrigger value="losses">Losses</TabsTrigger>
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
                <TextInput label="Partnership Name (Box A)" field="partnership_name" />
                <TextInput label="Partnership EIN" field="partnership_ein" placeholder="XX-XXXXXXX" />
              </div>
              <TextInput label="Partnership Address" field="partnership_address" />
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="partnership_tax_year_begin">Tax Year Begin</Label>
                  <Input
                    id="partnership_tax_year_begin"
                    type="date"
                    value={(formData.partnership_tax_year_begin as string)?.split('T')[0] ?? ''}
                    onChange={(e) => handleChange('partnership_tax_year_begin', e.target.value || null)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="partnership_tax_year_end">Tax Year End</Label>
                  <Input
                    id="partnership_tax_year_end"
                    type="date"
                    value={(formData.partnership_tax_year_end as string)?.split('T')[0] ?? ''}
                    onChange={(e) => handleChange('partnership_tax_year_end', e.target.value || null)}
                  />
                </div>
                <TextInput label="IRS Center (Box B)" field="irs_center" />
              </div>
              <CheckboxInput label="Publicly Traded Partnership (Box C)" field="is_publicly_traded" />
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
                  <TextInput label="Partner Name (Box E)" field="partner_name" />
                  <TextInput label="Partner SSN/EIN (Box D)" field="partner_ssn_ein" />
                </div>
                <TextInput label="Partner Address" field="partner_address" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Partner Type (Box F)</Label>
                    <div className="space-y-2">
                      <CheckboxInput label="General Partner" field="is_general_partner" />
                      <CheckboxInput label="Limited Partner" field="is_limited_partner" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Domestic/Foreign (Box G)</Label>
                    <div className="space-y-2">
                      <CheckboxInput label="Domestic Partner" field="is_domestic_partner" />
                      <CheckboxInput label="Foreign Partner" field="is_foreign_partner" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <TextInput label="Entity Type Code (Box I1)" field="entity_type_code" />
                  <div className="col-span-2 space-y-2">
                    <CheckboxInput label="Disregarded Entity (Box H)" field="is_disregarded_entity" />
                    <CheckboxInput label="IRA/Retirement Plan (Box I2)" field="is_retirement_plan" />
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
                  <PercentInput label="" field="share_of_profit_beginning" />
                  <PercentInput label="" field="share_of_profit_ending" />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <Label className="self-center">Loss</Label>
                  <PercentInput label="" field="share_of_loss_beginning" />
                  <PercentInput label="" field="share_of_loss_ending" />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <Label className="self-center">Capital</Label>
                  <PercentInput label="" field="share_of_capital_beginning" />
                  <PercentInput label="" field="share_of_capital_ending" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Box K - Partner's Share of Liabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <MoneyInput label="Nonrecourse" field="nonrecourse_liabilities" />
                  <MoneyInput label="Qualified Nonrecourse Financing" field="qualified_nonrecourse_financing" />
                  <MoneyInput label="Recourse" field="recourse_liabilities" />
                  <MoneyInput label="Total Liabilities" field="total_liabilities" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Box L - Partner's Capital Account Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <MoneyInput label="Beginning Capital Account" field="beginning_capital_account" />
                  <MoneyInput label="Capital Contributed" field="capital_contributed" />
                  <MoneyInput label="Current Year Income (Loss)" field="current_year_income_loss" />
                  <MoneyInput label="Withdrawals & Distributions" field="withdrawals_distributions" />
                  <MoneyInput label="Other Increase (Decrease)" field="other_increase_decrease" />
                  <MoneyInput label="Ending Capital Account" field="ending_capital_account" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Capital Account Method</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <CheckboxInput label="Tax Basis" field="capital_account_tax_basis" />
                    <CheckboxInput label="GAAP" field="capital_account_gaap" />
                    <CheckboxInput label="Section 704(b)" field="capital_account_section_704b" />
                    <CheckboxInput label="Other" field="capital_account_other" />
                  </div>
                  {formData.capital_account_other && (
                    <TextInput label="Other Method Description" field="capital_account_other_description" />
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
                  <MoneyInput label="Box 1 - Ordinary Business Income (Loss)" field="box_1_ordinary_income" />
                  <MoneyInput label="Box 2 - Net Rental Real Estate Income (Loss)" field="box_2_net_rental_real_estate" />
                  <MoneyInput label="Box 3 - Other Net Rental Income (Loss)" field="box_3_other_net_rental" />
                  <MoneyInput label="Box 4a - Guaranteed Payments (Services)" field="box_4a_guaranteed_payments_services" />
                  <MoneyInput label="Box 4b - Guaranteed Payments (Capital)" field="box_4b_guaranteed_payments_capital" />
                  <MoneyInput label="Box 4c - Guaranteed Payments (Total)" field="box_4c_guaranteed_payments_total" />
                  <MoneyInput label="Box 5 - Interest Income" field="box_5_interest_income" />
                  <MoneyInput label="Box 6a - Ordinary Dividends" field="box_6a_ordinary_dividends" />
                  <MoneyInput label="Box 6b - Qualified Dividends" field="box_6b_qualified_dividends" />
                  <MoneyInput label="Box 6c - Dividend Equivalents" field="box_6c_dividend_equivalents" />
                  <MoneyInput label="Box 7 - Royalties" field="box_7_royalties" />
                  <MoneyInput label="Box 8 - Net Short-Term Capital Gain (Loss)" field="box_8_net_short_term_capital_gain" />
                  <MoneyInput label="Box 9a - Net Long-Term Capital Gain (Loss)" field="box_9a_net_long_term_capital_gain" />
                  <MoneyInput label="Box 9b - Collectibles (28%) Gain (Loss)" field="box_9b_collectibles_gain" />
                  <MoneyInput label="Box 9c - Unrecaptured Section 1250 Gain" field="box_9c_unrecaptured_1250_gain" />
                  <MoneyInput label="Box 10 - Net Section 1231 Gain (Loss)" field="box_10_net_section_1231_gain" />
                  <MoneyInput label="Box 12 - Section 179 Deduction" field="box_12_section_179_deduction" />
                  <MoneyInput label="Box 14 - Self-Employment Earnings" field="box_14_self_employment_earnings" />
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
                    value={(formData.box_11_other_income as string) ?? ''}
                    onChange={(e) => handleChange('box_11_other_income', e.target.value || null)}
                    placeholder="e.g., Code A: $1,000, Code B: $500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="box_13_other_deductions">Box 13 - Other Deductions</Label>
                  <Textarea
                    id="box_13_other_deductions"
                    value={(formData.box_13_other_deductions as string) ?? ''}
                    onChange={(e) => handleChange('box_13_other_deductions', e.target.value || null)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="box_20_other_info">Box 20 - Other Information</Label>
                  <Textarea
                    id="box_20_other_info"
                    value={(formData.box_20_other_info as string) ?? ''}
                    onChange={(e) => handleChange('box_20_other_info', e.target.value || null)}
                    placeholder="Code Z, AH, etc."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Outside Basis */}
        <TabsContent value="basis">
          <Card>
            <CardHeader>
              <CardTitle>Outside Basis Tracking</CardTitle>
              <CardDescription>
                Track your tax basis in the partnership interest for loss limitation purposes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Outside basis tracking is available in the detailed view.
                <br />
                <a href={`/company/${companyId}/k1/${formId}/basis`} className="text-primary hover:underline">
                  Go to Outside Basis →
                </a>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loss Limitations */}
        <TabsContent value="losses">
          <Card>
            <CardHeader>
              <CardTitle>Loss Limitations & Carryforwards</CardTitle>
              <CardDescription>
                Track suspended losses and limitation calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Loss limitation tracking is available in the detailed view.
                <br />
                <a href={`/company/${companyId}/k1/${formId}/losses`} className="text-primary hover:underline">
                  Go to Loss Limitations →
                </a>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={(formData.notes as string) ?? ''}
            onChange={(e) => handleChange('notes', e.target.value || null)}
            placeholder="Add any notes about this K-1 form..."
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
}
