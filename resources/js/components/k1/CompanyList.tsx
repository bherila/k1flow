import * as React from 'react';
import { useState, useEffect } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { K1Company } from '@/types/k1';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Building2, ChevronRight, Pencil, Trash2 } from 'lucide-react';

export default function CompanyList() {
  const [companies, setCompanies] = useState<K1Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<K1Company | null>(null);
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
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await fetchWrapper.get('/api/companies');
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
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
    setEditingCompany(null);
  };

  const handleOpenDialog = (company?: K1Company) => {
    if (company) {
      setEditingCompany(company);
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
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await fetchWrapper.put(`/api/companies/${editingCompany.id}`, formData);
      } else {
        await fetchWrapper.post('/api/companies', formData);
      }
      setDialogOpen(false);
      resetForm();
      loadCompanies();
    } catch (error) {
      console.error('Failed to save company:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this company? All associated K-1 data will be deleted.')) {
      return;
    }
    try {
      await fetchWrapper.delete(`/api/companies/${id}`, {});
      loadCompanies();
    } catch (error) {
      console.error('Failed to delete company:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Companies</h2>
          <p className="text-muted-foreground">
            Manage your K-1 issuing entities
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingCompany ? 'Edit Company' : 'Add Company'}</DialogTitle>
                <DialogDescription>
                  {editingCompany ? 'Update company details' : 'Add a new company to track K-1 forms'}
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
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCompany ? 'Save Changes' : 'Add Company'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No companies yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first company to start tracking K-1 forms
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>EIN</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead className="text-center">K-1 Forms</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <a 
                      href={`/company/${company.id}`}
                      className="font-medium hover:underline flex items-center"
                    >
                      {company.name}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </a>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{company.ein || '-'}</TableCell>
                  <TableCell>{company.entity_type || '-'}</TableCell>
                  <TableCell className="text-center">{company.k1_forms_count || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(company)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(company.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
