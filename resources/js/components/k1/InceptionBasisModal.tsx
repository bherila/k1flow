import * as React from 'react';
import { useState, useEffect } from 'react';
import type { OwnershipInterest, MethodOfAcquisition } from '@/types/k1';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { DateHelper } from '@/lib/DateHelper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Edit2 } from 'lucide-react';

interface InceptionBasisData {
  inception_date: string | null;
  method_of_acquisition: MethodOfAcquisition | null;
  // Purchase method
  purchase_price: string | null;
  // Gift method
  gift_date: string | null;
  gift_donor_basis: string | null;
  gift_fmv_at_transfer: string | null;
  // Inheritance method
  inheritance_date: string | null;
  cost_basis_inherited: string | null;
  // Taxable Compensation method
  taxable_compensation: string | null;
  // Contribution method (or additional contribution for gift/inheritance)
  contributed_cash_property: string | null;
  // Calculated total
  inception_basis_total: string | null;
}

interface Props {
  interest: OwnershipInterest;
  onSave: (data: Partial<InceptionBasisData>) => Promise<void>;
  onSaved?: () => void;
}

const METHOD_LABELS: Record<MethodOfAcquisition, string> = {
  purchase: 'Purchase',
  gift: 'Gift',
  inheritance: 'Inheritance',
  compensation: 'Taxable Compensation',
  contribution: 'Contribution of Cash/Property',
};

export default function InceptionBasisModal({ interest, onSave, onSaved }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [inceptionDate, setInceptionDate] = useState(interest.inception_date ?? '');
  const [method, setMethod] = useState<MethodOfAcquisition | ''>(interest.method_of_acquisition ?? 'purchase');
  
  // Purchase fields
  const [purchasePrice, setPurchasePrice] = useState(interest.purchase_price ?? '');
  
  // Gift fields
  const [giftDate, setGiftDate] = useState(interest.gift_date ?? '');
  const [giftDonorBasis, setGiftDonorBasis] = useState(interest.gift_donor_basis ?? '');
  const [giftFmv, setGiftFmv] = useState(interest.gift_fmv_at_transfer ?? '');
  
  // Inheritance fields
  const [inheritanceDate, setInheritanceDate] = useState(interest.inheritance_date ?? '');
  const [costBasisInherited, setCostBasisInherited] = useState(interest.cost_basis_inherited ?? '');
  
  // Compensation field
  const [taxableCompensation, setTaxableCompensation] = useState(interest.taxable_compensation ?? '');
  
  // Additional contribution (for gift/inheritance or as main method)
  const [contributedCashProperty, setContributedCashProperty] = useState(interest.contributed_cash_property ?? '');
  
  // Total
  const [total, setTotal] = useState(interest.inception_basis_total ?? '');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      // Use DateHelper to convert date strings to YYYY-MM-DD format for input[type=date]
      setInceptionDate(DateHelper.toInputDate(interest.inception_date));
      setMethod(interest.method_of_acquisition ?? 'purchase');
      setPurchasePrice(interest.purchase_price ?? '');
      setGiftDate(DateHelper.toInputDate(interest.gift_date));
      setGiftDonorBasis(interest.gift_donor_basis ?? '');
      setGiftFmv(interest.gift_fmv_at_transfer ?? '');
      setInheritanceDate(DateHelper.toInputDate(interest.inheritance_date));
      setCostBasisInherited(interest.cost_basis_inherited ?? '');
      setTaxableCompensation(interest.taxable_compensation ?? '');
      setContributedCashProperty(interest.contributed_cash_property ?? '');
      setTotal(interest.inception_basis_total ?? '');
    }
  }, [open, interest]);

  // Calculate total based on method
  useEffect(() => {
    let calculatedTotal = 0;
    
    switch (method) {
      case 'purchase':
        calculatedTotal = parseFloat(purchasePrice) || 0;
        break;
      case 'gift':
        // Gift basis is typically the lesser of donor's basis or FMV at transfer
        // But we let user specify - gift_donor_basis is the carryover basis
        calculatedTotal = parseFloat(giftDonorBasis) || 0;
        break;
      case 'inheritance':
        // Stepped-up basis at date of death (usually FMV)
        calculatedTotal = parseFloat(costBasisInherited) || 0;
        break;
      case 'compensation':
        calculatedTotal = parseFloat(taxableCompensation) || 0;
        break;
      case 'contribution':
        calculatedTotal = parseFloat(contributedCashProperty) || 0;
        break;
      default:
        calculatedTotal = 0;
    }
    
    // Additional contributions can be added for gift/inheritance
    if (method === 'gift' || method === 'inheritance') {
      calculatedTotal += parseFloat(contributedCashProperty) || 0;
    }
    
    setTotal(calculatedTotal > 0 ? calculatedTotal.toFixed(2) : '');
  }, [method, purchasePrice, giftDonorBasis, costBasisInherited, taxableCompensation, contributedCashProperty]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Extract year from inception date for backwards compatibility
      const inceptionYear = inceptionDate ? new Date(inceptionDate).getFullYear() : null;
      
      const data: Partial<InceptionBasisData> & { inception_basis_year?: number | null } = {
        inception_date: inceptionDate || null,
        inception_basis_year: inceptionYear,
        method_of_acquisition: method || null,
        purchase_price: method === 'purchase' ? (purchasePrice || null) : null,
        gift_date: method === 'gift' ? (giftDate || null) : null,
        gift_donor_basis: method === 'gift' ? (giftDonorBasis || null) : null,
        gift_fmv_at_transfer: method === 'gift' ? (giftFmv || null) : null,
        inheritance_date: method === 'inheritance' ? (inheritanceDate || null) : null,
        cost_basis_inherited: method === 'inheritance' ? (costBasisInherited || null) : null,
        taxable_compensation: method === 'compensation' ? (taxableCompensation || null) : null,
        contributed_cash_property: (method === 'contribution' || method === 'gift' || method === 'inheritance') 
          ? (contributedCashProperty || null) 
          : null,
        inception_basis_total: total || null,
      };
      
      await onSave(data);
      setOpen(false);
      onSaved?.();
    } catch (error) {
      console.error('Failed to save inception basis:', error);
    } finally {
      setSaving(false);
    }
  };

  const showAdditionalContribution = method === 'gift' || method === 'inheritance';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Inception Basis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Inception Basis</DialogTitle>
          <DialogDescription>
            How the partnership interest was originally acquired. This is a one-time value at acquisition.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Inception Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inception-date">Inception Date</Label>
              <Input
                id="inception-date"
                type="date"
                value={inceptionDate}
                onChange={(e) => setInceptionDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Method of Acquisition</Label>
              <Select 
                value={method} 
                onValueChange={(v) => setMethod(v as MethodOfAcquisition)}
              >
                <SelectTrigger id="method">
                  <SelectValue placeholder="Select method..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(METHOD_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Purchase Fields */}
          {method === 'purchase' && (
            <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
              <Label htmlFor="purchase-price">Purchase Price</Label>
              <Input
                id="purchase-price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                The amount paid to acquire the partnership interest from another party.
              </p>
            </div>
          )}

          {/* Gift Fields */}
          {method === 'gift' && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gift-date">Date of Gift</Label>
                  <Input
                    id="gift-date"
                    type="date"
                    value={giftDate}
                    onChange={(e) => setGiftDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gift-fmv">FMV at Transfer</Label>
                  <Input
                    id="gift-fmv"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={giftFmv}
                    onChange={(e) => setGiftFmv(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gift-basis">Donor's Carryover Basis</Label>
                <Input
                  id="gift-basis"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={giftDonorBasis}
                  onChange={(e) => setGiftDonorBasis(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Your basis is generally the donor's basis (carryover basis). If FMV at transfer is less than 
                  donor's basis, special rules may apply for losses.
                </p>
              </div>
            </div>
          )}

          {/* Inheritance Fields */}
          {method === 'inheritance' && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="space-y-2">
                <Label htmlFor="inheritance-date">Date of Inheritance (Date of Death)</Label>
                <Input
                  id="inheritance-date"
                  type="date"
                  value={inheritanceDate}
                  onChange={(e) => setInheritanceDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost-basis-inherited">Cost Basis (Stepped-up FMV)</Label>
                <Input
                  id="cost-basis-inherited"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={costBasisInherited}
                  onChange={(e) => setCostBasisInherited(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Generally the fair market value at date of death (stepped-up basis). 
                  This may include IRD adjustments for certain items.
                </p>
              </div>
            </div>
          )}

          {/* Taxable Compensation Fields */}
          {method === 'compensation' && (
            <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
              <Label htmlFor="taxable-compensation">Taxable Compensation Amount</Label>
              <Input
                id="taxable-compensation"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={taxableCompensation}
                onChange={(e) => setTaxableCompensation(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                The amount recognized as taxable compensation when the interest was received 
                for services (profits interest, carried interest, etc.).
              </p>
            </div>
          )}

          {/* Contribution Fields (main method or additional for gift/inheritance) */}
          {(method === 'contribution' || showAdditionalContribution) && (
            <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
              <Label htmlFor="contribution">
                {showAdditionalContribution 
                  ? 'Additional Cash/Property Contribution (Optional)' 
                  : 'Contributed Cash/Property'}
              </Label>
              <Input
                id="contribution"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={contributedCashProperty}
                onChange={(e) => setContributedCashProperty(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                {showAdditionalContribution 
                  ? 'If you also contributed cash or property in addition to the gift/inheritance.'
                  : 'The value of cash and/or property contributed to the partnership.'}
              </p>
            </div>
          )}

          {/* Total */}
          {method && (
            <div className="flex items-center justify-between p-4 border-2 rounded-lg bg-primary/5">
              <div>
                <Label className="text-base font-semibold">Inception Basis Total</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Starting basis in your partnership interest
                </p>
              </div>
              <div className="text-2xl font-mono font-bold">
                {total ? formatCurrency(parseFloat(total)) : '$0.00'}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !inceptionDate || !method}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Inception Basis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
