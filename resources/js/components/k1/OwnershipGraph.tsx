import { useState, useEffect, useMemo, useRef, useId } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import type { K1Company, OwnershipInterest } from '@/types/k1';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch } from 'lucide-react';
import mermaid from 'mermaid';

// Initialize mermaid once
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose', // Allow click handlers
});

interface GraphData {
  companies: K1Company[];
  interests: OwnershipInterest[];
}

export default function OwnershipGraph() {
  const [data, setData] = useState<GraphData>({ companies: [], interests: [] });
  const [loading, setLoading] = useState(true);
  const [svgContent, setSvgContent] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId().replace(/:/g, '_');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [companies, interests] = await Promise.all([
        fetchWrapper.get('/api/companies'),
        fetchWrapper.get('/api/ownership-interests'),
      ]);
      setData({ companies, interests });
    } catch (error) {
      console.error('Failed to load ownership data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate mermaid diagram code
  const mermaidCode = useMemo(() => {
    if (data.companies.length === 0 || data.interests.length === 0) return '';

    const lines: string[] = ['flowchart TB'];
    
    // Create nodes for each company - use sanitized IDs
    data.companies.forEach(company => {
      const safeId = `C${company.id}`;
      const label = company.name.replace(/"/g, "'");
      lines.push(`    ${safeId}["${label}"]`);
    });

    // Create edges for ownership relationships
    data.interests.forEach(interest => {
      if (interest.owner_company_id && interest.owned_company_id) {
        const fromId = `C${interest.owner_company_id}`;
        const toId = `C${interest.owned_company_id}`;
        const percentage = parseFloat(interest.ownership_percentage).toFixed(2);
        lines.push(`    ${fromId} -->|${percentage}%| ${toId}`);
      }
    });

    // Add click handlers to navigate to company pages
    data.companies.forEach(company => {
      const safeId = `C${company.id}`;
      lines.push(`    click ${safeId} "/company/${company.id}" "View ${company.name.replace(/"/g, "'")}"`);
    });

    return lines.join('\n');
  }, [data]);

  // Render mermaid diagram when code changes
  useEffect(() => {
    if (!mermaidCode) {
      setSvgContent('');
      return;
    }

    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render(`mermaid_${uniqueId}`, mermaidCode);
        setSvgContent(svg);
      } catch (error) {
        console.error('Failed to render mermaid diagram:', error);
        setSvgContent('');
      }
    };

    renderDiagram();
  }, [mermaidCode, uniqueId]);

  // Check if there are any ownership relationships
  const hasRelationships = data.interests.length > 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Ownership Structure</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.companies.length === 0) {
    return null;
  }

  if (!hasRelationships) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Ownership Structure</CardTitle>
          </div>
          <CardDescription>
            No ownership relationships defined yet. Add ownership interests on a company page to see the hierarchy.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Ownership Structure</CardTitle>
        </div>
        <CardDescription>
          Visual representation of company ownership relationships. Click a node to view the company.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div 
            ref={containerRef}
            className="min-w-[300px] flex justify-center"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
