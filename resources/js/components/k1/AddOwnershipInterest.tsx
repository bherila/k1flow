import { useState } from 'react';
import type { FormEvent } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { K1Company, OwnershipInterest, MethodOfAcquisition } from '@/types/k1';
import { Button } from '@/components/ui/button';
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
} from "@/components/ui/select";
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import InceptionBasisModal from './InceptionBasisModal';

interface Props {
  ownerCompanyId: number;
  availableCompanies: K1Company[];
  onSuccess: () => void;
}

interface InceptionData {
  inception_date: string | null;
  method_of_acquisition: MethodOfAcquisition | null;
  purchase_price: string | null;
  gift_date: string | null;
  gift_donor_basis: string | null;
  gift_fmv_at_transfer: string | null;
  inheritance_date: string | null;
  cost_basis_inherited: string | null;
  taxable_compensation: string | null;
  contributed_cash_property: string | null;
  inception_basis_total: string | null;
  inception_basis_year?: number | null;
}

export default function AddOwnershipInterest({ ownerCompanyId, availableCompanies, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    owned_company_id: '',
    ownership_percentage: '',
    ownership_class: '',
  });

  const [inceptionData, setInceptionData] = useState<InceptionData>({
    inception_date: null,
    method_of_acquisition: null,
    purchase_price: null,
    gift_date: null,
    gift_donor_basis: null,
    gift_fmv_at_transfer: null,
    inheritance_date: null,
    cost_basis_inherited: null,
    taxable_compensation: null,
    contributed_cash_property: null,
    inception_basis_total: null,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await fetchWrapper.post('/api/ownership-interests', {
        owner_company_id: ownerCompanyId,
        owned_company_id: parseInt(formData.owned_company_id),
        ownership_percentage: parseFloat(formData.ownership_percentage),
        ownership_class: formData.ownership_class || null,
        ...inceptionData,
      });
      setOpen(false);
      setFormData({ owned_company_id: '', ownership_percentage: '', ownership_class: '' });
      setInceptionData({
        inception_date: null,
        method_of_acquisition: null,
        purchase_price: null,
        gift_date: null,
        gift_donor_basis: null,
        gift_fmv_at_transfer: null,
        inheritance_date: null,
        cost_basis_inherited: null,
        taxable_compensation: null,
        contributed_cash_property: null,
        inception_basis_total: null,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create ownership interest:', error);
    }
  };

  // Mock interest object to pass to InceptionBasisModal
  // It only needs the fields that InceptionBasisModal edits
  const mockInterest: any = {
    ...inceptionData,
  };

  const handleInceptionSave = async (data: Partial<InceptionData>) => {
    setInceptionData(prev => ({ ...prev, ...data }));
    return Promise.resolve();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Ownership Interest
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Ownership Interest</DialogTitle>
            <DialogDescription>
              Add a partnership or entity that this company owns
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="owned_company">Entity Owned *</Label>
              <Select
                value={formData.owned_company_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, owned_company_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a company..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCompanies.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name} {c.ein ? `(${c.ein})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ownership_percentage">Ownership % *</Label>
              <Input
                id="ownership_percentage"
                type="number"
                step="0.00000000001"
                min="0"
                max="100"
                placeholder="e.g., 25.5"
                value={formData.ownership_percentage}
                onChange={(e) => setFormData(prev => ({ ...prev, ownership_percentage: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ownership_class">Class (optional)</Label>
              <Input
                id="ownership_class"
                placeholder="e.g., Class A, Common"
                value={formData.ownership_class}
                onChange={(e) => setFormData(prev => ({ ...prev, ownership_class: e.target.value }))}
              />
            </div>

            <div className="grid gap-2 pt-2 border-t mt-2">
              <div className="flex items-center justify-between">
                <Label>Inception Basis Information</Label>
                <InceptionBasisModal 
                  interest={mockInterest}
                  onSave={handleInceptionSave}
                />
              </div>
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded border">
                {inceptionData.inception_basis_total ? (
                  <div className="flex justify-between items-center">
                    <span>
                      {inceptionData.method_of_acquisition ? 
                        inceptionData.method_of_acquisition.charAt(0).toUpperCase() + inceptionData.method_of_acquisition.slice(1) 
                        : 'Custom'}
                    </span>
                    <span className="font-mono font-medium">
                      {formatCurrency(parseFloat(inceptionData.inception_basis_total))}
                    </span>
                  </div>
                ) : (
                  <span className="italic">Not configured (Optional)</span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.owned_company_id || !formData.ownership_percentage}>
              Add Interest
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
