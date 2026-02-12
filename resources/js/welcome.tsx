import './bootstrap';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@/components/ui/button';

function Welcome() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to K1 Flow</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Manage your Schedule K-1 forms and track flow-through tax information from partnerships,
        S-corporations, and other pass-through entities.
      </p>
      <div className="flex gap-4 justify-center">
        <Button asChild>
          <a href="/sign-in">Sign In</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/sign-up">Sign Up</a>
        </Button>
      </div>
    </div>
  );
}

const welcomeElement = document.getElementById('welcome');
if (welcomeElement) {
  createRoot(welcomeElement).render(<Welcome />);
}
