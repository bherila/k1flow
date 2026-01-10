import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { 
  BasisWalkResponse, 
  BasisWalkYear, 
  OutsideBasis, 
  ObAdjustment,
  AdjustmentCategory,
} from '@/types/k1';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ChevronRight, Plus, Trash2, Loader2, FileText, Upload, Info } from 'lucide-react';

// Local copies of the labels
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
  inceptionYear: number | null;
  inceptionBasis: string | null;
  onInceptionChange?: () => void;
}

interface YearlyAdjustments {
  [year: number]: {
    increases: ObAdjustment[];
    decreases: ObAdjustment[];
  };
}

export default function BasisWalk({ interestId, inceptionYear, inceptionBasis, onInceptionChange }: Props) {
  const [basisWalk, setBasisWalk] = useState<BasisWalkYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [yearDetail, setYearDetail] = useState<OutsideBasis | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Cache adjustments for hover display
  const [yearlyAdjustments, setYearlyAdjustments] = useState<YearlyAdjustments>({});

  // Load the full basis walk
  const loadBasisWalk = useCallback(async () => {
    try {
      setLoading(true);
      const data: BasisWalkResponse = await fetchWrapper.get(`/api/ownership-interests/${interestId}/basis-walk`);
      setBasisWalk(data.basis_walk);
    } catch (error) {
      console.error('Failed to load basis walk:', error);
    } finally {
      setLoading(false);
    }
  }, [interestId]);

  useEffect(() => {
    loadBasisWalk();
  }, [loadBasisWalk, inceptionYear, inceptionBasis]);

  // Load detail for a specific year (for hover preview)
  const loadYearAdjustments = useCallback(async (year: number) => {
    if (yearlyAdjustments[year]) return; // Already cached
    
    try {
      const data = await fetchWrapper.get(`/api/ownership-interests/${interestId}/basis/${year}`);
      const adjustments = data.adjustments || [];
      setYearlyAdjustments(prev => ({
        ...prev,
        [year]: {
          increases: adjustments.filter((a: ObAdjustment) => a.adjustment_category === 'increase'),
          decreases: adjustments.filter((a: ObAdjustment) => a.adjustment_category === 'decrease'),
        }
      }));
    } catch (error) {
      console.error('Failed to load year adjustments:', error);
    }
  }, [interestId, yearlyAdjustments]);

  // Load detail for selected year (for dialog)
  const loadYearDetail = useCallback(async (year: number) => {
    try {
      setDetailLoading(true);
      const data = await fetchWrapper.get(`/api/ownership-interests/${interestId}/basis/${year}`);
      setYearDetail(data);
    } catch (error) {
      console.error('Failed to load year detail:', error);
    } finally {
      setDetailLoading(false);
    }
  }, [interestId]);

  useEffect(() => {
    if (selectedYear) {
      loadYearDetail(selectedYear);
    }
  }, [selectedYear, loadYearDetail]);

  // Add a new adjustment
  const addAdjustment = async (category: AdjustmentCategory, typeCode: string) => {
    if (!selectedYear) return;
    
    try {
      setSaveStatus('saving');
      const newAdj = await fetchWrapper.post(
        `/api/ownership-interests/${interestId}/basis/${selectedYear}/adjustments`,
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
      // Clear cache for this year
      setYearlyAdjustments(prev => {
        const updated = { ...prev };
        delete updated[selectedYear];
        return updated;
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      loadBasisWalk();
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
      // Clear cache for this year
      if (selectedYear) {
        setYearlyAdjustments(prev => {
          const updatedCache = { ...prev };
          delete updatedCache[selectedYear];
          return updatedCache;
        });
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      loadBasisWalk();
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
      // Clear cache for this year
      if (selectedYear) {
        setYearlyAdjustments(prev => {
          const updated = { ...prev };
          delete updated[selectedYear];
          return updated;
        });
      }
      loadBasisWalk();
    } catch (error) {
      console.error('Failed to delete adjustment:', error);
    }
  };

  // Update ending basis
  const updateEndingBasis = async (value: string) => {
    if (!selectedYear) return;
    
    try {
      setSaveStatus('saving');
      await fetchWrapper.put(`/api/ownership-interests/${interestId}/basis/${selectedYear}`, {
        ending_ob: value || null,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      loadBasisWalk();
    } catch (error) {
      console.error('Failed to update ending basis:', error);
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

  if (!inceptionYear || inceptionBasis === null) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">
            Please set the inception date and basis above to start tracking your basis walk.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentYear = new Date().getFullYear();
  const years = basisWalk.map(y => y.tax_year);
  const increases = yearDetail?.adjustments?.filter(a => a.adjustment_category === 'increase') || [];
  const decreases = yearDetail?.adjustments?.filter(a => a.adjustment_category === 'decrease') || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Basis Walk Summary</CardTitle>
          <CardDescription>
            Year-over-year outside basis tracking. Hover over cells for adjustment details. Click to edit.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {/* Summary Table - Horizontal layout like screenshot */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32 sticky left-0 bg-background"></TableHead>
                <TableHead className="text-center font-semibold border-r">
                  <div className="text-xs text-muted-foreground">Inception Year</div>
                  <div>{inceptionYear}</div>
                </TableHead>
                {years.slice(1).map((year, idx) => (
                  <TableHead key={year} className={`text-center ${idx === years.length - 2 ? '' : ''}`}>
                    {year === currentYear - 1 && (
                      <div className="text-xs text-muted-foreground">Current Year</div>
                    )}
                    <div>{year}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Beginning Row */}
              <TableRow>
                <TableCell className="font-medium sticky left-0 bg-background">Beginning</TableCell>
                {years.map((year, idx) => {
                  const yearData = basisWalk.find(y => y.tax_year === year);
                  const isInception = idx === 0;
                  return (
                    <TableCell 
                      key={year} 
                      className={`text-right font-mono ${isInception ? 'border-r' : ''}`}
                    >
                      <HoverCard openDelay={200} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <button
                            className="hover:underline cursor-pointer w-full text-right"
                            onClick={() => setSelectedYear(year)}
                            onMouseEnter={() => loadYearAdjustments(year)}
                          >
                            {isInception 
                              ? formatCurrency(parseFloat(inceptionBasis || '0'))
                              : yearData?.starting_basis !== null && yearData?.starting_basis !== undefined
                                ? formatCurrency(yearData.starting_basis) 
                                : '—'}
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80" align="start">
                          <div className="space-y-2">
                            <h4 className="font-semibold">{year} Beginning Basis</h4>
                            {isInception ? (
                              <p className="text-sm text-muted-foreground">
                                Inception basis from original acquisition
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Carried forward from {year - 1} ending basis
                              </p>
                            )}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* Increases Row */}
              <TableRow>
                <TableCell className="font-medium sticky left-0 bg-background">Increases</TableCell>
                {years.map((year, idx) => {
                  const yearData = basisWalk.find(y => y.tax_year === year);
                  const isInception = idx === 0;
                  const cachedAdj = yearlyAdjustments[year];
                  return (
                    <TableCell 
                      key={year} 
                      className={`text-right font-mono ${isInception ? 'border-r' : ''}`}
                    >
                      <HoverCard openDelay={200} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <button
                            className="hover:underline cursor-pointer w-full text-right text-green-600"
                            onClick={() => setSelectedYear(year)}
                            onMouseEnter={() => loadYearAdjustments(year)}
                          >
                            {yearData && yearData.total_increases > 0 
                              ? formatCurrency(yearData.total_increases) 
                              : '$0.00'}
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-96" align="start">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-green-700">{year} Increases</h4>
                            {cachedAdj?.increases && cachedAdj.increases.length > 0 ? (
                              <Table>
                                <TableBody>
                                  {cachedAdj.increases.map(adj => (
                                    <TableRow key={adj.id}>
                                      <TableCell className="py-1 text-sm">
                                        {INCREASE_LABELS[adj.adjustment_type_code || ''] || adj.adjustment_type || 'Other'}
                                      </TableCell>
                                      <TableCell className="py-1 text-right font-mono text-sm">
                                        {formatCurrency(parseFloat(adj.amount || '0'))}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <p className="text-sm text-muted-foreground">No increases recorded</p>
                            )}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* Decreases Row */}
              <TableRow>
                <TableCell className="font-medium sticky left-0 bg-background">Decreases</TableCell>
                {years.map((year, idx) => {
                  const yearData = basisWalk.find(y => y.tax_year === year);
                  const isInception = idx === 0;
                  const cachedAdj = yearlyAdjustments[year];
                  return (
                    <TableCell 
                      key={year} 
                      className={`text-right font-mono ${isInception ? 'border-r' : ''}`}
                    >
                      <HoverCard openDelay={200} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <button
                            className="hover:underline cursor-pointer w-full text-right text-red-600"
                            onClick={() => setSelectedYear(year)}
                            onMouseEnter={() => loadYearAdjustments(year)}
                          >
                            {yearData && yearData.total_decreases > 0 
                              ? `-${formatCurrency(yearData.total_decreases)}` 
                              : '$0.00'}
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-96" align="start">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-red-700">{year} Decreases</h4>
                            {cachedAdj?.decreases && cachedAdj.decreases.length > 0 ? (
                              <Table>
                                <TableBody>
                                  {cachedAdj.decreases.map(adj => (
                                    <TableRow key={adj.id}>
                                      <TableCell className="py-1 text-sm">
                                        {DECREASE_LABELS[adj.adjustment_type_code || ''] || adj.adjustment_type || 'Other'}
                                      </TableCell>
                                      <TableCell className="py-1 text-right font-mono text-sm">
                                        -{formatCurrency(parseFloat(adj.amount || '0'))}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <p className="text-sm text-muted-foreground">No decreases recorded</p>
                            )}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* Ending Row */}
              <TableRow className="border-t-2 font-semibold">
                <TableCell className="font-semibold sticky left-0 bg-background">Ending</TableCell>
                {years.map((year, idx) => {
                  const yearData = basisWalk.find(y => y.tax_year === year);
                  const isInception = idx === 0;
                  const nextYear = years[idx + 1];
                  const nextYearData = nextYear ? basisWalk.find(y => y.tax_year === nextYear) : null;
                  
                  return (
                    <TableCell 
                      key={year} 
                      className={`text-right font-mono ${isInception ? 'border-r' : ''}`}
                    >
                      <HoverCard openDelay={200} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <button
                            className="hover:underline cursor-pointer w-full text-right"
                            onClick={() => setSelectedYear(year)}
                          >
                            {yearData?.ending_basis !== null && yearData?.ending_basis !== undefined
                              ? formatCurrency(yearData.ending_basis) 
                              : '—'}
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80" align="start">
                          <div className="space-y-2">
                            <h4 className="font-semibold">{year} Ending Basis</h4>
                            <p className="text-sm">
                              Beginning: {yearData?.starting_basis !== null ? formatCurrency(yearData?.starting_basis ?? 0) : formatCurrency(parseFloat(inceptionBasis || '0'))}
                            </p>
                            <p className="text-sm text-green-600">
                              + Increases: {formatCurrency(yearData?.total_increases ?? 0)}
                            </p>
                            <p className="text-sm text-red-600">
                              - Decreases: {formatCurrency(yearData?.total_decreases ?? 0)}
                            </p>
                            <p className="text-sm font-semibold border-t pt-2">
                              = Ending: {yearData?.ending_basis !== null && yearData?.ending_basis !== undefined ? formatCurrency(yearData.ending_basis) : '—'}
                            </p>
                            {nextYearData && (
                              <p className="text-xs text-muted-foreground mt-2">
                                → Carries forward to {nextYear} as beginning basis
                              </p>
                            )}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Carryover Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Year-to-Year Carryover
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {years.slice(0, -1).map((year, idx) => {
              const yearData = basisWalk.find(y => y.tax_year === year);
              const nextYear = years[idx + 1];
              const nextYearData = basisWalk.find(y => y.tax_year === nextYear);
              
              if (!yearData || !nextYearData) return null;
              
              const carryover = yearData.ending_basis;
              const nextBeginning = nextYearData.starting_basis;
              const matches = carryover === nextBeginning;
              
              return (
                <div key={year} className={`p-3 rounded-lg border ${matches ? 'bg-green-50 dark:bg-green-950 border-green-200' : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200'}`}>
                  <div className="font-medium">{year} → {nextYear}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Ending: {carryover !== null ? formatCurrency(carryover) : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Next Beginning: {nextBeginning !== null ? formatCurrency(nextBeginning) : '—'}
                  </div>
                  {matches ? (
                    <div className="text-xs text-green-600 mt-1">✓ Matches</div>
                  ) : (
                    <div className="text-xs text-yellow-600 mt-1">⚠ Check values</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Year Detail Dialog */}
      <Dialog open={selectedYear !== null} onOpenChange={(open) => !open && setSelectedYear(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedYear} Basis Adjustments</DialogTitle>
            <DialogDescription>
              {saveStatus === 'saving' && <span className="text-muted-foreground">Saving...</span>}
              {saveStatus === 'saved' && <span className="text-green-600">✓ Saved</span>}
              {saveStatus === 'error' && <span className="text-red-600">Failed to save</span>}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : yearDetail ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Starting Basis</Label>
                  <p className="font-mono text-lg">
                    {yearDetail.starting_basis !== undefined && yearDetail.starting_basis !== null 
                      ? formatCurrency(yearDetail.starting_basis) 
                      : '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Net Adjustment</Label>
                  <p className={`font-mono text-lg ${
                    (yearDetail.net_adjustment ?? 0) > 0 ? 'text-green-600' : 
                    (yearDetail.net_adjustment ?? 0) < 0 ? 'text-red-600' : ''
                  }`}>
                    {yearDetail.net_adjustment !== undefined 
                      ? formatCurrency(yearDetail.net_adjustment) 
                      : '$0.00'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Ending Basis</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="font-mono mt-1"
                    defaultValue={yearDetail.ending_ob ?? ''}
                    onBlur={(e) => updateEndingBasis(e.target.value)}
                  />
                </div>
              </div>

              {/* Increases */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-green-700 dark:text-green-400">Increases</h3>
                  <AddAdjustmentDropdown 
                    category="increase" 
                    onAdd={(typeCode) => addAdjustment('increase', typeCode)} 
                  />
                </div>
                {increases.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                    No increases recorded
                  </p>
                ) : (
                  <div className="space-y-2">
                    {increases.map((adj) => (
                      <AdjustmentRow 
                        key={adj.id} 
                        adjustment={adj} 
                        onUpdate={updateAdjustment}
                        onDelete={deleteAdjustment}
                      />
                    ))}
                    <div className="flex justify-end pt-2 border-t">
                      <span className="text-sm text-muted-foreground mr-2">Total:</span>
                      <span className="font-mono font-semibold text-green-700 dark:text-green-400">
                        +{formatCurrency(yearDetail.total_increases ?? 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Decreases */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-red-700 dark:text-red-400">Decreases</h3>
                  <AddAdjustmentDropdown 
                    category="decrease" 
                    onAdd={(typeCode) => addAdjustment('decrease', typeCode)} 
                  />
                </div>
                {decreases.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                    No decreases recorded
                  </p>
                ) : (
                  <div className="space-y-2">
                    {decreases.map((adj) => (
                      <AdjustmentRow 
                        key={adj.id} 
                        adjustment={adj} 
                        onUpdate={updateAdjustment}
                        onDelete={deleteAdjustment}
                      />
                    ))}
                    <div className="flex justify-end pt-2 border-t">
                      <span className="text-sm text-muted-foreground mr-2">Total:</span>
                      <span className="font-mono font-semibold text-red-700 dark:text-red-400">
                        -{formatCurrency(yearDetail.total_decreases ?? 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <Label>Notes</Label>
                <Textarea
                  className="mt-1"
                  placeholder="Add notes for this year..."
                  defaultValue={yearDetail.notes ?? ''}
                  onBlur={async (e) => {
                    try {
                      await fetchWrapper.put(
                        `/api/ownership-interests/${interestId}/basis/${selectedYear}`,
                        { notes: e.target.value || null }
                      );
                    } catch (error) {
                      console.error('Failed to save notes:', error);
                    }
                  }}
                />
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
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
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{typeLabel}</p>
        {isOther && (
          <Input
            className="mt-1 text-sm"
            placeholder="Describe this adjustment..."
            defaultValue={adjustment.description ?? ''}
            onBlur={(e) => onUpdate(adjustment.id, 'description', e.target.value || null)}
          />
        )}
      </div>
      <Input
        type="number"
        step="0.01"
        className="w-32 font-mono text-right"
        defaultValue={adjustment.amount ?? ''}
        onBlur={(e) => onUpdate(adjustment.id, 'amount', e.target.value || null)}
      />
      {adjustment.document_name ? (
        <Button variant="ghost" size="icon" title={adjustment.document_name}>
          <FileText className="h-4 w-4 text-blue-500" />
        </Button>
      ) : (
        <Button 
          variant="ghost" 
          size="icon" 
          title="Attach document"
          className="text-muted-foreground"
        >
          <Upload className="h-4 w-4" />
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={() => onDelete(adjustment.id)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
