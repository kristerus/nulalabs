"use client";

import ReactMarkdown from "react-markdown";
import {
  Plan,
  PlanCard,
  PlanHeader,
  PlanTitle,
  PlanDescription,
  PlanTrigger,
  PlanContent,
} from "@/components/ai-elements/plan";

interface PlanPreviewProps {
  title: string;
  description?: string;
  content: string;
  isStreaming?: boolean;
}

export function PlanPreview({
  title,
  description,
  content,
  isStreaming = false,
}: PlanPreviewProps) {
  // Format content for display (first 3-5 lines or sections)
  const previewContent = formatPreviewContent(content);

  return (
    <div className="my-4 not-prose">
      <PlanCard>
        <Plan isStreaming={isStreaming} defaultOpen={false}>
          <PlanHeader>
            <div className="flex-1 min-w-0 space-y-1">
              <PlanTitle>{title}</PlanTitle>
              {description && <PlanDescription>{description}</PlanDescription>}
              <p className="text-xs text-muted-foreground">
                Click to view full plan in the Plans panel →
              </p>
            </div>
            <PlanTrigger />
          </PlanHeader>
          <PlanContent>
            <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2 prose-p:text-sm prose-p:leading-relaxed prose-ul:text-sm prose-ol:text-sm prose-li:my-1 prose-strong:font-semibold prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none">
              <ReactMarkdown>{previewContent}</ReactMarkdown>
              <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground italic">
                See full plan in the Plans panel
              </div>
            </div>
          </PlanContent>
        </Plan>
      </PlanCard>
    </div>
  );
}

// Helper function to get first few lines/sections for preview
function formatPreviewContent(content: string): string {
  const lines = content.split('\n');

  // Take first 10 lines or until we hit 300 characters
  let preview = '';
  let charCount = 0;

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    if (charCount + line.length > 300) {
      preview += '\n...';
      break;
    }
    preview += (i > 0 ? '\n' : '') + line;
    charCount += line.length;
  }

  return preview || content.substring(0, 300) + '...';
}
