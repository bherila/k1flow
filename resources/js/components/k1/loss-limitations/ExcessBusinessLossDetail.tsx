import * as React from 'react';
import { useState, useEffect } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { LossLimitation, OwnershipInterest } from '@/types/k1';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, ArrowRight, ArrowLeft, Copy } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { LossLimitationTabs } from '../LossLimitationTabs';

interface Props {
  interestId: number;
  year: number;
}

export default function ExcessBusinessLossDetail({ interestId, year }: Props) {
  const [interest, setInterest] = useState<OwnershipInterest | null>(null);
  const [priorYearData, setPriorYearData] = useState<LossLimitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    excess_business_loss: '',
    excess_business_loss_carryover: '',
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
        excess_business_loss: lossData.excess_business_loss || '',
        excess_business_loss_carryover: lossData.excess_business_loss_carryover || '',
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
      <LossLimitationTabs 
        interestId={interestId} 
        year={year} 
        activeTab="excess-business-loss" 
        inceptionYear={interest?.inception_basis_year}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {year} Excess Business Loss
        </h1>
        {interest && (
          <p className="text-muted-foreground mt-1">
            {interest.owner_company?.name} interest in {interest.owned_company?.name}
          </p>
        )}
      </div>

      {priorYearData && (!interest?.inception_basis_year || year > interest.inception_basis_year) && (
        <Card className="bg-muted/30 border-dashed">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Prior Year ({year - 1}) Reference</CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Excess Business Loss</Label>
                <p className="font-mono">{priorYearData.excess_business_loss ? formatCurrency(priorYearData.excess_business_loss) : '—'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground flex items-center justify-between pr-2 text-blue-600 dark:text-blue-400">
                  <span>Carryover to {year} (as NOL)</span>
                  {priorYearData.excess_business_loss_carryover && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4" 
                      title="Copy to current year (if needed)"
                      onClick={() => setFormData(prev => ({ ...prev, excess_business_loss: priorYearData.excess_business_loss_carryover || '' }))}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </Label>
                <p className="font-mono font-bold">
                  {priorYearData.excess_business_loss_carryover ? formatCurrency(priorYearData.excess_business_loss_carryover) : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Section 461(l) Details</CardTitle>
          <CardDescription>
            Excess business loss disallowed under Section 461(l).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="excess_business_loss">Excess Business Loss</Label>
              <Input
                id="excess_business_loss"
                type="number"
                step="0.01"
                value={formData.excess_business_loss}
                onChange={(e) => setFormData({ ...formData, excess_business_loss: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Total excess business loss calculated on Form 461
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="excess_business_loss_carryover">Carryover to Next Year</Label>
              <Input
                id="excess_business_loss_carryover"
                type="number"
                step="0.01"
                value={formData.excess_business_loss_carryover}
                onChange={(e) => setFormData({ ...formData, excess_business_loss_carryover: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                This amount is treated as a Net Operating Loss (NOL) in {year + 1}
              </p>
              <div className="pt-1">
                <a 
                  href={`/ownership/${interestId}/net-operating-loss/${year + 1}`}
                  className="text-sm text-primary hover:underline flex items-center gap-1 w-fit"
                >
                  Go to {year + 1} Net Operating Loss
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
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
