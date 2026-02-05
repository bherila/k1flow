// React namespace not required; using named imports when needed
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ChevronLeft } from 'lucide-react';

interface Props {
  interestId: number;
  year: number;
  activeTab: 'basis' | 'at-risk' | 'passive-activity-loss' | 'excess-business-loss' | 'net-operating-loss';
  inceptionYear?: number | null | undefined;
}

export function LossLimitationTabs({ interestId, year, activeTab, inceptionYear }: Props) {
  const currentYear = new Date().getFullYear();
  const effectiveInceptionYear = inceptionYear || 1900;

  const getUrl = (tab: string, targetYear: number) => {
    switch (tab) {
      case 'basis':
        return `/ownership/${interestId}/basis/${targetYear}/adjustments`;
      case 'at-risk':
        return `/ownership/${interestId}/at-risk/${targetYear}`;
      case 'passive-activity-loss':
        return `/ownership/${interestId}/passive-activity-loss/${targetYear}`;
      case 'excess-business-loss':
        return `/ownership/${interestId}/excess-business-loss/${targetYear}`;
      case 'net-operating-loss':
        return `/ownership/${interestId}/net-operating-loss/${targetYear}`;
      default:
        return `/ownership/${interestId}`;
    }
  };

  const handleTabChange = (newTab: string) => {
    window.location.href = getUrl(newTab, year);
  };

  const canGoBack = year > effectiveInceptionYear;
  const canGoForward = year < currentYear;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Button 
          variant="ghost" 
          className="pl-0 gap-2 text-muted-foreground hover:text-foreground" 
          onClick={() => window.location.href = `/ownership/${interestId}`}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Summary
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={!canGoBack}
            onClick={() => window.location.href = getUrl(activeTab, year - 1)}
          >
            <ArrowLeft className="h-4 w-4" />
            {year - 1}
          </Button>
          
          <div className="px-4 py-1.5 bg-muted rounded-md text-sm font-bold border shadow-sm">
            {year}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={!canGoForward}
            onClick={() => window.location.href = getUrl(activeTab, year + 1)}
          >
            {year + 1}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-5 w-full h-10">
          <TabsTrigger value="basis" className="text-xs sm:text-sm">Basis Adjustments</TabsTrigger>
          <TabsTrigger value="at-risk" className="text-xs sm:text-sm">At-Risk</TabsTrigger>
          <TabsTrigger value="passive-activity-loss" className="text-xs sm:text-sm">Passive Activity</TabsTrigger>
          <TabsTrigger value="excess-business-loss" className="text-xs sm:text-sm">Excess Business</TabsTrigger>
          <TabsTrigger value="net-operating-loss" className="text-xs sm:text-sm">NOL</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
