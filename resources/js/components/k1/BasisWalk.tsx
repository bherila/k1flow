import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { 
  BasisWalkResponse, 
  BasisWalkYear, 
  ObAdjustment,
} from '@/types/k1';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Info } from 'lucide-react';
import BasisTable from './BasisTable';
import CarryoverSummary from './CarryoverSummary';
import LossLimitationTable from './LossLimitationTable';

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
          <BasisTable
            interestId={interestId}
            basisWalk={basisWalk}
            yearlyAdjustments={yearlyAdjustments}
            loadYearAdjustments={loadYearAdjustments}
            effectiveInceptionYear={effectiveInceptionYear}
            effectiveInceptionBasis={effectiveInceptionBasis}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loss Limitations</CardTitle>
          <CardDescription>
            Track limitations on losses (At-Risk, Passive Activity, EBL, NOL) for each tax year.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <LossLimitationTable
            interestId={interestId}
            basisWalk={basisWalk}
          />
        </CardContent>
      </Card>

      <CarryoverSummary years={years} basisWalk={basisWalk} />
    </div>
  );
}
