import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import OwnershipGraph from '@/components/k1/OwnershipGraph';
import { fetchWrapper } from '@/fetchWrapper';
import mermaid from 'mermaid';

// Mock the fetchWrapper
jest.mock('@/fetchWrapper', () => ({
  fetchWrapper: {
    get: jest.fn(),
  },
}));

const mockCompanies = [
  {
    id: 1,
    name: 'Parent Holdings LLC',
    ein: '12-3456789',
    entity_type: 'LLC',
    address: null,
    city: null,
    state: null,
    zip: null,
    notes: null,
    created_at: '2025-01-01 00:00:00',
    updated_at: '2025-01-01 00:00:00',
  },
  {
    id: 2,
    name: 'Subsidiary One LP',
    ein: '23-4567890',
    entity_type: 'LP',
    address: null,
    city: null,
    state: null,
    zip: null,
    notes: null,
    created_at: '2025-01-01 00:00:00',
    updated_at: '2025-01-01 00:00:00',
  },
  {
    id: 3,
    name: 'Subsidiary Two Inc',
    ein: '34-5678901',
    entity_type: 'S-Corp',
    address: null,
    city: null,
    state: null,
    zip: null,
    notes: null,
    created_at: '2025-01-01 00:00:00',
    updated_at: '2025-01-01 00:00:00',
  },
];

const mockOwnershipInterests = [
  {
    id: 1,
    owner_company_id: 1,
    owned_company_id: 2,
    ownership_percentage: '50.00000000000',
    effective_from: null,
    effective_to: null,
    ownership_class: null,
    notes: null,
    created_at: '2025-01-01 00:00:00',
    updated_at: '2025-01-01 00:00:00',
  },
  {
    id: 2,
    owner_company_id: 1,
    owned_company_id: 3,
    ownership_percentage: '50.00000000000',
    effective_from: null,
    effective_to: null,
    ownership_class: null,
    notes: null,
    created_at: '2025-01-01 00:00:00',
    updated_at: '2025-01-01 00:00:00',
  },
];

describe('OwnershipGraph', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Mock fetch to never resolve during this test
    (fetchWrapper.get as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<OwnershipGraph />);

    // Should show loading spinner
    expect(screen.getByText('Ownership Structure')).toBeInTheDocument();
  });

  it('renders ownership structure with companies and relationships', async () => {
    // Setup mocks
    (fetchWrapper.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/companies') {
        return Promise.resolve(mockCompanies);
      }
      if (url === '/api/ownership-interests') {
        return Promise.resolve(mockOwnershipInterests);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<OwnershipGraph />);

    // Wait for data to load and render
    await waitFor(() => {
      expect(screen.getByText('Ownership Structure')).toBeInTheDocument();
    });

    // The mermaid.render mock should have been called with the correct chart code
    await waitFor(() => {
      expect(mermaid.render).toHaveBeenCalled();
    });

    // Check that the render was called with chart code containing our companies
    const renderCall = (mermaid.render as jest.Mock).mock.calls[0];
    const chartCode = renderCall[1];
    
    expect(chartCode).toContain('Parent Holdings LLC');
    expect(chartCode).toContain('Subsidiary One LP');
    expect(chartCode).toContain('Subsidiary Two Inc');
    expect(chartCode).toContain('50.00%');
    expect(chartCode).toContain('C1 -->|50.00%| C2');
    expect(chartCode).toContain('C1 -->|50.00%| C3');
  });

  it('shows message when no ownership relationships exist', async () => {
    // Return companies but no relationships
    (fetchWrapper.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/companies') {
        return Promise.resolve(mockCompanies);
      }
      if (url === '/api/ownership-interests') {
        return Promise.resolve([]); // No relationships
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<OwnershipGraph />);

    await waitFor(() => {
      expect(screen.getByText('No ownership relationships defined yet. Add ownership interests on a company page to see the hierarchy.')).toBeInTheDocument();
    });
  });

  it('returns null when no companies exist', async () => {
    // Return empty arrays
    (fetchWrapper.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/companies') {
        return Promise.resolve([]);
      }
      if (url === '/api/ownership-interests') {
        return Promise.resolve([]);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { container } = render(<OwnershipGraph />);

    // Wait for loading to complete
    await waitFor(() => {
      // After loading, if no companies exist, component returns null
      // We need to check that the loading state is gone first
      expect(fetchWrapper.get).toHaveBeenCalled();
    });

    // Give time for component to update after data loads
    await waitFor(() => {
      // Component should render nothing when no companies
      expect(container.querySelector('[class*="Card"]')).toBeNull();
    }, { timeout: 1000 });
  });

  it('fetches both companies and ownership interests on mount', async () => {
    (fetchWrapper.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/companies') {
        return Promise.resolve(mockCompanies);
      }
      if (url === '/api/ownership-interests') {
        return Promise.resolve(mockOwnershipInterests);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<OwnershipGraph />);

    await waitFor(() => {
      expect(fetchWrapper.get).toHaveBeenCalledWith('/api/companies');
      expect(fetchWrapper.get).toHaveBeenCalledWith('/api/ownership-interests');
    });
  });
});
