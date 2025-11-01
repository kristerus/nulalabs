'use client';

import { useState } from 'react';
import { ArtifactRenderer } from '@/components/artifact/ArtifactRenderer';
import { BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArtifactEntry {
  id: string;
  code: string;
  title?: string;
  createdAt: number;
}

interface LabNotebookProps {
  artifacts: ArtifactEntry[];
}

export function LabNotebook({ artifacts }: LabNotebookProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Don't render if no artifacts
  if (artifacts.length === 0) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        variant="ghost"
        className="fixed right-4 top-4 z-50 rounded-lg border border-border bg-card backdrop-blur-sm shadow-lg hover:bg-accent"
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </Button>

      {/* Notebook Panel */}
      {isOpen && (
        <div className="w-1/2 flex flex-col bg-card backdrop-blur-sm border-l border-border relative">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center gap-2 flex-shrink-0 bg-card">
              <BookOpen size={20} />
              <h2 className="font-semibold text-lg text-foreground">Lab Notebook</h2>
              <span className="ml-auto text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {artifacts.length} {artifacts.length === 1 ? 'viz' : 'visualizations'}
              </span>
            </div>

            {/* Artifacts List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hidden">
              {artifacts.map((artifact, idx) => (
                <div key={artifact.id} className="space-y-3">
                  <div className="flex items-center gap-2 text-base text-muted-foreground bg-muted px-4 py-2 rounded-lg border border-border">
                    <span className="inline-block w-2 h-2 bg-foreground rounded-full" />
                    <span className="font-semibold text-foreground text-lg">Visualization {idx + 1}</span>
                    {artifact.title && (
                      <>
                        <span>·</span>
                        <span className="text-sm">{artifact.title}</span>
                      </>
                    )}
                  </div>
                  <ArtifactRenderer code={artifact.code} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
