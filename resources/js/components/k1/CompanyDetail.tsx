import * as React from 'react';
import { useState, useEffect } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { K1Company, K1Form, OwnershipInterest } from '@/types/k1';
import { formatCurrency, formatPercentage } from '@/lib/currency';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, FileText, ChevronLeft, ChevronRight, Pencil, Trash2, Building2, Link2, Users } from 'lucide-react';

interface Props {
  companyId: number;
}

export default function CompanyDetail({ companyId }: Props) {
  const [company, setCompany] = useState<K1Company | null>(null);
  const [forms, setForms] = useState<K1Form[]>([]);
  const [ownershipInterests, setOwnershipInterests] = useState<OwnershipInterest[]>([]);
  const [ownedByInterests, setOwnedByInterests] = useState<OwnershipInterest[]>([]);
  const [allCompanies, setAllCompanies] = useState<K1Company[]>([]);
  const [loading, setLoading] = useState(true);
  
  // K-1 form dialog
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ tax_year: new Date().getFullYear() - 1 });
  
  // Ownership interest dialog
  const [ownershipDialogOpen, setOwnershipDialogOpen] = useState(false);
  const [ownershipFormData, setOwnershipFormData] = useState({
    owned_company_id: '',
    ownership_percentage: '',
    ownership_class: '',
  });

  useEffect(() => {
    loadCompany();
    loadForms();
    loadOwnershipInterests();
    loadOwnedByInterests();
    loadAllCompanies();
  }, [companyId]);

  const loadCompany = async () => {
    try {
      const data = await fetchWrapper.get(`/api/companies/${companyId}`);
      setCompany(data);
    } catch (error) {
      console.error('Failed to load company:', error);
    }
  };

  const loadForms = async () => {
    try {
      const data = await fetchWrapper.get(`/api/companies/${companyId}/forms`);
      setForms(data);
    } catch (error) {
      console.error('Failed to load forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOwnershipInterests = async () => {
    try {
      const data = await fetchWrapper.get(`/api/companies/${companyId}/ownership-interests`);
      setOwnershipInterests(data);
    } catch (error) {
      console.error('Failed to load ownership interests:', error);
    }
  };

  const loadOwnedByInterests = async () => {
    try {
      const data = await fetchWrapper.get(`/api/companies/${companyId}/owned-by`);
      setOwnedByInterests(data);
    } catch (error) {
      console.error('Failed to load owned-by interests:', error);
    }
  };

  const loadAllCompanies = async () => {
    try {
      const data = await fetchWrapper.get('/api/companies');
      setAllCompanies(data);
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newForm = await fetchWrapper.post(`/api/companies/${companyId}/forms`, formData);
      setFormDialogOpen(false);
      // Navigate to the new form
      window.location.href = `/company/${companyId}/k1/${newForm.id}`;
    } catch (error) {
      console.error('Failed to create form:', error);
    }
  };

  const handleDeleteForm = async (formId: number) => {
    if (!confirm('Are you sure you want to delete this K-1 form? All associated data will be deleted.')) {
      return;
    }
    try {
      await fetchWrapper.delete(`/api/companies/${companyId}/forms/${formId}`, {});
      loadForms();
    } catch (error) {
      console.error('Failed to delete form:', error);
    }
  };

  const handleCreateOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWrapper.post('/api/ownership-interests', {
        owner_company_id: companyId,
        owned_company_id: parseInt(ownershipFormData.owned_company_id),
        ownership_percentage: parseFloat(ownershipFormData.ownership_percentage),
        ownership_class: ownershipFormData.ownership_class || null,
      });
      setOwnershipDialogOpen(false);
      setOwnershipFormData({ owned_company_id: '', ownership_percentage: '', ownership_class: '' });
      loadOwnershipInterests();
    } catch (error) {
      console.error('Failed to create ownership interest:', error);
    }
  };

  const handleDeleteOwnership = async (interestId: number) => {
    if (!confirm('Are you sure you want to delete this ownership interest? All associated basis and loss data will be deleted.')) {
      return;
    }
    try {
      await fetchWrapper.delete(`/api/ownership-interests/${interestId}`, {});
      loadOwnershipInterests();
    } catch (error) {
      console.error('Failed to delete ownership interest:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Company not found</h2>
        <Button variant="link" onClick={() => window.location.href = '/'}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to companies
        </Button>
      </div>
    );
  }

  // Filter out the current company from the list of available companies to own
  const availableCompaniesToOwn = allCompanies.filter(c => c.id !== companyId);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/" className="hover:text-foreground">Companies</a>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{company.name}</span>
      </div>

      {/* Company Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            {company.ein && <span className="font-mono">EIN: {company.ein}</span>}
            {company.entity_type && <span>{company.entity_type}</span>}
          </div>
          {(company.address || company.city) && (
            <p className="text-sm text-muted-foreground mt-1">
              {[company.address, company.city, company.state, company.zip].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* K-1 Forms Column */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>K-1 Forms by Tax Year</CardTitle>
              <CardDescription>
                Schedule K-1 forms showing partner's share of income
              </CardDescription>
            </div>
            <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add K-1
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateForm}>
                  <DialogHeader>
                    <DialogTitle>Add K-1 Form</DialogTitle>
                    <DialogDescription>
                      Create a new K-1 form for a tax year
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tax_year">Tax Year *</Label>
                      <Input
                        id="tax_year"
                        type="number"
                        min="1900"
                        max="2100"
                        value={formData.tax_year}
                        onChange={(e) => setFormData({ tax_year: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setFormDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create K-1</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {forms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="text-sm font-semibold mb-1">No K-1 forms yet</h3>
                <p className="text-xs text-muted-foreground text-center mb-3">
                  Add your first K-1 form to start tracking
                </p>
                <Button size="sm" onClick={() => setFormDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add K-1
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tax Year</TableHead>
                    <TableHead className="text-right">Ordinary Income</TableHead>
                    <TableHead className="text-right">Profit %</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell>
                        <a
                          href={`/company/${companyId}/k1/${form.id}`}
                          className="font-medium hover:underline flex items-center"
                        >
                          {form.tax_year}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </a>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(form.box_1_ordinary_income)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatPercentage(form.share_of_profit_ending)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.location.href = `/company/${companyId}/k1/${form.id}`}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteForm(form.id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Ownership Interests Column */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Ownership Interests</CardTitle>
              <CardDescription>
                Partnerships and entities this company owns
              </CardDescription>
            </div>
            <Dialog open={ownershipDialogOpen} onOpenChange={setOwnershipDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Interest
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateOwnership}>
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
                        value={ownershipFormData.owned_company_id}
                        onValueChange={(value) => setOwnershipFormData(prev => ({ ...prev, owned_company_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCompaniesToOwn.map((c) => (
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
                        value={ownershipFormData.ownership_percentage}
                        onChange={(e) => setOwnershipFormData(prev => ({ ...prev, ownership_percentage: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ownership_class">Class (optional)</Label>
                      <Input
                        id="ownership_class"
                        placeholder="e.g., Class A, Common"
                        value={ownershipFormData.ownership_class}
                        onChange={(e) => setOwnershipFormData(prev => ({ ...prev, ownership_class: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOwnershipDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!ownershipFormData.owned_company_id || !ownershipFormData.ownership_percentage}>
                      Add Interest
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {ownershipInterests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Link2 className="h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="text-sm font-semibold mb-1">No ownership interests</h3>
                <p className="text-xs text-muted-foreground text-center mb-3">
                  Add partnerships or entities this company owns
                </p>
                <Button size="sm" onClick={() => setOwnershipDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Interest
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead className="text-right">Ownership %</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ownershipInterests.map((interest) => (
                    <TableRow key={interest.id}>
                      <TableCell>
                        <a
                          href={`/ownership/${interest.id}`}
                          className="font-medium hover:underline flex items-center"
                        >
                          {interest.owned_company?.name ?? 'Unknown'}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </a>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatPercentage(interest.ownership_percentage)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {interest.ownership_class || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.location.href = `/ownership/${interest.id}`}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteOwnership(interest.id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Owned By Section (read-only) */}
      {ownedByInterests.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Owned By</CardTitle>
                <CardDescription>
                  Companies that have ownership interests in this entity. 
                  To manage these interests, visit the owning company's page.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Ownership %</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="w-[100px]">Manage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ownedByInterests.map((interest) => (
                  <TableRow key={interest.id}>
                    <TableCell>
                      {interest.owner_company ? (
                        <a
                          href={`/company/${interest.owner_company.id}`}
                          className="font-medium hover:underline flex items-center"
                        >
                          {interest.owner_company.name}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Individual Owner</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatPercentage(interest.ownership_percentage)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {interest.ownership_class || '—'}
                    </TableCell>
                    <TableCell>
                      {interest.owner_company && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = `/company/${interest.owner_company!.id}`}
                        >
                          Go to owner
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
