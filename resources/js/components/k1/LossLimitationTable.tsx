import * as React from 'react';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BasisWalkYear, LossLimitation } from '@/types/k1';
import { Input } from '@/components/ui/input';
import { fetchWrapper } from '@/fetchWrapper';
import { Loader2 } from 'lucide-react';

interface Props {
  interestId: number;
  basisWalk: BasisWalkYear[];
  onUpdate?: () => void;
}

export default function LossLimitationTable({ interestId, basisWalk, onUpdate }: Props) {
  // state for managing edits
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const handleSave = async (year: number, field: keyof LossLimitation, value: string | null) => {
    const key = `${year}-${field}`;
    setSaving(prev => ({ ...prev, [key]: true }));
    try {
        await fetchWrapper.put(`/api/ownership-interests/${interestId}/losses/${year}`, {
            [field]: value
        });
        if (onUpdate) onUpdate();
    } catch (error) {
        console.error('Failed to save loss limitation:', error);
    } finally {
        setSaving(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }
  };

  // Helper to render a row for a specific field
  const renderRow = (label: string, field: keyof LossLimitation, readOnly = false) => (
    <TableRow>
      <TableCell className="font-medium whitespace-nowrap sticky left-0 bg-background z-20">{label}</TableCell>
      {basisWalk.map(year => {
        const val = year.loss_limitation?.[field];
        const isSaving = saving[`${year.tax_year}-${field}`];
        const yearKey = year.tax_year;
        
        return (
          <TableCell key={yearKey} className="min-w-[140px] p-2">
            <div className="relative">
                <Input 
                    className="text-right h-8 font-mono text-xs px-2" 
                    defaultValue={val ? String(val) : ''}
                    onBlur={(e) => {
                        const newValue = e.target.value || null;
                        if (newValue !== (val ? String(val) : null)) {
                            handleSave(yearKey, field, newValue);
                        }
                    }}
                    disabled={readOnly || isSaving}
                />
                {isSaving && <Loader2 className="h-3 w-3 animate-spin absolute right-2 top-2.5 text-muted-foreground" />}
            </div>
          </TableCell>
        );
      })}
    </TableRow>
  );

  // Helper to render header cells
  const years = basisWalk.map(y => y.tax_year);

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
                <TableCell colSpan={years.length + 1} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky left-0 bg-muted/20 z-10">
                    At-Risk Limitations (Form 6198)
                </TableCell>
            </TableRow>
            {renderRow('Capital At Risk', 'capital_at_risk')}
            {renderRow('At-Risk Deductible', 'at_risk_deductible')}
            {renderRow('At-Risk Carryover', 'at_risk_carryover')}

            {/* Passive Activity */}
            <TableRow className="bg-muted/20 hover:bg-muted/20">
                <TableCell colSpan={years.length + 1} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky left-0 bg-muted/20 z-10">
                    Passive Activity Loss (Form 8582)
                </TableCell>
            </TableRow>
            {renderRow('Passive Activity Loss', 'passive_activity_loss')}
            {renderRow('Passive Loss Allowed', 'passive_loss_allowed')}
            {renderRow('Passive Loss Carryover', 'passive_loss_carryover')}

            {/* Excess Business Loss */}
            <TableRow className="bg-muted/20 hover:bg-muted/20">
                <TableCell colSpan={years.length + 1} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky left-0 bg-muted/20 z-10">
                    Excess Business Loss (Form 461)
                </TableCell>
            </TableRow>
            {renderRow('Excess Business Loss', 'excess_business_loss')}
            {renderRow('EBL Carryover → NOL', 'excess_business_loss_carryover')}

             {/* NOL */}
             <TableRow className="bg-muted/20 hover:bg-muted/20">
                <TableCell colSpan={years.length + 1} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky left-0 bg-muted/20 z-10">
                    Net Operating Loss
                </TableCell>
            </TableRow>
            {renderRow('NOL Deduction Used', 'nol_deduction_used')}
            {renderRow('NOL Carryforward', 'nol_carryforward')}
            {renderRow('80% Limit', 'nol_80_percent_limit')}
        </TableBody>
      </Table>
    </div>
  );
}
