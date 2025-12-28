import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { K1Form, K1Company, K1OutsideBasis, K1ObAdjustment } from '@/types/k1';
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

export default function K1OutsideBasisDetail({ companyId, formId }: Props) {
  const [company, setCompany] = useState<K1Company | null>(null);
  const [form, setForm] = useState<K1Form | null>(null);
  const [outsideBasis, setOutsideBasis] = useState<K1OutsideBasis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const formDataRef = useRef<Partial<K1OutsideBasis>>({});
  const pendingChangesRef = useRef<Set<keyof K1OutsideBasis>>(new Set());

  useEffect(() => {
    loadData();
  }, [companyId, formId]);

  const loadData = async () => {
    try {
      const [companyData, formData, basisData] = await Promise.all([
        fetchWrapper.get(`/api/companies/${companyId}`),
        fetchWrapper.get(`/api/companies/${companyId}/forms/${formId}`),
        fetchWrapper.get(`/api/forms/${formId}/outside-basis`),
      ]);
      setCompany(companyData);
      setForm(formData);
      setOutsideBasis(basisData);
      formDataRef.current = { ...basisData };
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback((field: keyof K1OutsideBasis, value: any) => {
    formDataRef.current = { ...formDataRef.current, [field]: value };
    pendingChangesRef.current.add(field);
  }, []);

  const saveField = useCallback(async (field: keyof K1OutsideBasis) => {
    if (!pendingChangesRef.current.has(field)) return;

    setSaveStatus('saving');
    try {
      const payload = { [field]: formDataRef.current[field] };
      const updated = await fetchWrapper.put(`/api/forms/${formId}/outside-basis`, payload);
      setOutsideBasis(updated);
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
      const updated = await fetchWrapper.put(`/api/forms/${formId}/outside-basis`, formDataRef.current);
      setOutsideBasis(updated);
      formDataRef.current = { ...updated };
      pendingChangesRef.current.clear();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
      setSaveStatus('error');
    }
  };

  const addAdjustment = async (category: 'increase' | 'decrease') => {
    try {
      const newAdj = await fetchWrapper.post(`/api/forms/${formId}/outside-basis/adjustments`, {
        adjustment_category: category,
      });
      setOutsideBasis(prev => prev ? {
        ...prev,
        adjustments: [...(prev.adjustments || []), newAdj],
      } : prev);
    } catch (error) {
      console.error('Failed to add adjustment:', error);
    }
  };

  const updateAdjustment = async (id: number, field: string, value: any) => {
    try {
      const updated = await fetchWrapper.put(`/api/forms/${formId}/outside-basis/adjustments/${id}`, {
        [field]: value,
      });
      setOutsideBasis(prev => prev ? {
        ...prev,
        adjustments: (prev.adjustments || []).map(adj => adj.id === id ? updated : adj),
      } : prev);
    } catch (error) {
      console.error('Failed to update adjustment:', error);
    }
  };

  const deleteAdjustment = async (id: number) => {
    try {
      await fetchWrapper.delete(`/api/forms/${formId}/outside-basis/adjustments/${id}`, {});
      setOutsideBasis(prev => prev ? {
        ...prev,
        adjustments: (prev.adjustments || []).filter(adj => adj.id !== id),
      } : prev);
    } catch (error) {
      console.error('Failed to delete adjustment:', error);
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

  const MoneyInput = ({ label, field }: { label: string; field: keyof K1OutsideBasis }) => (
    <div className="grid gap-2">
      <Label htmlFor={field}>{label}</Label>
      <Input
        id={field}
        type="number"
        step="0.01"
        defaultValue={(outsideBasis?.[field] as string | number | undefined) ?? ''}
        onChange={(e) => handleChange(field, e.target.value || null)}
        onBlur={() => saveField(field)}
        className="font-mono"
      />
    </div>
  );

  const increases = outsideBasis?.adjustments?.filter(a => a.adjustment_category === 'increase') || [];
  const decreases = outsideBasis?.adjustments?.filter(a => a.adjustment_category === 'decrease') || [];

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
        <span className="text-foreground">Outside Basis</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Outside Basis Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Track your tax basis in the partnership interest - Tax Year {form.tax_year}
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

      {/* Inception Basis */}
      <Card>
        <CardHeader>
          <CardTitle>Inception Basis</CardTitle>
          <CardDescription>Initial tax basis in the partnership interest</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <MoneyInput label="Contributed Cash/Property" field="contributed_cash_property" />
            <MoneyInput label="Purchase Price" field="purchase_price" />
            <MoneyInput label="Gift/Inheritance" field="gift_inheritance" />
            <MoneyInput label="Taxable Compensation" field="taxable_compensation" />
            <MoneyInput label="Inception Basis Total" field="inception_basis_total" />
          </div>
        </CardContent>
      </Card>

      {/* Current Year Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Year Basis</CardTitle>
          <CardDescription>Beginning and ending outside basis for the tax year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <MoneyInput label="Beginning Outside Basis" field="beginning_ob" />
            <MoneyInput label="Ending Outside Basis" field="ending_ob" />
          </div>
        </CardContent>
      </Card>

      {/* Basis Increases */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Basis Increases</CardTitle>
              <CardDescription>Items that increase your outside basis</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => addAdjustment('increase')}>
              <Plus className="h-4 w-4 mr-1" /> Add Increase
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {increases.length === 0 ? (
            <p className="text-muted-foreground text-sm">No basis increases recorded.</p>
          ) : (
            <div className="space-y-4">
              {increases.map((adj) => (
                <div key={adj.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Cash/Property Contributed</Label>
                        <Input
                          type="number"
                          step="0.01"
                          defaultValue={adj.contributed_cash_property ?? ''}
                          onBlur={(e) => updateAdjustment(adj.id, 'contributed_cash_property', e.target.value || null)}
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Share of Liabilities Increase</Label>
                        <Input
                          type="number"
                          step="0.01"
                          defaultValue={adj.increase_share_liabilities ?? ''}
                          onBlur={(e) => updateAdjustment(adj.id, 'increase_share_liabilities', e.target.value || null)}
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Share of Income/Gain</Label>
                        <Input
                          type="number"
                          step="0.01"
                          defaultValue={adj.share_income_gain ?? ''}
                          onBlur={(e) => updateAdjustment(adj.id, 'share_income_gain', e.target.value || null)}
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Excess Depletion</Label>
                        <Input
                          type="number"
                          step="0.01"
                          defaultValue={adj.excess_depletion ?? ''}
                          onBlur={(e) => updateAdjustment(adj.id, 'excess_depletion', e.target.value || null)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => deleteAdjustment(adj.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Input
                      defaultValue={adj.description ?? ''}
                      onBlur={(e) => updateAdjustment(adj.id, 'description', e.target.value || null)}
                      placeholder="Description of this adjustment"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Basis Decreases */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Basis Decreases</CardTitle>
              <CardDescription>Items that decrease your outside basis</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => addAdjustment('decrease')}>
              <Plus className="h-4 w-4 mr-1" /> Add Decrease
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {decreases.length === 0 ? (
            <p className="text-muted-foreground text-sm">No basis decreases recorded.</p>
          ) : (
            <div className="space-y-4">
              {decreases.map((adj) => (
                <div key={adj.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Distributions</Label>
                        <Input
                          type="number"
                          step="0.01"
                          defaultValue={adj.distributions ?? ''}
                          onBlur={(e) => updateAdjustment(adj.id, 'distributions', e.target.value || null)}
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Share of Losses</Label>
                        <Input
                          type="number"
                          step="0.01"
                          defaultValue={adj.losses ?? ''}
                          onBlur={(e) => updateAdjustment(adj.id, 'losses', e.target.value || null)}
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Decrease in Share of Liabilities</Label>
                        <Input
                          type="number"
                          step="0.01"
                          defaultValue={adj.decrease_share_liabilities ?? ''}
                          onBlur={(e) => updateAdjustment(adj.id, 'decrease_share_liabilities', e.target.value || null)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => deleteAdjustment(adj.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Input
                      defaultValue={adj.description ?? ''}
                      onBlur={(e) => updateAdjustment(adj.id, 'description', e.target.value || null)}
                      placeholder="Description of this adjustment"
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
            defaultValue={outsideBasis?.notes ?? ''}
            onChange={(e) => handleChange('notes', e.target.value || null)}
            onBlur={() => saveField('notes')}
            placeholder="Add any notes about outside basis..."
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
