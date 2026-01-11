import * as React from 'react';
import { useState, useEffect } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { LossLimitation, OwnershipInterest } from '@/types/k1';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface Props {
  interestId: number;
  year: number;
}

export default function AtRiskDetail({ interestId, year }: Props) {
  const [interest, setInterest] = useState<OwnershipInterest | null>(null);
  const [data, setData] = useState<LossLimitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    capital_at_risk: '',
    at_risk_deductible: '',
    at_risk_carryover: '',
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
      setData(lossData);
      setFormData({
        capital_at_risk: lossData.capital_at_risk || '',
        at_risk_deductible: lossData.at_risk_deductible || '',
        at_risk_carryover: lossData.at_risk_carryover || '',
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
      loadData(); // Reload to confirm
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
          {year} At-Risk Limitations
        </h1>
        {interest && (
          <p className="text-muted-foreground mt-1">
            {interest.owner_company?.name} interest in {interest.owned_company?.name}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form 6198 Details</CardTitle>
          <CardDescription>
            Enter values from Form 6198 to track at-risk limitations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="capital_at_risk">Capital At Risk</Label>
              <Input
                id="capital_at_risk"
                type="number"
                step="0.01"
                value={formData.capital_at_risk}
                onChange={(e) => setFormData({ ...formData, capital_at_risk: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Total amount at risk (money contributed + share of liabilities for which you are personally liable)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="at_risk_deductible">Deductible Loss</Label>
              <Input
                id="at_risk_deductible"
                type="number"
                step="0.01"
                value={formData.at_risk_deductible}
                onChange={(e) => setFormData({ ...formData, at_risk_deductible: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Amount of loss that is deductible this year based on at-risk limitations
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="at_risk_carryover">Carryover to Next Year</Label>
              <Input
                id="at_risk_carryover"
                type="number"
                step="0.01"
                value={formData.at_risk_carryover}
                onChange={(e) => setFormData({ ...formData, at_risk_carryover: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Loss disallowed due to at-risk limitations, carried forward to {year + 1}
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
