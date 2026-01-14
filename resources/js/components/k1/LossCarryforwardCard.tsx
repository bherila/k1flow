import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { LossCarryforward } from '@/types/k1';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  interestId: number;
}

export default function LossCarryforwardCard({ interestId }: Props) {
  const [carryforwards, setCarryforwards] = useState<LossCarryforward[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCarryforwards = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchWrapper.get(`/api/ownership-interests/${interestId}/carryforwards`);
      setCarryforwards(data);
    } catch (error) {
      console.error('Failed to load carryforwards:', error);
    } finally {
      setLoading(false);
    }
  }, [interestId]);

  useEffect(() => {
    loadCarryforwards();
  }, [loadCarryforwards]);

  const addCarryforward = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const newCf = await fetchWrapper.post(`/api/ownership-interests/${interestId}/carryforwards`, {
        origin_year: currentYear - 1,
        carryforward_type: 'passive',
        original_amount: 0,
        remaining_amount: 0,
      });
      setCarryforwards(prev => [...prev, newCf]);
    } catch (error) {
      console.error('Failed to add carryforward:', error);
    }
  };

  const updateCarryforward = async (id: number, field: string, value: any) => {
    try {
      const updated = await fetchWrapper.put(`/api/carryforwards/${id}`, {
        [field]: value,
      });
      setCarryforwards(prev => prev.map(cf => cf.id === id ? updated : cf));
    } catch (error) {
      console.error('Failed to update carryforward:', error);
    }
  };

  const deleteCarryforward = async (id: number) => {
    try {
      await fetchWrapper.delete(`/api/carryforwards/${id}`, {});
      setCarryforwards(prev => prev.filter(cf => cf.id !== id));
    } catch (error) {
      console.error('Failed to delete carryforward:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Loss Carryforwards</CardTitle>
          <CardDescription>Track suspended losses from prior years</CardDescription>
        </div>
        <Button size="sm" onClick={addCarryforward}>
          <Plus className="mr-2 h-4 w-4" /> Add Carryforward
        </Button>
      </CardHeader>
      <CardContent>
        {carryforwards.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No loss carryforwards recorded
          </p>
        ) : (
          <div className="space-y-3">
            {carryforwards.map((cf) => (
              <div key={cf.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="grid gap-1 flex-1">
                    <Label className="text-xs text-muted-foreground">Origin Year</Label>
                    <Input
                      type="number"
                      defaultValue={cf.origin_year}
                      onBlur={(e) => updateCarryforward(cf.id, 'origin_year', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-1 flex-1">
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <Select
                      defaultValue={cf.carryforward_type}
                      onValueChange={(v) => updateCarryforward(cf.id, 'carryforward_type', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="at_risk">At-Risk</SelectItem>
                        <SelectItem value="passive">Passive</SelectItem>
                        <SelectItem value="excess_business_loss">Excess Business Loss</SelectItem>
                        <SelectItem value="nol">NOL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">Character</Label>
                    <Select
                      defaultValue={cf.loss_character ?? ''}
                      onValueChange={(v) => updateCarryforward(cf.id, 'loss_character', v || null)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ORD">ORD</SelectItem>
                        <SelectItem value="CAP">CAP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">Original</Label>
                    <Input
                      type="number"
                      step="0.01"
                      className="w-28 font-mono"
                      defaultValue={cf.original_amount}
                      onBlur={(e) => updateCarryforward(cf.id, 'original_amount', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">Remaining</Label>
                    <Input
                      type="number"
                      step="0.01"
                      className="w-28 font-mono"
                      defaultValue={cf.remaining_amount}
                      onBlur={(e) => updateCarryforward(cf.id, 'remaining_amount', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="mt-4" onClick={() => deleteCarryforward(cf.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
