import * as React from 'react';
import { useState, useEffect } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { LossLimitation, OwnershipInterest } from '@/types/k1';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface Props {
  interestId: number;
  year: number;
}

export default function NetOperatingLossDetail({ interestId, year }: Props) {
  const [interest, setInterest] = useState<OwnershipInterest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [priorYearData, setPriorYearData] = useState<LossLimitation | null>(null);
  const [formData, setFormData] = useState({
    nol_deduction_used: '',
    nol_carryforward: '',
    nol_80_percent_limit: '',
  });

  useEffect(() => {
    loadData();
  }, [interestId, year]);

  const loadData = async () => {
    try {
      const [interestData, lossData, priorLossData] = await Promise.all([
        fetchWrapper.get(`/api/ownership-interests/${interestId}`),
        fetchWrapper.get(`/api/ownership-interests/${interestId}/losses/${year}`),
        fetchWrapper.get(`/api/ownership-interests/${interestId}/losses/${year - 1}`).catch(() => null)
      ]);
      setInterest(interestData);
      setPriorYearData(priorLossData);
      setFormData({
        nol_deduction_used: lossData.nol_deduction_used || '',
        nol_carryforward: lossData.nol_carryforward || '',
        nol_80_percent_limit: lossData.nol_80_percent_limit || '',
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await fetchWrapper.put(`/api/ownership-interests/${interestId}/losses/${year}`, formData);
      setSaving(false);
      loadData();
    } catch (error) {
      console.error('Failed to save:', error);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto py-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="pl-0 gap-2" onClick={() => window.location.href = `/ownership/${interestId}?tab=basis`}>
          <ChevronLeft className="h-4 w-4" />
          Back to Ownership Summary
        </Button>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => window.location.href = `/ownership/${interestId}/net-operating-loss/${year - 1}`}
          >
            <ArrowLeft className="h-4 w-4" />
            {year - 1}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => window.location.href = `/ownership/${interestId}/net-operating-loss/${year + 1}`}
          >
            {year + 1}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {year} Net Operating Loss
        </h1>
        {interest && (
          <p className="text-muted-foreground mt-1">
            {interest.owner_company?.name} interest in {interest.owned_company?.name}
          </p>
        )}
      </div>

      {priorYearData && (
        <Card className="bg-muted/30">
          <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Prior Year ({year - 1}) Reference</CardTitle>
            <a 
              href={`/ownership/${interestId}/net-operating-loss/${year - 1}`}
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Edit {year - 1} NOL
            </a>
          </CardHeader>
          <CardContent className="py-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Used in {year - 1}</Label>
                <p className="font-mono">{priorYearData.nol_deduction_used ? formatCurrency(priorYearData.nol_deduction_used) : '—'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  EBL carried-over as NOL
                </Label>
                <p className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {priorYearData.excess_business_loss_carryover ? formatCurrency(priorYearData.excess_business_loss_carryover) : '—'}
                </p>
                <div className="pt-0.5">
                  <a 
                    href={`/ownership/${interestId}/excess-business-loss/${year - 1}`}
                    className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 whitespace-nowrap overflow-hidden"
                  >
                    Go to {year - 1} EBL
                    <ArrowRight className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">NOL Carryforward to {year}</Label>
                <p className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {priorYearData.nol_carryforward ? formatCurrency(priorYearData.nol_carryforward) : '—'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">80% Limit {year - 1}</Label>
                <p className="font-mono">{priorYearData.nol_80_percent_limit ? formatCurrency(priorYearData.nol_80_percent_limit) : '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>NOL Details</CardTitle>
          <CardDescription>
            Net Operating Loss tracking and limitations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="nol_deduction_used">NOL Deduction Used</Label>
              <Input
                id="nol_deduction_used"
                type="number"
                step="0.01"
                value={formData.nol_deduction_used}
                onChange={(e) => setFormData({ ...formData, nol_deduction_used: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Amount of NOL deduction used to offset income this year
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nol_80_percent_limit">80% Income Limit</Label>
              <Input
                id="nol_80_percent_limit"
                type="number"
                step="0.01"
                value={formData.nol_80_percent_limit}
                onChange={(e) => setFormData({ ...formData, nol_80_percent_limit: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                For post-2017 NOLs, deduction is limited to 80% of taxable income (in years after 2020)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nol_carryforward">NOL Carryforward</Label>
              <Input
                id="nol_carryforward"
                type="number"
                step="0.01"
                value={formData.nol_carryforward}
                onChange={(e) => setFormData({ ...formData, nol_carryforward: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Remaining NOL carried forward to {year + 1}
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
