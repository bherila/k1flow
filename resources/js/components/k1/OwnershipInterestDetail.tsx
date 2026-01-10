import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { OwnershipInterest, OutsideBasis, ObAdjustment, LossLimitation, LossCarryforward, K1Company, LossCharacter } from '@/types/k1';
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
import BasisWalk from './BasisWalk';
import InceptionBasisModal from './InceptionBasisModal';

interface Props {
  interestId: number;
}

export default function OwnershipInterestDetail({ interestId }: Props) {
  const [interest, setInterest] = useState<OwnershipInterest | null>(null);
  const [ownerCompany, setOwnerCompany] = useState<K1Company | null>(null);
  const [ownedCompany, setOwnedCompany] = useState<K1Company | null>(null);
  
  // Tax year selector for viewing losses
  const [taxYear, setTaxYear] = useState(new Date().getFullYear() - 1);
  
  // Inception Basis state (stored on ownership interest itself)
  const inceptionDataRef = useRef<Partial<OwnershipInterest>>({});
  const inceptionPendingRef = useRef<Set<keyof OwnershipInterest>>(new Set());
  
  // Key to force BasisWalk refresh when inception changes
  const [basisWalkKey, setBasisWalkKey] = useState(0);
  
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
      inceptionDataRef.current = {
        inception_basis_year: data.inception_basis_year,
        contributed_cash_property: data.contributed_cash_property,
        purchase_price: data.purchase_price,
        gift_inheritance: data.gift_inheritance,
        taxable_compensation: data.taxable_compensation,
        inception_basis_total: data.inception_basis_total,
      };
    } catch (error) {
      console.error('Failed to load ownership interest:', error);
    } finally {
      setLoading(false);
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

  // Inception Basis field handlers (save directly to ownership interest)
  const handleInceptionChange = useCallback((field: keyof OwnershipInterest, value: any) => {
    inceptionDataRef.current = { ...inceptionDataRef.current, [field]: value };
    inceptionPendingRef.current.add(field);
  }, []);

  const saveInceptionField = useCallback(async (field: keyof OwnershipInterest) => {
    if (!inceptionPendingRef.current.has(field)) return;

    setSaveStatus('saving');
    try {
      const payload = { [field]: inceptionDataRef.current[field] };

      const updated = await fetchWrapper.put(`/api/ownership-interests/${interestId}`, payload);
      setInterest(updated);
      inceptionDataRef.current = { ...inceptionDataRef.current, ...payload };
      inceptionPendingRef.current.delete(field);
      setSaveStatus('saved');
      // Trigger BasisWalk refresh when inception values change
      if (field === 'inception_basis_year' || field === 'inception_basis_total') {
        setBasisWalkKey(prev => prev + 1);
      }
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
      setSaveStatus('error');
    }
  }, [interestId]);

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

  // Generate year options (current year -10 to current year, but not before inception_basis_year)
  const currentYear = new Date().getFullYear();
  const inceptionYear = interest?.inception_basis_year ?? null;
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - i)
    .filter(year => inceptionYear === null || year >= inceptionYear);
  
  // Filter carryforwards to show only those where origin_year <= selected taxYear
  const filteredCarryforwards = carryforwards.filter(cf => cf.origin_year <= taxYear);

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
      </div>

      {/* Inception Basis Card - Outside of Tabs since it's a one-time value */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Inception Basis</CardTitle>
            <CardDescription>How the partnership interest was originally acquired (one-time acquisition values)</CardDescription>
          </div>
          <InceptionBasisModal
            interest={interest}
            onSave={async (data) => {
              const updated = await fetchWrapper.put(`/api/ownership-interests/${interestId}`, data);
              setInterest(updated);
            }}
            onSaved={() => setBasisWalkKey(prev => prev + 1)}
          />
        </CardHeader>
        <CardContent>
          {interest.inception_date || interest.inception_basis_year ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Inception Date</Label>
                <p className="font-medium">
                  {interest.inception_date 
                    ? new Date(interest.inception_date).toLocaleDateString()
                    : interest.inception_basis_year 
                      ? `${interest.inception_basis_year}` 
                      : '—'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Method</Label>
                <p className="font-medium capitalize">
                  {interest.method_of_acquisition?.replace('_', ' ') ?? '—'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Basis Source</Label>
                <p className="font-mono">
                  {interest.method_of_acquisition === 'purchase' && interest.purchase_price
                    ? `Purchase: ${formatCurrency(parseFloat(interest.purchase_price))}`
                    : interest.method_of_acquisition === 'gift' && interest.gift_donor_basis
                    ? `Gift Basis: ${formatCurrency(parseFloat(interest.gift_donor_basis))}`
                    : interest.method_of_acquisition === 'inheritance' && interest.cost_basis_inherited
                    ? `Inherited: ${formatCurrency(parseFloat(interest.cost_basis_inherited))}`
                    : interest.method_of_acquisition === 'compensation' && interest.taxable_compensation
                    ? `Comp: ${formatCurrency(parseFloat(interest.taxable_compensation))}`
                    : interest.method_of_acquisition === 'contribution' && interest.contributed_cash_property
                    ? `Contrib: ${formatCurrency(parseFloat(interest.contributed_cash_property))}`
                    : '—'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Total Inception Basis</Label>
                <p className="font-mono text-lg font-semibold">
                  {interest.inception_basis_total 
                    ? formatCurrency(parseFloat(interest.inception_basis_total))
                    : '—'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>No inception basis information recorded yet.</p>
              <p className="text-sm">Click "Edit Inception Basis" to add details about how this interest was acquired.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="basis" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="basis">Basis Walk</TabsTrigger>
          <TabsTrigger value="losses">Loss Limitations</TabsTrigger>
          <TabsTrigger value="carryforwards">Carryforwards</TabsTrigger>
        </TabsList>

        {/* Basis Walk Tab */}
        <TabsContent value="basis">
          <BasisWalk 
            key={basisWalkKey}
            interestId={interestId}
            inceptionYear={interest.inception_basis_year}
            inceptionBasis={interest.inception_basis_total}
            onInceptionChange={() => setBasisWalkKey(prev => prev + 1)}
          />
        </TabsContent>

        {/* Loss Limitations Tab */}
        <TabsContent value="losses">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
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
                <CardDescription>
                  EBL carryover from year N becomes NOL in year N+1 (per Form 461)
                </CardDescription>
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
                    label="EBL Carryover → NOL Next Year"
                    value={lossLimitation?.excess_business_loss_carryover}
                    onChange={(v) => handleLossChange('excess_business_loss_carryover', v || null)}
                    onBlur={() => saveLossField('excess_business_loss_carryover')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Net Operating Loss (NOL)</CardTitle>
                <CardDescription>
                  Post-2017 NOLs are limited to 80% of taxable income (in years after 2020)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <MoneyInput
                    label="NOL Deduction Used"
                    value={lossLimitation?.nol_deduction_used}
                    onChange={(v) => handleLossChange('nol_deduction_used', v || null)}
                    onBlur={() => saveLossField('nol_deduction_used')}
                  />
                  <MoneyInput
                    label="NOL Carryforward"
                    value={lossLimitation?.nol_carryforward}
                    onChange={(v) => handleLossChange('nol_carryforward', v || null)}
                    onBlur={() => saveLossField('nol_carryforward')}
                  />
                  <MoneyInput
                    label="80% Limit (if applicable)"
                    value={lossLimitation?.nol_80_percent_limit}
                    onChange={(v) => handleLossChange('nol_80_percent_limit', v || null)}
                    onBlur={() => saveLossField('nol_80_percent_limit')}
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
                <CardDescription>Track suspended losses from prior years (showing carryforwards from {taxYear} and earlier)</CardDescription>
              </div>
              <Button size="sm" onClick={addCarryforward}>
                <Plus className="mr-2 h-4 w-4" /> Add Carryforward
              </Button>
            </CardHeader>
            <CardContent>
              {filteredCarryforwards.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No loss carryforwards recorded for {taxYear} or earlier
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredCarryforwards.map((cf) => (
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
