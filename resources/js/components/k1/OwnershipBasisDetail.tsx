// React namespace not required; using named imports when needed
import { FileText, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { useCallback,useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { fetchWrapper } from '@/fetchWrapper';
import { formatCurrency } from '@/lib/currency';
import type { 
  AdjustmentCategory,
  ObAdjustment,
  OutsideBasis, 
  OwnershipInterest, 
} from '@/types/k1';

import { LossLimitationTabs } from './LossLimitationTabs';

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
}

export default function OwnershipBasisDetail({ interestId, year }: Props) {
  const [interest, setInterest] = useState<OwnershipInterest | null>(null);
  const [yearDetail, setYearDetail] = useState<OutsideBasis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

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
  const addAdjustment = async (category: AdjustmentCategory, typeCode: string) => {
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
      loadData(); // Reload to update totals
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
      loadData(); // Reload to update totals
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
      loadData(); // Reload to update totals
    } catch (error) {
      console.error('Failed to delete adjustment:', error);
    }
  };

  // Update ending basis override
  const updateEndingBasis = async (value: string) => {
    try {
      setSaveStatus('saving');
      await fetchWrapper.put(`/api/ownership-interests/${interestId}/basis/${year}`, {
        ending_ob: value || null,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      loadData(); // Reload to recalculate
    } catch (error) {
      console.error('Failed to update ending basis:', error);
      setSaveStatus('error');
    }
  };

  // Save notes
  const saveNotes = async (notes: string) => {
    try {
      setSaveStatus('saving');
      await fetchWrapper.put(
        `/api/ownership-interests/${interestId}/basis/${year}`,
        { notes: notes || null }
      );
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save notes:', error);
      setSaveStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const increases = yearDetail?.adjustments?.filter(a => a.adjustment_category === 'increase') || [];
  const decreases = yearDetail?.adjustments?.filter(a => a.adjustment_category === 'decrease') || [];
  
  const totalIncreases = increases.reduce((sum, adj) => sum + parseFloat(adj.amount || '0'), 0);
  const totalDecreases = decreases.reduce((sum, adj) => sum + parseFloat(adj.amount || '0'), 0);

  return (
    <div className="space-y-6 container mx-auto py-8 max-w-5xl">
      <LossLimitationTabs 
        interestId={interestId} 
        year={year} 
        activeTab="basis" 
        inceptionYear={interest?.inception_basis_year}
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {year} Basis Adjustments
          </h1>
          {interest && (
            <p className="text-muted-foreground mt-1">
              {interest.owner_company?.name} interest in {interest.owned_company?.name}
            </p>
          )}
          <div className="mt-2 h-6">
            {saveStatus === 'saving' && <span className="text-sm text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</span>}
            {saveStatus === 'saved' && <span className="text-sm text-green-600">✓ Saved</span>}
            {saveStatus === 'error' && <span className="text-sm text-red-600">Failed to save</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = `/ownership/${interestId}/k1/${year}`}
          >
            Single-Year K-1
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = `/ownership/${interestId}/k1-streamlined`}
          >
            Multi-Year View
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-muted/50">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Starting Basis</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-mono font-bold">
               {yearDetail?.starting_basis !== undefined && yearDetail.starting_basis !== null 
                  ? formatCurrency(yearDetail.starting_basis) 
                  : '—'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Increases</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-mono font-bold text-green-600">
              +{formatCurrency(totalIncreases)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Decreases</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-mono font-bold text-red-600">
              -{formatCurrency(totalDecreases)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-foreground">Ending Basis</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-mono font-bold">
              {yearDetail?.ending_basis !== undefined && yearDetail.ending_basis !== null 
                  ? formatCurrency(yearDetail.ending_basis) 
                  : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Increases Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-green-700">Increases</h2>
            <AddAdjustmentDropdown 
              category="increase" 
              onAdd={(typeCode) => addAdjustment('increase', typeCode)} 
            />
          </div>
          <Card>
            <CardContent className="p-0">
              {increases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No increases recorded
                </div>
              ) : (
                <div className="divide-y">
                  {increases.map((adj) => (
                    <AdjustmentRow 
                      key={adj.id} 
                      adjustment={adj} 
                      onUpdate={updateAdjustment}
                      onDelete={deleteAdjustment}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Decreases Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-red-700">Decreases</h2>
            <AddAdjustmentDropdown 
              category="decrease" 
              onAdd={(typeCode) => addAdjustment('decrease', typeCode)} 
            />
          </div>
          <Card>
            <CardContent className="p-0">
              {decreases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No decreases recorded
                </div>
              ) : (
                <div className="divide-y">
                  {decreases.map((adj) => (
                    <AdjustmentRow 
                      key={adj.id} 
                      adjustment={adj} 
                      onUpdate={updateAdjustment}
                      onDelete={deleteAdjustment}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Section: Override and Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Year-End Adjustments</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
             <Label htmlFor="ending-basis">Ending Basis Override</Label>
             <div className="flex gap-2">
               <Input
                  id="ending-basis"
                  type="number"
                  step="0.01"
                  className="font-mono"
                  placeholder="Leave empty to use calculated value"
                  defaultValue={yearDetail?.ending_ob ?? ''}
                  onBlur={(e) => updateEndingBasis(e.target.value)}
                />
             </div>
             <p className="text-xs text-muted-foreground">
               Manually override the calculated ending basis if necessary.
             </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add notes for this tax year..."
              defaultValue={yearDetail?.notes ?? ''}
              onBlur={(e) => saveNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Dropdown to add a new adjustment of a specific type
function AddAdjustmentDropdown({ 
  category, 
  onAdd 
}: { 
  category: AdjustmentCategory; 
  onAdd: (typeCode: string) => void;
}) {
  const labels = category === 'increase' ? INCREASE_LABELS : DECREASE_LABELS;
  
  return (
    <Select onValueChange={onAdd}>
      <SelectTrigger className="w-[180px]">
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
  );
}

// Individual adjustment row
function AdjustmentRow({ 
  adjustment, 
  onUpdate, 
  onDelete 
}: { 
  adjustment: ObAdjustment;
  onUpdate: (id: number, field: string, value: any) => void;
  onDelete: (id: number) => void;
}) {
  const labels = adjustment.adjustment_category === 'increase' ? INCREASE_LABELS : DECREASE_LABELS;
  const typeLabel = adjustment.adjustment_type_code 
    ? labels[adjustment.adjustment_type_code] || adjustment.adjustment_type_code
    : adjustment.adjustment_type || 'Other';

  const isOther = adjustment.adjustment_type_code === 'other_increase' || 
                  adjustment.adjustment_type_code === 'other_decrease';

  return (
    <div className="p-4 bg-card group relative">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="font-medium text-sm">{typeLabel}</div>
          <Input
            className="h-8 text-sm"
            placeholder="Description..."
            defaultValue={adjustment.description ?? ''}
            onBlur={(e) => onUpdate(adjustment.id, 'description', e.target.value || null)}
          />
        </div>
        <div className="text-right space-y-1">
           <div className="text-xs text-muted-foreground">Amount</div>
           <Input
            type="number"
            step="0.01"
            className="h-8 w-32 font-mono text-right"
            defaultValue={adjustment.amount ?? ''}
            onBlur={(e) => onUpdate(adjustment.id, 'amount', e.target.value || null)}
          />
        </div>
      </div>
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-card border rounded shadow-sm p-1">
         {adjustment.document_name ? (
            <Button variant="ghost" size="icon" className="h-6 w-6" title={adjustment.document_name}>
              <FileText className="h-3 w-3 text-blue-500" />
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-muted-foreground"
              title="Attach document (coming soon)"
              disabled
            >
              <Upload className="h-3 w-3" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(adjustment.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
      </div>
    </div>
  );
}