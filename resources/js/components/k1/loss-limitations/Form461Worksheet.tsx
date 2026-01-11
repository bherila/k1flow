import * as React from 'react';
import { useState, useEffect } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { F461Worksheet } from '@/types/k1';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface Props {
  interestId: number;
  year: number;
  onCalculationUpdate?: (ebl: number) => void;
}

export default function Form461Worksheet({ interestId, year, onCalculationUpdate }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<F461Worksheet | null>(null);
  const [formData, setFormData] = useState({
    line_2: '',
    line_3: '',
    line_4: '',
    line_5: '',
    line_6: '',
    line_8: '',
    line_10: '',
    line_11: '',
    line_15: '',
  });

  const isDirty = data ? (
    formData.line_2 !== (data.line_2 || '') ||
    formData.line_3 !== (data.line_3 || '') ||
    formData.line_4 !== (data.line_4 || '') ||
    formData.line_5 !== (data.line_5 || '') ||
    formData.line_6 !== (data.line_6 || '') ||
    formData.line_8 !== (data.line_8 || '') ||
    formData.line_10 !== (data.line_10 || '') ||
    formData.line_11 !== (data.line_11 || '') ||
    formData.line_15 !== (data.line_15 || '')
  ) : false;

  useEffect(() => {
    loadData();
  }, [interestId, year]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchWrapper.get(`/api/ownership-interests/${interestId}/f461/${year}`);
      setData(res);
      setFormData({
        line_2: res.line_2 || '',
        line_3: res.line_3 || '',
        line_4: res.line_4 || '',
        line_5: res.line_5 || '',
        line_6: res.line_6 || '',
        line_8: res.line_8 || '',
        line_10: res.line_10 || '',
        line_11: res.line_11 || '',
        line_15: res.line_15 || '',
      });
    } catch (error) {
      console.error('Failed to load F461 worksheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetchWrapper.put(`/api/ownership-interests/${interestId}/f461/${year}`, formData);
      setData(res);
      if (onCalculationUpdate) {
          const calculations = calculateLines(formData);
          onCalculationUpdate(calculations.line_16 < 0 ? Math.abs(calculations.line_16) : 0);
      }
    } catch (error) {
      console.error('Failed to save F461 worksheet:', error);
    } finally {
      setSaving(false);
    }
  };

  const calculateLines = (vals: typeof formData) => {
    const n = (v: string) => parseFloat(v) || 0;
    
    // Part I
    const line_9 = n(vals.line_2) + n(vals.line_3) + n(vals.line_4) + n(vals.line_5) + n(vals.line_6) + n(vals.line_8);
    
    // Part II
    const line_12 = n(vals.line_10) - n(vals.line_11);
    
    // Part III
    const line_13 = -line_12;
    const line_14 = line_9 + line_13;
    const line_16 = line_14 + n(vals.line_15);
    
    return { line_9, line_12, line_13, line_14, line_16 };
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>;

  const calcs = calculateLines(formData);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">Form 461 Worksheet (Limitation on Business Losses)</CardTitle>
        <CardDescription>Calculate the excess business loss for the tax year.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-1">Part I: Total Income/Loss Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <WorksheetRow 
                label="2. Business income or loss (Sch 1, line 3)" 
                value={formData.line_2} 
                onChange={v => setFormData({...formData, line_2: v})} 
              />
              <WorksheetRow 
                label="3. Capital gains or losses (Form 1040, line 7a)" 
                value={formData.line_3} 
                onChange={v => setFormData({...formData, line_3: v})} 
              />
              <WorksheetRow 
                label="4. Other gains or losses (Sch 1, line 4)" 
                value={formData.line_4} 
                onChange={v => setFormData({...formData, line_4: v})} 
              />
              <WorksheetRow 
                label="5. Supplemental income or loss (Sch 1, line 5)" 
                value={formData.line_5} 
                onChange={v => setFormData({...formData, line_5: v})} 
              />
              <WorksheetRow 
                label="6. Farm income or loss (Sch 1, line 6)" 
                value={formData.line_6} 
                onChange={v => setFormData({...formData, line_6: v})} 
              />
              <WorksheetRow 
                label="8. Other trade or business income/gain/loss" 
                value={formData.line_8} 
                onChange={v => setFormData({...formData, line_8: v})} 
              />
              <WorksheetResult label="9. Combine lines 1 through 8" value={calcs.line_9} />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-semibold text-sm border-b pb-1">Part II: Adjustment for Amounts Not Attributable to Trade or Business</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <WorksheetRow 
                label="10. Non-business income or gain (included in lines 1-8)" 
                value={formData.line_10} 
                onChange={v => setFormData({...formData, line_10: v})} 
              />
              <WorksheetRow 
                label="11. Non-business losses or deductions (included in lines 1-8)" 
                value={formData.line_11} 
                onChange={v => setFormData({...formData, line_11: v})} 
              />
              <WorksheetResult label="12. Subtract line 11 from line 10" value={calcs.line_12} />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-semibold text-sm border-b pb-1">Part III: Limitation on Losses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <WorksheetResult label="13. Adjustment (Invert Line 12)" value={calcs.line_13} />
              <WorksheetResult label="14. Add lines 9 and 13" value={calcs.line_14} />
              <WorksheetRow 
                label="15. Threshold ($313,000 or $626,000 for MFJ)" 
                value={formData.line_15} 
                onChange={v => setFormData({...formData, line_15: v})} 
              />
              <div className="flex items-center justify-between col-span-full bg-primary/5 p-4 rounded-lg border border-primary/10 mt-2">
                <div className="space-y-0.5">
                    <Label className="text-base font-bold">16. Excess Business Loss</Label>
                    <p className="text-xs text-muted-foreground">Add lines 14 and 15. If less than zero, this is your disallowed loss.</p>
                </div>
                <div className={`text-2xl font-mono font-bold ${calcs.line_16 < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(calcs.line_16)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={saving || !isDirty} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Worksheet
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function WorksheetRow({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input 
        type="number" 
        step="0.01" 
        className="h-8 font-mono" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
      />
    </div>
  );
}

function WorksheetResult({ label, value }: { label: string, value: number }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="h-8 flex items-center px-3 bg-muted/50 rounded-md font-mono text-sm font-semibold">
        {formatCurrency(value)}
      </div>
    </div>
  );
}
