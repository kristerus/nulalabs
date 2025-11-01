import { X, BarChart3, Activity, AlertCircle, Lightbulb, ChevronDown, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArtifactDownloadButton } from "@/components/artifact/ArtifactDownloadButton";
import type { WorkflowNode } from "@/lib/types/workflow";
import { useState } from "react";

interface ArtifactsPanelProps {
  node: WorkflowNode;
  onClose: () => void;
}

export function ArtifactsPanel({ node, onClose }: ArtifactsPanelProps) {
  const toolCount = node.toolCalls?.length || 0;
  const artifactCount = node.artifacts?.length || 0;
  const [fullResponseOpen, setFullResponseOpen] = useState(false);

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-background border-l shadow-lg flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{node.phase}</h3>
          <p className="text-sm text-muted-foreground">
            Message #{node.messageIndex + 1}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={18} />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Node Type */}
          <div>
            <h4 className="text-sm font-medium mb-2">Type</h4>
            <Badge variant="secondary">
              {node.type === "user_query"
                ? "User Query"
                : node.type === "analysis"
                  ? "Analysis"
                  : "Visualization"}
            </Badge>
          </div>

          {/* Key Insight (Primary) */}
          {node.metadata?.insight && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Lightbulb size={14} className="text-primary" />
                Key Insight
              </h4>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <p className="text-sm font-medium leading-relaxed">
                  {node.metadata.insight}
                </p>
              </div>
            </div>
          )}

          {/* Full Response (Collapsible) */}
          {node.fullResponse && (
            <Collapsible open={fullResponseOpen} onOpenChange={setFullResponseOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-auto py-2 px-3"
                >
                  <div className="flex items-center gap-2 text-sm">
                    {fullResponseOpen ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                    <FileText size={14} />
                    <span>Full Analysis ({node.fullResponse.length} chars)</span>
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-muted/50 p-3 rounded-lg mt-2 max-h-64 overflow-y-auto">
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {node.fullResponse}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* NOTE: Tool Calls section removed - technical details not relevant to users */}

          {/* Artifacts */}
          {artifactCount > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <BarChart3 size={14} />
                Visualizations ({artifactCount})
              </h4>
              <div className="space-y-2">
                {node.artifacts?.map((artifactId, idx) => (
                  <div
                    key={artifactId}
                    className="bg-muted p-3 rounded-lg flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <BarChart3 size={14} className="flex-shrink-0" />
                      <span className="text-sm truncate">
                        Visualization {idx + 1}
                      </span>
                    </div>
                    <ArtifactDownloadButton
                      artifactId={artifactId}
                      phase={node.phase}
                      index={idx}
                      variant="icon"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          {node.metadata && (
            <div>
              <h4 className="text-sm font-medium mb-2">Workflow Metadata</h4>
              <div className="bg-muted p-3 rounded-lg space-y-1 text-xs">
                {node.metadata.isParallel !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>
                      {node.metadata.isParallel ? "Parallel" : "Sequential"}
                    </span>
                  </div>
                )}
                {node.metadata.phase && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phase:</span>
                    <span>{node.metadata.phase}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div>
            <h4 className="text-sm font-medium mb-2">Timestamp</h4>
            <p className="text-sm text-muted-foreground">
              {new Date(node.timestamp).toLocaleString()}
            </p>
          </div>

          {/* User Query (Secondary - at bottom) */}
          {node.userQuery && (
            <div className="pt-2 border-t border-border/50">
              <h4 className="text-xs font-medium mb-2 text-muted-foreground">Original Query</h4>
              <p className="text-xs text-muted-foreground/70 bg-muted/50 p-2 rounded">
                {node.userQuery}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
