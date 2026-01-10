import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { 
  BasisWalkResponse, 
  BasisWalkYear, 
  ObAdjustment,
} from '@/types/k1';
import { formatCurrency } from '@/lib/currency';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ChevronRight, Loader2, Info, AlertCircle } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Default to current year if no inception year is set
  const currentYear = new Date().getFullYear();
  const effectiveInceptionYear = inceptionYear || currentYear;
  const effectiveInceptionBasis = inceptionBasis ?? '0';
  
  const years = basisWalk.map(y => y.tax_year);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Basis Walk Summary</CardTitle>
          <CardDescription>
            Year-over-year outside basis tracking. Click on any cell to view details or edit adjustments for that year.
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
                  <div>{effectiveInceptionYear}</div>
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
                          <a
                            href={`/ownership/${interestId}/basis/${year}/adjustments`}
                            className="hover:underline cursor-pointer block w-full text-right"
                            onMouseEnter={() => loadYearAdjustments(year)}
                          >
                            {isInception 
                              ? formatCurrency(parseFloat(effectiveInceptionBasis))
                              : yearData?.starting_basis !== null && yearData?.starting_basis !== undefined
                                ? formatCurrency(yearData.starting_basis) 
                                : '—'}
                          </a>
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
                            <div className="pt-2 text-xs text-blue-600 flex items-center">
                               Click to view details <ChevronRight className="h-3 w-3 ml-1" />
                            </div>
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
                          <a
                            href={`/ownership/${interestId}/basis/${year}/adjustments`}
                            className="hover:underline cursor-pointer block w-full text-right text-green-600"
                            onMouseEnter={() => loadYearAdjustments(year)}
                          >
                            {yearData && yearData.total_increases > 0 
                              ? formatCurrency(yearData.total_increases) 
                              : '$0.00'}
                          </a>
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
                            <div className="pt-2 text-xs text-blue-600 flex items-center">
                               Click to view details <ChevronRight className="h-3 w-3 ml-1" />
                            </div>
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
                          <a
                            href={`/ownership/${interestId}/basis/${year}/adjustments`}
                            className="hover:underline cursor-pointer block w-full text-right text-red-600"
                            onMouseEnter={() => loadYearAdjustments(year)}
                          >
                            {yearData && yearData.total_decreases > 0 
                              ? `-${formatCurrency(yearData.total_decreases)}` 
                              : '$0.00'}
                          </a>
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
                            <div className="pt-2 text-xs text-blue-600 flex items-center">
                               Click to view details <ChevronRight className="h-3 w-3 ml-1" />
                            </div>
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
                  const isOverride = yearData?.record?.ending_ob !== null && yearData?.record?.ending_ob !== undefined;
                  
                  return (
                    <TableCell 
                      key={year} 
                      className={`text-right font-mono ${isInception ? 'border-r' : ''}`}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {isOverride && (
                          <HoverCard openDelay={200} closeDelay={100}>
                            <HoverCardTrigger>
                              <AlertCircle className="h-3 w-3 text-amber-500 cursor-help" />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-auto p-2">
                              <p className="text-xs font-medium text-amber-700">Override</p>
                            </HoverCardContent>
                          </HoverCard>
                        )}
                        <HoverCard openDelay={200} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <a
                              href={`/ownership/${interestId}/basis/${year}/adjustments`}
                              className="hover:underline cursor-pointer block text-right"
                            >
                              {yearData?.ending_basis !== null && yearData?.ending_basis !== undefined
                                ? formatCurrency(yearData.ending_basis) 
                                : '—'}
                            </a>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80" align="start">
                            <div className="space-y-2">
                              <h4 className="font-semibold">{year} Ending Basis</h4>
                              <p className="text-sm">
                                Beginning: {yearData?.starting_basis !== null ? formatCurrency(yearData?.starting_basis ?? 0) : formatCurrency(parseFloat(effectiveInceptionBasis))}
                              </p>
                              <p className="text-sm text-green-600">
                                + Increases: {formatCurrency(yearData?.total_increases ?? 0)}
                              </p>
                              <p className="text-sm text-red-600">
                                - Decreases: {formatCurrency(yearData?.total_decreases ?? 0)}
                              </p>
                              <p className="text-sm font-semibold border-t pt-2 flex items-center justify-between">
                                <span>= Ending: {yearData?.ending_basis !== null && yearData?.ending_basis !== undefined ? formatCurrency(yearData.ending_basis) : '—'}</span>
                                {isOverride && <span className="text-xs text-amber-600 font-normal px-1.5 py-0.5 bg-amber-100 rounded ml-2">Override</span>}
                              </p>
                              {nextYearData && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  → Carries forward to {nextYear} as beginning basis
                                </p>
                              )}
                              <div className="pt-2 text-xs text-blue-600 flex items-center">
                                 Click to view details <ChevronRight className="h-3 w-3 ml-1" />
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
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
              const isOverride = yearData?.record?.ending_ob !== null && yearData?.record?.ending_ob !== undefined;
              
              return (
                <div key={year} className={`p-3 rounded-lg border ${matches ? 'bg-green-50 dark:bg-green-950 border-green-200' : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200'}`}>
                  <div className="font-medium">{year} → {nextYear}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    Ending: {carryover !== null ? formatCurrency(carryover) : '—'}
                    {isOverride && (
                      <HoverCard openDelay={200} closeDelay={100}>
                        <HoverCardTrigger>
                          <AlertCircle className="h-3 w-3 text-amber-500 cursor-help" />
                        </HoverCardTrigger>
                        <HoverCardContent className="w-auto p-2">
                          <p className="text-xs font-medium text-amber-700">Override</p>
                        </HoverCardContent>
                      </HoverCard>
                    )}
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
    </div>
  );
}
