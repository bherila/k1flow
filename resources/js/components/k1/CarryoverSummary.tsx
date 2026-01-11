import * as React from 'react';
import type { BasisWalkYear } from '@/types/k1';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface Props {
  years: number[];
  basisWalk: BasisWalkYear[];
}

export default function CarryoverSummary({ years, basisWalk }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-4 w-4" />
          Year-to-Year Carryover of Basis
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
              <div
                key={year}
                className={`p-3 rounded-lg border ${matches ? 'bg-green-100 border-green-700 text-green-950 dark:bg-green-900/20 dark:border-green-700 dark:text-green-100' : 'bg-yellow-100 border-yellow-700 text-yellow-950 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-100'}`}
              >
                <div className="font-medium">{year} → {nextYear}</div>
                <div className="text-xs mt-1 flex items-center gap-1">
                  <span className="opacity-80">Ending:</span>
                  <span className="font-mono">{carryover !== null ? formatCurrency(carryover) : '—'}</span>
                  {isOverride && (
                    <div className="inline-block">
                      <AlertCircle className="h-3 w-3 text-amber-500 inline-block ml-1" />
                    </div>
                  )}
                </div>
                <div className="text-xs mt-1">
                  <span className="opacity-80">Next Beginning:</span>{' '}
                  <span className="font-mono">{nextBeginning !== null ? formatCurrency(nextBeginning) : '—'}</span>
                </div>
                {matches ? (
                  <div className="text-xs mt-1 font-semibold">✓ Matches</div>
                ) : (
                  <div className="text-xs mt-1 font-semibold">⚠ Check values</div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
