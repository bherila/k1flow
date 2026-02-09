// React namespace not required; using named imports when needed
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface Props {
  text: string;
  targetUri: string;
  className?: string;
}

export function GoToButton({ text, targetUri, className }: Props) {
  return (
    <Button 
      type="button"
      size="sm"
      className={`h-8 text-xs gap-1.5 font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-sm hover:shadow-md transition-all duration-300 border-none ${className || ''}`}
      onClick={() => window.location.href = targetUri}
    >
      {text}
      <ArrowRight className="h-3.5 w-3.5" />
    </Button>
  );
}
