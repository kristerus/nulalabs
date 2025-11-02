'use client';

import { useEffect, useState, memo } from 'react';
import { executeJSX } from '@/lib/sandbox/jsxExecutor';
import { AlertCircle } from 'lucide-react';

interface ArtifactRendererProps {
  code: string;
  data?: any;
  artifactId?: string;
}

const ArtifactRendererComponent = ({ code, data, artifactId }: ArtifactRendererProps) => {
  const [Component, setComponent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const ExecutedComponent = executeJSX(code, data);
      setComponent(() => ExecutedComponent);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render artifact');
      console.error('Artifact execution error:', err);
    }
  }, [code, data]);

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-start space-x-2">
          <AlertCircle className="text-destructive mt-0.5" size={20} />
          <div>
            <div className="font-medium text-destructive">Artifact Error</div>
            <div className="text-sm text-destructive/80 mt-1">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="bg-card backdrop-blur-sm rounded-lg p-8 border border-border">
        <div className="h-64 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div
      id={artifactId}
      className="bg-background border border-border rounded-lg p-6 w-full transition-all shadow-lg"
      style={{ minHeight: '500px' }}
    >
      <Component />
    </div>
  );
};

// Memoize with strict equality - only re-render if code or data actually changes
export const ArtifactRenderer = memo(ArtifactRendererComponent, (prevProps, nextProps) => {
  // Return true if props are equal (should NOT re-render)
  // Return false if props changed (should re-render)
  const areEqual = prevProps.code === nextProps.code && prevProps.data === nextProps.data;
  if (!areEqual) {
    console.log('[ArtifactRenderer] Props changed, will re-render');
  }
  return areEqual;
});