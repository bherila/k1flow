import * as React from 'react';
import { useState, useEffect } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { LossLimitation, OwnershipInterest } from '@/types/k1';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2 } from 'lucide-react';

interface Props {
  interestId: number;
  year: number;
}

export default function PassiveActivityDetail({ interestId, year }: Props) {
  const [interest, setInterest] = useState<OwnershipInterest | null>(null);
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
      const [interestData, lossData] = await Promise.all([
        fetchWrapper.get(`/api/ownership-interests/${interestId}`),
        fetchWrapper.get(`/api/ownership-interests/${interestId}/losses/${year}`)
      ]);
      setInterest(interestData);
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
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="pl-0 gap-2" onClick={() => window.location.href = `/ownership/${interestId}?tab=basis`}>
          <ChevronLeft className="h-4 w-4" />
          Back to Ownership Summary
        </Button>
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
