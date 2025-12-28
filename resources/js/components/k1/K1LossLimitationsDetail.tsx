import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { K1Form, K1Company, K1LossLimitation, K1LossCarryforward, LossType } from '@/types/k1';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  companyId: number;
  formId: number;
}

const LOSS_TYPES: { value: LossType; label: string }[] = [
  { value: 'ordinary', label: 'Ordinary' },
  { value: 'capital_short_term', label: 'Short-Term Capital' },
  { value: 'capital_long_term', label: 'Long-Term Capital' },
  { value: 'section_1231', label: 'Section 1231' },
  { value: 'passive', label: 'Passive' },
  { value: 'at_risk', label: 'At-Risk' },
  { value: 'excess_business_loss', label: 'Excess Business Loss (461(l))' },
  { value: 'other', label: 'Other' },
];

export default function K1LossLimitationsDetail({ companyId, formId }: Props) {
  const [company, setCompany] = useState<K1Company | null>(null);
  const [form, setForm] = useState<K1Form | null>(null);
  const [lossLimitation, setLossLimitation] = useState<K1LossLimitation | null>(null);
  const [carryforwards, setCarryforwards] = useState<K1LossCarryforward[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const formDataRef = useRef<Partial<K1LossLimitation>>({});
  const pendingChangesRef = useRef<Set<keyof K1LossLimitation>>(new Set());

  useEffect(() => {
    loadData();
  }, [companyId, formId]);

  const loadData = async () => {
    try {
      const [companyData, formData, limitationData, carryforwardData] = await Promise.all([
        fetchWrapper.get(`/api/companies/${companyId}`),
        fetchWrapper.get(`/api/companies/${companyId}/forms/${formId}`),
        fetchWrapper.get(`/api/forms/${formId}/loss-limitations`),
        fetchWrapper.get(`/api/forms/${formId}/loss-carryforwards`),
      ]);
      setCompany(companyData);
      setForm(formData);
      setLossLimitation(limitationData);
      setCarryforwards(carryforwardData);
      formDataRef.current = { ...limitationData };
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback((field: keyof K1LossLimitation, value: any) => {
    formDataRef.current = { ...formDataRef.current, [field]: value };
    pendingChangesRef.current.add(field);
  }, []);

  const saveField = useCallback(async (field: keyof K1LossLimitation) => {
    if (!pendingChangesRef.current.has(field)) return;

    setSaveStatus('saving');
    try {
      const payload = { [field]: formDataRef.current[field] };
      const updated = await fetchWrapper.put(`/api/forms/${formId}/loss-limitations`, payload);
      setLossLimitation(updated);
      formDataRef.current = { ...updated };
      pendingChangesRef.current.delete(field);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
      setSaveStatus('error');
    }
  }, [formId]);

  const handleSaveAll = async () => {
    setSaveStatus('saving');
    try {
      const updated = await fetchWrapper.put(`/api/forms/${formId}/loss-limitations`, formDataRef.current);
      setLossLimitation(updated);
      formDataRef.current = { ...updated };
      pendingChangesRef.current.clear();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
      setSaveStatus('error');
    }
  };

  const addCarryforward = async () => {
    try {
      const newCf = await fetchWrapper.post(`/api/forms/${formId}/loss-carryforwards`, {
        loss_type: 'ordinary',
        amount: 0,
      });
      setCarryforwards(prev => [...prev, newCf]);
    } catch (error) {
      console.error('Failed to add carryforward:', error);
    }
  };

  const updateCarryforward = async (id: number, field: string, value: any) => {
    try {
      const updated = await fetchWrapper.put(`/api/forms/${formId}/loss-carryforwards/${id}`, {
        [field]: value,
      });
      setCarryforwards(prev => prev.map(cf => cf.id === id ? updated : cf));
    } catch (error) {
      console.error('Failed to update carryforward:', error);
    }
  };

  const deleteCarryforward = async (id: number) => {
    try {
      await fetchWrapper.delete(`/api/forms/${formId}/loss-carryforwards/${id}`, {});
      setCarryforwards(prev => prev.filter(cf => cf.id !== id));
    } catch (error) {
      console.error('Failed to delete carryforward:', error);
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

  const MoneyInput = ({ label, field, description }: { label: string; field: keyof K1LossLimitation; description?: string }) => (
    <div className="grid gap-2">
      <Label htmlFor={field}>{label}</Label>
      <Input
        id={field}
        type="number"
        step="0.01"
        defaultValue={lossLimitation?.[field] ?? ''}
        onChange={(e) => handleChange(field, e.target.value || null)}
        onBlur={() => saveField(field)}
        className="font-mono"
      />
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
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
        <a href={`/company/${companyId}/k1/${formId}`} className="hover:text-foreground">K-1 {form.tax_year}</a>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Loss Limitations</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loss Limitations & Carryforwards</h1>
          <p className="text-muted-foreground mt-1">
            Track suspended losses and limitation calculations - Tax Year {form.tax_year}
          </p>
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
        <Button onClick={handleSaveAll}>
          <Save className="mr-2 h-4 w-4" />
          Save All
        </Button>
      </div>

      {/* At-Risk Limitations (Form 6198) */}
      <Card>
        <CardHeader>
          <CardTitle>At-Risk Limitations (Form 6198)</CardTitle>
          <CardDescription>IRC Section 465 at-risk limitation calculations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <MoneyInput 
              label="Capital at Risk" 
              field="capital_at_risk" 
              description="Amount you have at risk in the activity"
            />
            <MoneyInput 
              label="At-Risk Deductible" 
              field="at_risk_deductible" 
              description="Losses allowed under at-risk rules"
            />
            <MoneyInput 
              label="At-Risk Carryover" 
              field="at_risk_carryover" 
              description="Suspended losses to carry forward"
            />
          </div>
        </CardContent>
      </Card>

      {/* Passive Activity Limitations (Form 8582) */}
      <Card>
        <CardHeader>
          <CardTitle>Passive Activity Limitations (Form 8582)</CardTitle>
          <CardDescription>IRC Section 469 passive activity loss limitation calculations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <MoneyInput 
              label="Passive Activity Loss" 
              field="passive_activity_loss" 
              description="Total passive losses from this activity"
            />
            <MoneyInput 
              label="Passive Loss Allowed" 
              field="passive_loss_allowed" 
              description="Passive losses allowed this year"
            />
            <MoneyInput 
              label="Passive Loss Carryover" 
              field="passive_loss_carryover" 
              description="Suspended passive losses"
            />
          </div>
        </CardContent>
      </Card>

      {/* Excess Business Loss (Section 461(l)) */}
      <Card>
        <CardHeader>
          <CardTitle>Excess Business Loss Limitation (Section 461(l))</CardTitle>
          <CardDescription>Limitation on excess business losses for noncorporate taxpayers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <MoneyInput 
              label="Excess Business Loss" 
              field="excess_business_loss" 
              description="Aggregate business losses exceeding threshold"
            />
            <MoneyInput 
              label="EBL Carryover" 
              field="excess_business_loss_carryover" 
              description="Treated as NOL carryforward"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loss Carryforwards */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Loss Carryforwards</CardTitle>
              <CardDescription>Suspended losses by type and character</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addCarryforward}>
              <Plus className="h-4 w-4 mr-1" /> Add Carryforward
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {carryforwards.length === 0 ? (
            <p className="text-muted-foreground text-sm">No loss carryforwards recorded.</p>
          ) : (
            <div className="space-y-4">
              {carryforwards.map((cf) => (
                <div key={cf.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs">Loss Type</Label>
                        <Select
                          defaultValue={cf.loss_type}
                          onValueChange={(value) => updateCarryforward(cf.id, 'loss_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LOSS_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Amount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          defaultValue={cf.amount ?? ''}
                          onBlur={(e) => updateCarryforward(cf.id, 'amount', e.target.value || 0)}
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Origination Year</Label>
                        <Input
                          type="number"
                          defaultValue={cf.origination_year ?? ''}
                          onBlur={(e) => updateCarryforward(cf.id, 'origination_year', e.target.value || null)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Utilized This Year</Label>
                        <Input
                          type="number"
                          step="0.01"
                          defaultValue={cf.utilized_current_year ?? ''}
                          onBlur={(e) => updateCarryforward(cf.id, 'utilized_current_year', e.target.value || null)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 ml-2"
                      onClick={() => deleteCarryforward(cf.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Character</Label>
                      <Input
                        defaultValue={cf.character ?? ''}
                        onBlur={(e) => updateCarryforward(cf.id, 'character', e.target.value || null)}
                        placeholder="e.g., Short-term, Long-term, Qualified"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Remaining Carryforward</Label>
                      <Input
                        type="number"
                        step="0.01"
                        defaultValue={cf.remaining_carryforward ?? ''}
                        onBlur={(e) => updateCarryforward(cf.id, 'remaining_carryforward', e.target.value || null)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Input
                      defaultValue={cf.description ?? ''}
                      onBlur={(e) => updateCarryforward(cf.id, 'description', e.target.value || null)}
                      placeholder="Description of this carryforward"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            defaultValue={lossLimitation?.notes ?? ''}
            onChange={(e) => handleChange('notes', e.target.value || null)}
            onBlur={() => saveField('notes')}
            placeholder="Add any notes about loss limitations..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Back to K-1 */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => window.location.href = `/company/${companyId}/k1/${formId}`}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to K-1 Form
        </Button>
      </div>
    </div>
  );
}
