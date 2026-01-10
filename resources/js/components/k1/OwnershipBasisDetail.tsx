import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { 
  OwnershipInterest, 
  OutsideBasis, 
  ObAdjustment,
  AdjustmentCategory,
} from '@/types/k1';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Plus, Trash2, Loader2, FileText, Upload } from 'lucide-react';

const INCREASE_LABELS: Record<string, string> = {
  cash_contribution: 'Cash contributions',
  property_contribution: 'Property contributions (FMV)',
  increase_liabilities: 'Increase in share of partnership liabilities',
  assumption_personal_liabilities: 'Partnership assumption of personal liabilities',
  share_income: 'Share of partnership income/gain',
  tax_exempt_income: 'Tax-exempt income',
  excess_depletion: 'Excess depletion (oil & gas)',
  other_increase: 'Other increase',
};

const DECREASE_LABELS: Record<string, string> = {
  cash_distribution: 'Cash distributions',
  property_distribution: 'Property distributions (basis)',
  decrease_liabilities: 'Decrease in share of partnership liabilities',
  personal_liabilities_assumed: 'Personal liabilities assumed by partnership',
  share_losses: 'Share of partnership losses',
  nondeductible_noncapital: 'Nondeductible expenses (not capitalized)',
  section_179: 'Section 179 deduction',
  depletion_deduction: 'Oil & gas depletion deduction',
  other_decrease: 'Other decrease',
};

interface Props {
  interestId: number;
  year: number;
  type: 'increases' | 'decreases';
}

export default function OwnershipBasisDetail({ interestId, year, type }: Props) {
  const [interest, setInterest] = useState<OwnershipInterest | null>(null);
  const [yearDetail, setYearDetail] = useState<OutsideBasis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const category: AdjustmentCategory = type === 'increases' ? 'increase' : 'decrease';
  const labels = type === 'increases' ? INCREASE_LABELS : DECREASE_LABELS;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [interestData, detailData] = await Promise.all([
        fetchWrapper.get(`/api/ownership-interests/${interestId}`),
        fetchWrapper.get(`/api/ownership-interests/${interestId}/basis/${year}`)
      ]);
      setInterest(interestData);
      setYearDetail(detailData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [interestId, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add a new adjustment
  const addAdjustment = async (typeCode: string) => {
    try {
      setSaveStatus('saving');
      const newAdj = await fetchWrapper.post(
        `/api/ownership-interests/${interestId}/basis/${year}/adjustments`,
        {
          adjustment_category: category,
          adjustment_type_code: typeCode,
          amount: 0,
        }
      );
      setYearDetail(prev => prev ? {
        ...prev,
        adjustments: [...(prev.adjustments || []), newAdj],
      } : prev);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to add adjustment:', error);
      setSaveStatus('error');
    }
  };

  // Update an adjustment
  const updateAdjustment = async (id: number, field: string, value: any) => {
    try {
      setSaveStatus('saving');
      const updated = await fetchWrapper.put(`/api/adjustments/${id}`, {
        [field]: value,
      });
      setYearDetail(prev => prev ? {
        ...prev,
        adjustments: (prev.adjustments || []).map(adj => adj.id === id ? updated : adj),
      } : prev);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to update adjustment:', error);
      setSaveStatus('error');
    }
  };

  // Delete an adjustment
  const deleteAdjustment = async (id: number) => {
    try {
      await fetchWrapper.delete(`/api/adjustments/${id}`, {});
      setYearDetail(prev => prev ? {
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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const adjustments = yearDetail?.adjustments?.filter(a => a.adjustment_category === category) || [];
  const total = adjustments.reduce((sum, adj) => sum + parseFloat(adj.amount || '0'), 0);

  return (
    <div className="space-y-6 container mx-auto py-8 max-w-4xl">
      {/* Breadcrumb / Back Link */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="pl-0 gap-2" onClick={() => window.location.href = `/ownership/${interestId}`}>
          <ChevronLeft className="h-4 w-4" />
          Back to Ownership Summary
        </Button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {year} {type === 'increases' ? 'Increases' : 'Decreases'} to Basis
        </h1>
        {interest && (
          <p className="text-muted-foreground mt-1">
            {interest.owner_company?.name} interest in {interest.owned_company?.name}
          </p>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Adjustments</CardTitle>
            <CardDescription>
              {type === 'increases' 
                ? 'Items that increase your outside basis (e.g. contributions, income)' 
                : 'Items that decrease your outside basis (e.g. distributions, losses)'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {saveStatus === 'saving' && <span className="text-sm text-muted-foreground">Saving...</span>}
            {saveStatus === 'saved' && <span className="text-sm text-green-600">✓ Saved</span>}
            <Select onValueChange={addAdjustment}>
              <SelectTrigger className="w-[200px]">
                <Plus className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Add adjustment" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(labels).map(([code, label]) => (
                  <SelectItem key={code} value={code}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {adjustments.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No adjustments recorded for this category.</p>
              <p className="text-sm text-muted-foreground mt-1">Use the "Add adjustment" button to add one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {adjustments.map((adj) => (
                <div key={adj.id} className="flex items-start gap-4 p-4 border rounded-lg bg-card">
                  <div className="flex-1 space-y-2">
                    <div className="font-medium">
                       {labels[adj.adjustment_type_code || ''] || adj.adjustment_type || 'Other'}
                    </div>
                    {/* Description input for "Other" or generic notes */}
                    <Input
                      className="text-sm"
                      placeholder="Description / Notes..."
                      defaultValue={adj.description ?? ''}
                      onBlur={(e) => updateAdjustment(adj.id, 'description', e.target.value || null)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground block text-right">Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      className="w-40 font-mono text-right"
                      defaultValue={adj.amount ?? ''}
                      onBlur={(e) => updateAdjustment(adj.id, 'amount', e.target.value || null)}
                    />
                  </div>

                  <div className="pt-6 flex gap-1">
                    {adj.document_name ? (
                      <Button variant="ghost" size="icon" title={adj.document_name}>
                        <FileText className="h-4 w-4 text-blue-500" />
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Attach document (coming soon)"
                        disabled
                        className="text-muted-foreground"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteAdjustment(adj.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-4 border-t mt-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total {type === 'increases' ? 'Increases' : 'Decreases'}</p>
                  <p className={`text-2xl font-mono font-bold ${type === 'increases' ? 'text-green-600' : 'text-red-600'}`}>
                    {type === 'increases' ? '+' : '-'}{formatCurrency(total)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
