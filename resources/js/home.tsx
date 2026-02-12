import './bootstrap';

import React from 'react';
import { createRoot } from 'react-dom/client';

import CompanyList from '@/components/k1/CompanyList';
import OwnershipGraph from '@/components/k1/OwnershipGraph';
import MainTitle from '@/components/MainTitle';
import { Button } from '@/components/ui/button';

function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <MainTitle>K1 Flow</MainTitle>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Manage your Schedule K-1 forms and track flow-through tax information from partnerships,
              S-corporations, and other pass-through entities. Calculate outside basis, track loss
              limitations, and manage hierarchical ownership structures.
            </p>
          </div>
          <div className="flex gap-3">
            <a href="/sign-in">
              <Button variant="secondary">Sign in</Button>
            </a>
            <a href="/sign-up">
              <Button variant="secondary">Sign up</Button>
            </a>
          </div>
        </div>
      </div>
      
      {/* Ownership Hierarchy Graph */}
      <div className="mb-8">
        <OwnershipGraph />
      </div>
      
      <CompanyList />
    </div>
  );
}

const homeElement = document.getElementById('home');
if (homeElement) {
  createRoot(homeElement).render(<Home />);
}
