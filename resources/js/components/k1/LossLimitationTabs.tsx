// React namespace not required; using named imports when needed
import { ArrowLeft, ArrowRight, ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  const canGoBack = year > effectiveInceptionYear;
  const canGoForward = year < currentYear;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Button 
          variant="ghost" 
          className="pl-0 gap-2 text-muted-foreground hover:text-foreground" 
          asChild
        >
          <a href={`/ownership/${interestId}`}>
            <ChevronLeft className="h-4 w-4" />
            Back to Summary
          </a>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={!canGoBack}
            asChild={canGoBack}
          >
            {canGoBack ? (
              <a href={getUrl(activeTab, year - 1)}>
                <ArrowLeft className="h-4 w-4" />
                {year - 1}
              </a>
            ) : (
              <span>
                <ArrowLeft className="h-4 w-4" />
                {year - 1}
              </span>
            )}
          </Button>
          
          <div className="px-4 py-1.5 bg-muted rounded-md text-sm font-bold border shadow-sm">
            {year}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={!canGoForward}
            asChild={canGoForward}
          >
            {canGoForward ? (
              <a href={getUrl(activeTab, year + 1)}>
                {year + 1}
                <ArrowRight className="h-4 w-4" />
              </a>
            ) : (
              <span>
                {year + 1}
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full h-10">
          <TabsTrigger value="basis" asChild className="text-xs sm:text-sm">
            <a href={getUrl('basis', year)}>Basis Adjustments</a>
          </TabsTrigger>
          <TabsTrigger value="at-risk" asChild className="text-xs sm:text-sm">
            <a href={getUrl('at-risk', year)}>At-Risk</a>
          </TabsTrigger>
          <TabsTrigger value="passive-activity-loss" asChild className="text-xs sm:text-sm">
            <a href={getUrl('passive-activity-loss', year)}>Passive Activity</a>
          </TabsTrigger>
          <TabsTrigger value="excess-business-loss" asChild className="text-xs sm:text-sm">
            <a href={getUrl('excess-business-loss', year)}>Excess Business</a>
          </TabsTrigger>
          <TabsTrigger value="net-operating-loss" asChild className="text-xs sm:text-sm">
            <a href={getUrl('net-operating-loss', year)}>NOL</a>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
