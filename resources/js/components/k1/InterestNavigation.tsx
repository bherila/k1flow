import { ChevronLeft } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

interface Props {
  interestId: number;
  year?: number;
  activeView: 'summary' | 'k1-single' | 'k1-multi' | 'basis-adjustments';
}

export default function InterestNavigation({ interestId, year, activeView }: Props) {
  return (
    <div className="flex gap-2">
      {activeView !== 'summary' && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.href = `/ownership/${interestId}`}
        >
          Basis Tracker
        </Button>
      )}
      
      {activeView !== 'k1-multi' && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.href = `/ownership/${interestId}/k1-streamlined`}
        >
          Multi-Year K-1
        </Button>
      )}

      {year && activeView !== 'k1-single' && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.href = `/ownership/${interestId}/k1/${year}`}
        >
          {year} K-1 Form
        </Button>
      )}

      {year && activeView !== 'basis-adjustments' && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.href = `/ownership/${interestId}/basis/${year}/adjustments`}
        >
          {year} Basis Adjustments
        </Button>
      )}
    </div>
  );
}
