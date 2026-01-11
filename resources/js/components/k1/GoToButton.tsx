import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface Props {
  text: string;
  targetUri: string;
  className?: string;
}

export function GoToButton({ text, targetUri, className }: Props) {
  return (
    <Button 
      type="button"
      variant="outline"
      size="sm"
      className={`h-8 text-xs gap-1.5 ${className || ''}`}
      onClick={() => window.location.href = targetUri}
    >
      {text}
      <ArrowRight className="h-3.5 w-3.5" />
    </Button>
  );
}
