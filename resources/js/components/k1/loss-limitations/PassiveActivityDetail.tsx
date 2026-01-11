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

interface Props {
  interestId: number;
  year: number;
}

export default function PassiveActivityDetail({ interestId, year }: Props) {
  const [interest, setInterest] = useState<OwnershipInterest | null>(null);
  const [priorYearData, setPriorYearData] = useState<LossLimitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    passive_activity_loss: '',
    passive_loss_allowed: '',
    passive_loss_carryover: '',
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
        passive_activity_loss: lossData.passive_activity_loss || '',
        passive_loss_allowed: lossData.passive_loss_allowed || '',
        passive_loss_carryover: lossData.passive_loss_carryover || '',
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
            onClick={() => window.location.href = `/ownership/${interestId}/passive-activity-loss/${year - 1}`}
          >
            <ArrowLeft className="h-4 w-4" />
            {year - 1}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => window.location.href = `/ownership/${interestId}/passive-activity-loss/${year + 1}`}
          >
            {year + 1}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {year} Passive Activity Limitations
        </h1>
        {interest && (
          <p className="text-muted-foreground mt-1">
            {interest.owner_company?.name} interest in {interest.owned_company?.name}
          </p>
        )}
      </div>

      {priorYearData && (
        <Card className="bg-muted/30 border-dashed">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Prior Year ({year - 1}) Reference</CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Total Loss</Label>
                <p className="font-mono">{priorYearData.passive_activity_loss ? formatCurrency(priorYearData.passive_activity_loss) : '—'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground text-green-600 dark:text-green-400">Allowed</Label>
                <p className="font-mono">{priorYearData.passive_loss_allowed ? formatCurrency(priorYearData.passive_loss_allowed) : '—'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground flex items-center justify-between pr-2 text-red-600 dark:text-red-400">
                  <span>Carryover</span>
                  {priorYearData.passive_loss_carryover && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4" 
                      title="Copy to current year"
                      onClick={() => setFormData(prev => ({ ...prev, passive_activity_loss: priorYearData.passive_loss_carryover || '' }))}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </Label>
                <p className="font-mono font-bold">
                  {priorYearData.passive_loss_carryover ? formatCurrency(priorYearData.passive_loss_carryover) : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Form 8582 Details</CardTitle>
          <CardDescription>
            Enter values from Form 8582 to track passive activity loss limitations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="passive_activity_loss">Total Passive Activity Loss</Label>
              <Input
                id="passive_activity_loss"
                type="number"
                step="0.01"
                value={formData.passive_activity_loss}
                onChange={(e) => setFormData({ ...formData, passive_activity_loss: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Total loss from this passive activity for the year
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="passive_loss_allowed">Allowed Loss</Label>
              <Input
                id="passive_loss_allowed"
                type="number"
                step="0.01"
                value={formData.passive_loss_allowed}
                onChange={(e) => setFormData({ ...formData, passive_loss_allowed: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Amount of loss that is allowed (deductible) this year
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="passive_loss_carryover">Carryover to Next Year</Label>
              <Input
                id="passive_loss_carryover"
                type="number"
                step="0.01"
                value={formData.passive_loss_carryover}
                onChange={(e) => setFormData({ ...formData, passive_loss_carryover: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Unallowed loss carried forward to {year + 1}
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
