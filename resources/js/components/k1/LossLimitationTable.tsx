import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BasisWalkYear, LossLimitation } from '@/types/k1';
import { formatCurrency } from '@/lib/currency';
import { ChevronRight } from 'lucide-react';

interface Props {
  interestId: number;
  basisWalk: BasisWalkYear[];
}

export default function LossLimitationTable({ interestId, basisWalk }: Props) {
  const years = basisWalk.map(y => y.tax_year);

  // Helper to render a row for a specific field
  const renderRow = (label: string, field: keyof LossLimitation, type: string) => (
    <TableRow>
      <TableCell className="font-medium whitespace-nowrap sticky left-0 bg-background z-20">{label}</TableCell>
      {basisWalk.map(year => {
        const val = year.loss_limitation?.[field];
        const yearKey = year.tax_year;
        
        return (
          <TableCell key={yearKey} className="min-w-[140px] p-0">
            <a 
              href={`/ownership/${interestId}/${type}/${yearKey}`}
              className="block w-full h-full px-4 py-2 text-right font-mono text-sm hover:bg-muted/50 hover:underline decoration-muted-foreground/30 underline-offset-4"
            >
              {val !== undefined && val !== null ? formatCurrency(val) : '—'}
            </a>
          </TableCell>
        );
      })}
    </TableRow>
  );

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
             <TableHead className="w-[200px] bg-muted/50 sticky left-0 z-20">Item</TableHead>
             {years.map(year => (
               <TableHead key={year} className="text-center min-w-[140px] bg-muted/50">
                 {year}
               </TableHead>
             ))}
          </TableRow>
        </TableHeader>
        <TableBody>
            {/* At-Risk */}
            <TableRow className="bg-muted/20 hover:bg-muted/20">
                <TableCell colSpan={years.length + 1} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky left-0 bg-muted/20 z-10 flex items-center justify-between pr-4">
                    <span>At-Risk Limitations (Form 6198)</span>
                </TableCell>
            </TableRow>
            {renderRow('Capital At Risk', 'capital_at_risk', 'at-risk')}
            {renderRow('At-Risk Deductible', 'at_risk_deductible', 'at-risk')}
            {renderRow('At-Risk Carryover', 'at_risk_carryover', 'at-risk')}

            {/* Passive Activity */}
            <TableRow className="bg-muted/20 hover:bg-muted/20">
                <TableCell colSpan={years.length + 1} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky left-0 bg-muted/20 z-10">
                    Passive Activity Loss (Form 8582)
                </TableCell>
            </TableRow>
            {renderRow('Passive Activity Loss', 'passive_activity_loss', 'passive-activity-loss')}
            {renderRow('Passive Loss Allowed', 'passive_loss_allowed', 'passive-activity-loss')}
            {renderRow('Passive Loss Carryover', 'passive_loss_carryover', 'passive-activity-loss')}

            {/* Excess Business Loss */}
            <TableRow className="bg-muted/20 hover:bg-muted/20">
                <TableCell colSpan={years.length + 1} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky left-0 bg-muted/20 z-10">
                    Excess Business Loss (Form 461)
                </TableCell>
            </TableRow>
            {renderRow('Excess Business Loss', 'excess_business_loss', 'excess-business-loss')}
            {renderRow('EBL Carryover → NOL', 'excess_business_loss_carryover', 'excess-business-loss')}

             {/* NOL */}
             <TableRow className="bg-muted/20 hover:bg-muted/20">
                <TableCell colSpan={years.length + 1} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky left-0 bg-muted/20 z-10">
                    Net Operating Loss
                </TableCell>
            </TableRow>
            {renderRow('NOL Deduction Used', 'nol_deduction_used', 'net-operating-loss')}
            {renderRow('NOL Carryforward', 'nol_carryforward', 'net-operating-loss')}
            {renderRow('80% Limit', 'nol_80_percent_limit', 'net-operating-loss')}
        </TableBody>
      </Table>
    </div>
  );
}