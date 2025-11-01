'use client';

import { ArtifactRenderer } from '@/components/artifact/ArtifactRenderer';
import { ArtifactDownloadButton } from '@/components/artifact/ArtifactDownloadButton';
import { BookOpen } from 'lucide-react';

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
  // Don't render if no artifacts
  if (artifacts.length === 0) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-2 flex-shrink-0">
        <BookOpen size={20} className="text-primary" />
        <h2 className="font-semibold text-lg text-foreground">Lab Notebook</h2>
        <span className="ml-auto text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {artifacts.length} {artifacts.length === 1 ? 'viz' : 'visualizations'}
        </span>
      </div>

      {/* Artifacts List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {artifacts.map((artifact, idx) => (
          <div key={artifact.id} className="space-y-3">
            <div className="flex items-center justify-between gap-2 text-base text-muted-foreground bg-muted px-4 py-2 rounded-lg border border-border">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="inline-block w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <span className="font-semibold text-foreground text-lg">Visualization {idx + 1}</span>
                {artifact.title && (
                  <>
                    <span>·</span>
                    <span className="text-sm truncate">{artifact.title}</span>
                  </>
                )}
              </div>
              <ArtifactDownloadButton
                artifactId={artifact.id}
                index={idx}
                variant="icon"
              />
            </div>
            <ArtifactRenderer code={artifact.code} artifactId={artifact.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
