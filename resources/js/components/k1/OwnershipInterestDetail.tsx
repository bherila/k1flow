import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import {useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { fetchWrapper } from '@/fetchWrapper';
import { formatCurrency } from '@/lib/currency';
import type { K1Company,OwnershipInterest } from '@/types/k1';

import BasisWalk from './BasisWalk';
import InceptionBasisModal from './InceptionBasisModal';
import InterestNavigation from './InterestNavigation';

interface Props {
  interestId: number;
}

export default function OwnershipInterestDetail({ interestId }: Props) {
  console.log('[OwnershipInterestDetail] Component mounting with interestId:', interestId);
  
  const [interest, setInterest] = useState<OwnershipInterest | null>(null);
  const [ownerCompany, setOwnerCompany] = useState<K1Company | null>(null);
  const [ownedCompany, setOwnedCompany] = useState<K1Company | null>(null);
  
  // Inception Basis state (stored on ownership interest itself)
  const inceptionDataRef = useRef<Partial<OwnershipInterest>>({});
  
  // Key to force BasisWalk refresh when inception changes
  const [basisWalkKey, setBasisWalkKey] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const loadInterest = useCallback(async () => {
    console.log('[OwnershipInterestDetail] Loading interest data...');
    try {
      const data = await fetchWrapper.get(`/api/ownership-interests/${interestId}`);
      console.log('[OwnershipInterestDetail] Interest data loaded:', data);
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
      console.log('[OwnershipInterestDetail] Setting loading to false');
      setLoading(false);
    }
  }, [interestId]);

  useEffect(() => {
    loadInterest();
  }, [loadInterest]);

  if (loading) {
    console.log('[OwnershipInterestDetail] Rendering loading state');
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (!interest || !ownedCompany) {
    console.log('[OwnershipInterestDetail] No interest or ownedCompany, showing error');
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
        <div className="flex gap-2">
          <InterestNavigation interestId={interestId} activeView="summary" />
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

      <BasisWalk 
        key={basisWalkKey}
        interestId={interestId}
        inceptionYear={interest.inception_basis_year}
        inceptionBasis={interest.inception_basis_total}
        onInceptionChange={() => setBasisWalkKey(prev => prev + 1)}
      />
    </div>
  );
}