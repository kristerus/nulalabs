import { X, BarChart3, Activity, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { WorkflowNode } from "@/lib/types/workflow";

interface ArtifactsPanelProps {
  node: WorkflowNode;
  onClose: () => void;
}

export function ArtifactsPanel({ node, onClose }: ArtifactsPanelProps) {
  const toolCount = node.toolCalls?.length || 0;
  const artifactCount = node.artifacts?.length || 0;

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

          {/* User Query */}
          {node.userQuery && (
            <div>
              <h4 className="text-sm font-medium mb-2">Query</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {node.userQuery}
              </p>
            </div>
          )}

          {/* Tool Calls */}
          {toolCount > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Activity size={14} />
                Tool Calls ({toolCount})
              </h4>
              <div className="space-y-2">
                {node.toolCalls?.map((tool, idx) => (
                  <div
                    key={idx}
                    className="bg-muted p-3 rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <code className="text-xs font-mono">{tool.toolName}</code>
                      {tool.isError && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle size={10} className="mr-1" />
                          Error
                        </Badge>
                      )}
                    </div>

                    {/* Arguments */}
                    {Object.keys(tool.args).length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Arguments:
                        </p>
                        <pre className="text-[10px] bg-background p-2 rounded overflow-x-auto">
                          {JSON.stringify(tool.args, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Result (truncated) */}
                    {tool.result && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Result:
                        </p>
                        <pre className="text-[10px] bg-background p-2 rounded overflow-x-auto max-h-32">
                          {typeof tool.result === "string"
                            ? tool.result
                            : JSON.stringify(tool.result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Artifacts */}
          {artifactCount > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <BarChart3 size={14} />
                Visualizations ({artifactCount})
              </h4>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {artifactCount} visualization{artifactCount > 1 ? "s" : ""}{" "}
                  generated in this step.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Scroll to message #{node.messageIndex + 1} in the chat to view.
                </p>
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
        </div>
      </ScrollArea>
    </div>
  );
}
