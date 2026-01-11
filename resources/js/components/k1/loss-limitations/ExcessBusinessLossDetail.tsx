import * as React from 'react';
import { useState, useEffect } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { LossLimitation, OwnershipInterest } from '@/types/k1';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, ArrowRight } from 'lucide-react';

interface Props {
  interestId: number;
  year: number;
}

export default function ExcessBusinessLossDetail({ interestId, year }: Props) {
  const [interest, setInterest] = useState<OwnershipInterest | null>(null);
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
      const [interestData, lossData] = await Promise.all([
        fetchWrapper.get(`/api/ownership-interests/${interestId}`),
        fetchWrapper.get(`/api/ownership-interests/${interestId}/losses/${year}`)
      ]);
      setInterest(interestData);
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
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="pl-0 gap-2" onClick={() => window.location.href = `/ownership/${interestId}?tab=basis`}>
          <ChevronLeft className="h-4 w-4" />
          Back to Ownership Summary
        </Button>
      </div>

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
