import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { OwnershipInterest, OutsideBasis, ObAdjustment, LossLimitation, LossCarryforward, K1Company } from '@/types/k1';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Save, Plus, Trash2, Loader2 } from 'lucide-react';
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

export default function OwnershipInterestDetail({ interestId }: Props) {
  const [interest, setInterest] = useState<OwnershipInterest | null>(null);
  const [ownerCompany, setOwnerCompany] = useState<K1Company | null>(null);
  const [ownedCompany, setOwnedCompany] = useState<K1Company | null>(null);
  
  // Tax year selector for viewing basis/losses
  const [taxYear, setTaxYear] = useState(new Date().getFullYear() - 1);
  
  // Outside Basis state
  const [outsideBasis, setOutsideBasis] = useState<OutsideBasis | null>(null);
  const basisDataRef = useRef<Partial<OutsideBasis>>({});
  const basisPendingRef = useRef<Set<keyof OutsideBasis>>(new Set());
  
  // Loss Limitations state
  const [lossLimitation, setLossLimitation] = useState<LossLimitation | null>(null);
  const lossDataRef = useRef<Partial<LossLimitation>>({});
  const lossPendingRef = useRef<Set<keyof LossLimitation>>(new Set());
  
  // Carryforwards
  const [carryforwards, setCarryforwards] = useState<LossCarryforward[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    loadInterest();
  }, [interestId]);

  useEffect(() => {
    if (interest) {
      loadBasis();
      loadLosses();
      loadCarryforwards();
    }
  }, [interest, taxYear]);

  const loadInterest = async () => {
    try {
      const data = await fetchWrapper.get(`/api/ownership-interests/${interestId}`);
      setInterest(data);
      setOwnerCompany(data.owner_company);
      setOwnedCompany(data.owned_company);
    } catch (error) {
      console.error('Failed to load ownership interest:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBasis = async () => {
    try {
      const data = await fetchWrapper.get(`/api/ownership-interests/${interestId}/basis/${taxYear}`);
      setOutsideBasis(data);
      basisDataRef.current = { ...data };
    } catch (error) {
      console.error('Failed to load outside basis:', error);
    }
  };

  const loadLosses = async () => {
    try {
      const data = await fetchWrapper.get(`/api/ownership-interests/${interestId}/losses/${taxYear}`);
      setLossLimitation(data);
      lossDataRef.current = { ...data };
    } catch (error) {
      console.error('Failed to load loss limitations:', error);
    }
  };

  const loadCarryforwards = async () => {
    try {
      const data = await fetchWrapper.get(`/api/ownership-interests/${interestId}/carryforwards`);
      setCarryforwards(data);
    } catch (error) {
      console.error('Failed to load carryforwards:', error);
    }
  };

  // Basis field handlers
  const handleBasisChange = useCallback((field: keyof OutsideBasis, value: any) => {
    basisDataRef.current = { ...basisDataRef.current, [field]: value };
    basisPendingRef.current.add(field);
  }, []);

  const saveBasisField = useCallback(async (field: keyof OutsideBasis) => {
    if (!basisPendingRef.current.has(field)) return;

    setSaveStatus('saving');
    try {
      const payload = { [field]: basisDataRef.current[field] };
      const updated = await fetchWrapper.put(`/api/ownership-interests/${interestId}/basis/${taxYear}`, payload);
      basisDataRef.current = { ...updated };
      basisPendingRef.current.delete(field);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
      setSaveStatus('error');
    }
  }, [interestId, taxYear]);

  // Loss field handlers
  const handleLossChange = useCallback((field: keyof LossLimitation, value: any) => {
    lossDataRef.current = { ...lossDataRef.current, [field]: value };
    lossPendingRef.current.add(field);
  }, []);

  const saveLossField = useCallback(async (field: keyof LossLimitation) => {
    if (!lossPendingRef.current.has(field)) return;

    setSaveStatus('saving');
    try {
      const payload = { [field]: lossDataRef.current[field] };
      const updated = await fetchWrapper.put(`/api/ownership-interests/${interestId}/losses/${taxYear}`, payload);
      lossDataRef.current = { ...updated };
      lossPendingRef.current.delete(field);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
      setSaveStatus('error');
    }
  }, [interestId, taxYear]);

  // Adjustments
  const addAdjustment = async (category: 'increase' | 'decrease') => {
    try {
      const newAdj = await fetchWrapper.post(`/api/ownership-interests/${interestId}/basis/${taxYear}/adjustments`, {
        adjustment_category: category,
      });
      setOutsideBasis(prev => prev ? {
        ...prev,
        adjustments: [...(prev.adjustments || []), newAdj],
      } : prev);
    } catch (error) {
      console.error('Failed to add adjustment:', error);
    }
  };

  const updateAdjustment = async (id: number, field: string, value: any) => {
    try {
      const updated = await fetchWrapper.put(`/api/adjustments/${id}`, {
        [field]: value,
      });
      setOutsideBasis(prev => prev ? {
        ...prev,
        adjustments: (prev.adjustments || []).map(adj => adj.id === id ? updated : adj),
      } : prev);
    } catch (error) {
      console.error('Failed to update adjustment:', error);
    }
  };

  const deleteAdjustment = async (id: number) => {
    try {
      await fetchWrapper.delete(`/api/adjustments/${id}`, {});
      setOutsideBasis(prev => prev ? {
        ...prev,
        adjustments: (prev.adjustments || []).filter(adj => adj.id !== id),
      } : prev);
    } catch (error) {
      console.error('Failed to delete adjustment:', error);
    }
  };

  // Carryforwards
  const addCarryforward = async () => {
    try {
      const newCf = await fetchWrapper.post(`/api/ownership-interests/${interestId}/carryforwards`, {
        origin_year: taxYear,
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (!interest || !ownedCompany) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Ownership interest not found</h2>
        <Button variant="link" onClick={() => window.location.href = '/'}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to companies
        </Button>
      </div>
    );
  }

  const increases = outsideBasis?.adjustments?.filter(a => a.adjustment_category === 'increase') || [];
  const decreases = outsideBasis?.adjustments?.filter(a => a.adjustment_category === 'decrease') || [];

  // Generate year options (current year -10 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/" className="hover:text-foreground">Companies</a>
        <ChevronRight className="h-4 w-4" />
        {ownerCompany && (
          <>
            <a href={`/company/${ownerCompany.id}`} className="hover:text-foreground">{ownerCompany.name}</a>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-foreground">Interest in {ownedCompany.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Ownership Interest in {ownedCompany.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {parseFloat(interest.ownership_percentage).toFixed(4)}% ownership
            {interest.ownership_class && ` • ${interest.ownership_class}`}
          </p>
          {saveStatus === 'saving' && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </p>
          )}
          {saveStatus === 'saved' && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">✓ Saved</p>
          )}
          {saveStatus === 'error' && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">Failed to save</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Tax Year:</Label>
          <Select value={taxYear.toString()} onValueChange={(v) => setTaxYear(parseInt(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="basis" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="basis">Outside Basis</TabsTrigger>
          <TabsTrigger value="losses">Loss Limitations</TabsTrigger>
          <TabsTrigger value="carryforwards">Carryforwards</TabsTrigger>
        </TabsList>

        {/* Outside Basis Tab */}
        <TabsContent value="basis">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inception Basis</CardTitle>
                <CardDescription>How the partnership interest was originally acquired</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <MoneyInput
                    label="Contributed Cash/Property"
                    value={outsideBasis?.contributed_cash_property}
                    onChange={(v) => handleBasisChange('contributed_cash_property', v || null)}
                    onBlur={() => saveBasisField('contributed_cash_property')}
                  />
                  <MoneyInput
                    label="Purchase Price"
                    value={outsideBasis?.purchase_price}
                    onChange={(v) => handleBasisChange('purchase_price', v || null)}
                    onBlur={() => saveBasisField('purchase_price')}
                  />
                  <MoneyInput
                    label="Gift/Inheritance"
                    value={outsideBasis?.gift_inheritance}
                    onChange={(v) => handleBasisChange('gift_inheritance', v || null)}
                    onBlur={() => saveBasisField('gift_inheritance')}
                  />
                  <MoneyInput
                    label="Taxable Compensation"
                    value={outsideBasis?.taxable_compensation}
                    onChange={(v) => handleBasisChange('taxable_compensation', v || null)}
                    onBlur={() => saveBasisField('taxable_compensation')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Year Basis ({taxYear})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <MoneyInput
                    label="Beginning Outside Basis"
                    value={outsideBasis?.beginning_ob}
                    onChange={(v) => handleBasisChange('beginning_ob', v || null)}
                    onBlur={() => saveBasisField('beginning_ob')}
                  />
                  <MoneyInput
                    label="Ending Outside Basis"
                    value={outsideBasis?.ending_ob}
                    onChange={(v) => handleBasisChange('ending_ob', v || null)}
                    onBlur={() => saveBasisField('ending_ob')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Basis Increases */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Basis Increases</CardTitle>
                  <CardDescription>Items that increase your outside basis</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => addAdjustment('increase')}>
                  <Plus className="mr-2 h-4 w-4" /> Add Increase
                </Button>
              </CardHeader>
              <CardContent>
                {increases.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No basis increases recorded</p>
                ) : (
                  <div className="space-y-3">
                    {increases.map((adj) => (
                      <div key={adj.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Input
                          className="flex-1"
                          placeholder="Description"
                          defaultValue={adj.adjustment_type ?? ''}
                          onBlur={(e) => updateAdjustment(adj.id, 'adjustment_type', e.target.value)}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          className="w-32 font-mono"
                          placeholder="Amount"
                          defaultValue={adj.amount ?? ''}
                          onBlur={(e) => updateAdjustment(adj.id, 'amount', e.target.value || null)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => deleteAdjustment(adj.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Basis Decreases */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Basis Decreases</CardTitle>
                  <CardDescription>Items that decrease your outside basis</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => addAdjustment('decrease')}>
                  <Plus className="mr-2 h-4 w-4" /> Add Decrease
                </Button>
              </CardHeader>
              <CardContent>
                {decreases.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No basis decreases recorded</p>
                ) : (
                  <div className="space-y-3">
                    {decreases.map((adj) => (
                      <div key={adj.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Input
                          className="flex-1"
                          placeholder="Description"
                          defaultValue={adj.adjustment_type ?? ''}
                          onBlur={(e) => updateAdjustment(adj.id, 'adjustment_type', e.target.value)}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          className="w-32 font-mono"
                          placeholder="Amount"
                          defaultValue={adj.amount ?? ''}
                          onBlur={(e) => updateAdjustment(adj.id, 'amount', e.target.value || null)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => deleteAdjustment(adj.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  defaultValue={outsideBasis?.notes ?? ''}
                  onChange={(e) => handleBasisChange('notes', e.target.value || null)}
                  onBlur={() => saveBasisField('notes')}
                  placeholder="Add notes about outside basis..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Loss Limitations Tab */}
        <TabsContent value="losses">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>At-Risk Limitations (Form 6198)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <MoneyInput
                    label="Capital At Risk"
                    value={lossLimitation?.capital_at_risk}
                    onChange={(v) => handleLossChange('capital_at_risk', v || null)}
                    onBlur={() => saveLossField('capital_at_risk')}
                  />
                  <MoneyInput
                    label="At-Risk Deductible"
                    value={lossLimitation?.at_risk_deductible}
                    onChange={(v) => handleLossChange('at_risk_deductible', v || null)}
                    onBlur={() => saveLossField('at_risk_deductible')}
                  />
                  <MoneyInput
                    label="At-Risk Carryover"
                    value={lossLimitation?.at_risk_carryover}
                    onChange={(v) => handleLossChange('at_risk_carryover', v || null)}
                    onBlur={() => saveLossField('at_risk_carryover')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Passive Activity Loss Limitations (Form 8582)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <MoneyInput
                    label="Passive Activity Loss"
                    value={lossLimitation?.passive_activity_loss}
                    onChange={(v) => handleLossChange('passive_activity_loss', v || null)}
                    onBlur={() => saveLossField('passive_activity_loss')}
                  />
                  <MoneyInput
                    label="Passive Loss Allowed"
                    value={lossLimitation?.passive_loss_allowed}
                    onChange={(v) => handleLossChange('passive_loss_allowed', v || null)}
                    onBlur={() => saveLossField('passive_loss_allowed')}
                  />
                  <MoneyInput
                    label="Passive Loss Carryover"
                    value={lossLimitation?.passive_loss_carryover}
                    onChange={(v) => handleLossChange('passive_loss_carryover', v || null)}
                    onBlur={() => saveLossField('passive_loss_carryover')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Excess Business Loss (Section 461(l))</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <MoneyInput
                    label="Excess Business Loss"
                    value={lossLimitation?.excess_business_loss}
                    onChange={(v) => handleLossChange('excess_business_loss', v || null)}
                    onBlur={() => saveLossField('excess_business_loss')}
                  />
                  <MoneyInput
                    label="EBL Carryover"
                    value={lossLimitation?.excess_business_loss_carryover}
                    onChange={(v) => handleLossChange('excess_business_loss_carryover', v || null)}
                    onBlur={() => saveLossField('excess_business_loss_carryover')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  defaultValue={lossLimitation?.notes ?? ''}
                  onChange={(e) => handleLossChange('notes', e.target.value || null)}
                  onBlur={() => saveLossField('notes')}
                  placeholder="Add notes about loss limitations..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Carryforwards Tab */}
        <TabsContent value="carryforwards">
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
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-xs text-muted-foreground">Character</Label>
                          <Input
                            className="w-24"
                            placeholder="e.g., Ord"
                            defaultValue={cf.loss_character ?? ''}
                            onBlur={(e) => updateCarryforward(cf.id, 'loss_character', e.target.value || null)}
                          />
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

const MoneyInput = ({ 
  label, 
  value, 
  onChange, 
  onBlur 
}: { 
  label: string; 
  value: string | null | undefined; 
  onChange: (value: string) => void;
  onBlur: () => void;
}) => (
  <div className="grid gap-2">
    <Label>{label}</Label>
    <Input
      type="number"
      step="0.01"
      defaultValue={value ?? ''}
      onChange={(e) => onChange(e.target.value || '')}
      onBlur={onBlur}
      className="font-mono"
    />
  </div>
);
