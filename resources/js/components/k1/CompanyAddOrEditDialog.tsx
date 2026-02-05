import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { K1Company } from '@/types/k1';
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
} from '@/components/ui/dialog';

interface CompanyAddOrEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: K1Company | null;
  onSuccess: () => void;
}

export function CompanyAddOrEditDialog({
  open,
  onOpenChange,
  company,
  onSuccess,
}: CompanyAddOrEditDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    ein: '',
    entity_type: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    notes: '',
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        ein: company.ein || '',
        entity_type: company.entity_type || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        zip: company.zip || '',
        notes: company.notes || '',
      });
    } else {
      setFormData({
        name: '',
        ein: '',
        entity_type: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        notes: '',
      });
    }
  }, [company, open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (company) {
        await fetchWrapper.put(`/api/companies/${company.id}`, formData);
      } else {
        await fetchWrapper.post('/api/companies', formData);
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to save company:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{company ? 'Edit Company' : 'Add Company'}</DialogTitle>
            <DialogDescription>
              {company ? 'Update company details' : 'Add a new company to track K-1 forms'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ein">EIN</Label>
                <Input
                  id="ein"
                  placeholder="XX-XXXXXXX"
                  value={formData.ein}
                  onChange={(e) => setFormData({ ...formData, ein: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="entity_type">Entity Type</Label>
                <Input
                  id="entity_type"
                  placeholder="e.g., Partnership, LLC"
                  value={formData.entity_type}
                  onChange={(e) => setFormData({ ...formData, entity_type: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zip">ZIP</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {company ? 'Save Changes' : 'Add Company'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
