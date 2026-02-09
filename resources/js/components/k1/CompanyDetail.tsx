import { ArrowRight,Building2, ChevronLeft, ChevronRight, FileText, Plus, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo,useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchWrapper } from '@/fetchWrapper';
import { formatPercentage } from '@/lib/currency';
import type { K1Company, OwnershipInterest } from '@/types/k1';

import AddOwnershipInterest from './AddOwnershipInterest';

interface Props {
  companyId: number;
}

export default function CompanyDetail({ companyId }: Props) {
  const [company, setCompany] = useState<K1Company | null>(null);
  const [ownershipInterests, setOwnershipInterests] = useState<OwnershipInterest[]>([]);
  const [ownedByInterests, setOwnedByInterests] = useState<OwnershipInterest[]>([]);
  const [allCompanies, setAllCompanies] = useState<K1Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [comp, owned, ownedBy, all] = await Promise.all([
        fetchWrapper.get(`/api/companies/${companyId}`),
        fetchWrapper.get(`/api/companies/${companyId}/ownership-interests`), // Now includes k1Forms
        fetchWrapper.get(`/api/companies/${companyId}/owned-by`),
        fetchWrapper.get('/api/companies'),
      ]);
      setCompany(comp);
      setOwnershipInterests(owned);
      setOwnedByInterests(ownedBy);
      setAllCompanies(all);
    } catch (error) {
      console.error('Failed to load company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const reloadInterests = async () => {
    try {
      const interests = await fetchWrapper.get(`/api/companies/${companyId}/ownership-interests`);
      setOwnershipInterests(interests);
    } catch (error) {
      console.error('Failed to reload interests:', error);
    }
  };

  const handleDeleteOwnership = async (interestId: number) => {
    if (!confirm('Are you sure you want to delete this ownership interest? All associated basis and loss data will be deleted.')) {
      return;
    }
    try {
      await fetchWrapper.delete(`/api/ownership-interests/${interestId}`, {});
      // Reload interests
      const interests = await fetchWrapper.get(`/api/companies/${companyId}/ownership-interests`);
      setOwnershipInterests(interests);
    } catch (error) {
      console.error('Failed to delete ownership interest:', error);
    }
  };

  const handleK1Click = async (interest: OwnershipInterest, year: number) => {
    // Check if K1 exists
    const existingForm = interest.k1_forms?.find(f => f.tax_year === year);
    
    if (existingForm) {
      // Navigate to existing form
      window.location.href = `/ownership/${interest.id}/k1/${existingForm.id}`;
    } else {
      // Create new K1
      try {
        const newForm = await fetchWrapper.post(`/api/ownership-interests/${interest.id}/k1s`, {
          tax_year: year
        });
        window.location.href = `/ownership/${interest.id}/k1/${newForm.id}`;
      } catch (error) {
        console.error('Failed to create K1 form:', error);
        alert('Failed to create K1 form. Please try again.');
      }
    }
  };

  // Grouping Logic
  const { years, groupedByYear } = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearSet = new Set<number>();
    
    // Collect years from interests
    ownershipInterests.forEach(interest => {
      const startYear = interest.inception_basis_year || 
                       (interest.effective_from ? new Date(interest.effective_from).getFullYear() : 2020);
      
      for (let y = startYear; y <= currentYear; y++) {
        yearSet.add(y);
      }
    });

    const sortedYears = Array.from(yearSet).sort((a, b) => b - a); // Descending

    const grouped = sortedYears.map(year => ({
      year,
      interests: ownershipInterests.filter(interest => {
         const startYear = interest.inception_basis_year || 
                          (interest.effective_from ? new Date(interest.effective_from).getFullYear() : 2020);
         // Filter logic: assume interest is active if year >= startYear
         // Could also check effective_to if we had it populated strictly
         return year >= startYear;
      })
    }));

    return { years: sortedYears, groupedByYear: grouped };
  }, [ownershipInterests]);


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
        </div>
        <AddOwnershipInterest 
          ownerCompanyId={companyId}
          availableCompanies={availableCompaniesToOwn}
          onSuccess={reloadInterests}
        />
      </div>

      <Tabs defaultValue="year" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="year">Group by Year</TabsTrigger>
          <TabsTrigger value="interest">Group by Ownership Interest</TabsTrigger>
        </TabsList>

        <TabsContent value="year" className="space-y-6">
          {groupedByYear.map(({ year, interests }) => (
            <Card key={year}>
              <CardHeader className="py-4">
                <CardTitle className="text-lg font-medium">Tax Year {year}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ownership Interest (Entity)</TableHead>
                      <TableHead className="text-right">Ownership %</TableHead>
                      <TableHead className="w-[200px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No active ownership interests for this year.
                        </TableCell>
                      </TableRow>
                    ) : (
                      interests.map((interest) => {
                        const hasK1 = interest.k1_forms?.some(f => f.tax_year === year);
                        return (
                          <TableRow key={interest.id}>
                            <TableCell className="font-medium">
                              {interest.owned_company?.name || 'Unknown Entity'}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {formatPercentage(interest.ownership_percentage)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.location.href = `/ownership/${interest.id}`}
                                >
                                  Details
                                </Button>
                                <Button
                                  variant={hasK1 ? "secondary" : "default"}
                                  size="sm"
                                  onClick={() => handleK1Click(interest, year)}
                                >
                                  {hasK1 ? (
                                    <>
                                      <FileText className="h-4 w-4 mr-2" />
                                      View K-1
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add K-1
                                    </>
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
          {groupedByYear.length === 0 && (
             <div className="text-center py-8 text-muted-foreground">
               No ownership interests found. Add one to see years.
             </div>
          )}
        </TabsContent>

        <TabsContent value="interest" className="space-y-6">
          {ownershipInterests.map((interest) => {
             const startYear = interest.inception_basis_year || 
                              (interest.effective_from ? new Date(interest.effective_from).getFullYear() : 2020);
             const currentYear = new Date().getFullYear();
             const interestYears = [];
             for (let y = currentYear; y >= startYear; y--) {
               interestYears.push(y);
             }

             return (
              <Card key={interest.id}>
                <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg font-medium">
                        {interest.owned_company?.name || 'Unknown Entity'}
                      </CardTitle>
                      <CardDescription>
                        {formatPercentage(interest.ownership_percentage)} Ownership
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = `/ownership/${interest.id}`}
                    >
                      Full Details <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteOwnership(interest.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tax Year</TableHead>
                        <TableHead className="text-right">K-1 Status</TableHead>
                        <TableHead className="w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {interestYears.map(year => {
                         const k1 = interest.k1_forms?.find(f => f.tax_year === year);
                         return (
                           <TableRow key={year}>
                             <TableCell className="font-medium">{year}</TableCell>
                             <TableCell className="text-right">
                               {k1 ? (
                                 <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                   Recorded
                                 </Badge>
                               ) : (
                                 <Badge variant="outline" className="text-muted-foreground">
                                   Missing
                                 </Badge>
                               )}
                             </TableCell>
                             <TableCell>
                               <Button
                                  variant={k1 ? "secondary" : "default"}
                                  size="sm"
                                  className="w-full"
                                  onClick={() => handleK1Click(interest, year)}
                                >
                                  {k1 ? 'View K-1' : 'Add K-1'}
                                </Button>
                             </TableCell>
                           </TableRow>
                         );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
          {ownershipInterests.length === 0 && (
             <div className="text-center py-8 text-muted-foreground">
               No ownership interests found.
             </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Owned By Section (Secondary) */}
      <div className="mt-12 pt-8 border-t">
         <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Shareholders / Owners of {company.name}
         </h3>
         <Card>
           <CardContent className="p-0">
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Ownership %</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ownedByInterests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                        No owners recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    ownedByInterests.map((interest) => (
                      <TableRow key={interest.id}>
                        <TableCell>
                          {interest.owner_company ? (
                            <span className="font-medium">
                              {interest.owner_company.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Individual Owner</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatPercentage(interest.ownership_percentage)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {interest.ownership_class || '—'}
                        </TableCell>
                        <TableCell>
                          {interest.owner_company && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.location.href = `/company/${interest.owner_company!.id}`}
                            >
                              View
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
             </Table>
           </CardContent>
         </Card>
      </div>
    </div>
  );
}