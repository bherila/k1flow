import * as React from 'react';
import { useState, useEffect } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { K1Company, K1Form } from '@/types/k1';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, ChevronLeft, ChevronRight, Pencil, Trash2, Building2 } from 'lucide-react';

interface Props {
  companyId: number;
}

export default function CompanyDetail({ companyId }: Props) {
  const [company, setCompany] = useState<K1Company | null>(null);
  const [forms, setForms] = useState<K1Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ tax_year: new Date().getFullYear() - 1 });

  useEffect(() => {
    loadCompany();
    loadForms();
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

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newForm = await fetchWrapper.post(`/api/companies/${companyId}/forms`, formData);
      setDialogOpen(false);
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add K-1 Form
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
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create K-1</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* K-1 Forms List */}
      <Card>
        <CardHeader>
          <CardTitle>K-1 Forms by Tax Year</CardTitle>
          <CardDescription>
            Schedule K-1 forms showing partner's share of income, deductions, and credits
          </CardDescription>
        </CardHeader>
        <CardContent>
          {forms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No K-1 forms yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add your first K-1 form to start tracking
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add K-1 Form
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tax Year</TableHead>
                  <TableHead className="text-right">Ordinary Income</TableHead>
                  <TableHead className="text-right">Ending Capital</TableHead>
                  <TableHead className="text-right">Total Liabilities</TableHead>
                  <TableHead className="text-right">Profit %</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
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
                    <TableCell className="text-right font-mono">
                      {formatCurrency(form.box_1_ordinary_income)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(form.ending_capital_account)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(form.total_liabilities)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatPercentage(form.share_of_profit_ending)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.location.href = `/company/${companyId}/k1/${form.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteForm(form.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
  );
}
