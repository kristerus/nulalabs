'use client';

import { ArtifactRenderer } from './ArtifactRenderer';

interface ArtifactEntry {
  id: string;
  code: string;
}

interface HiddenArtifactPoolProps {
  artifacts: ArtifactEntry[];
}

/**
 * Hidden container that renders all artifacts with proper DOM IDs
 * for download functionality, without affecting the visible UI.
 *
 * This component ensures that all artifacts have corresponding DOM elements
 * that can be targeted by the download utility, even if they're not
 * currently visible in the main chat or notebook interface.
 */
export function HiddenArtifactPool({ artifacts }: HiddenArtifactPoolProps) {
  if (artifacts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        visibility: 'hidden',
        pointerEvents: 'none',
        width: '800px', // Fixed width for consistent rendering
        height: 'auto',
      }}
      aria-hidden="true"
    >
      {artifacts.map((artifact) => (
        <div key={artifact.id}>
          <ArtifactRenderer code={artifact.code} artifactId={artifact.id} />
        </div>
      ))}
    </div>
  );
}
