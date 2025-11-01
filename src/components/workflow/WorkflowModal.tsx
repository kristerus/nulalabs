"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { ArtifactsPanel } from "./ArtifactsPanel";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useWorkflowLayout } from "@/hooks/useWorkflowLayout";
import type { UIMessage } from "@/lib/types";
import { Network, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkflowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: UIMessage[];
}

export function WorkflowModal({
  open,
  onOpenChange,
  messages,
}: WorkflowModalProps) {
  const { graph, selectedNode, selectNode, isEmpty, nodeCount, phaseCount } =
    useWorkflow(messages);
  const { nodes, edges } = useWorkflowLayout(graph);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] h-[95vh] p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Network className="text-primary" size={24} />
            <div>
              <h2 className="text-lg font-semibold">Analysis Workflow</h2>
              <p className="text-sm text-muted-foreground">
                {isEmpty
                  ? "No analyses yet"
                  : `${nodeCount} steps across ${phaseCount} phases`}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X size={18} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden">
          {isEmpty ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Network className="text-muted-foreground mb-4" size={64} />
              <h3 className="text-xl font-semibold mb-2">
                No Workflow Yet
              </h3>
              <p className="text-muted-foreground max-w-md">
                Start a conversation and run analyses to see your workflow
                visualized here. Each analysis step will appear as a node,
                showing the flow of your metabolomics data analysis.
              </p>
            </div>
          ) : (
            <>
              {/* Workflow Canvas */}
              <WorkflowCanvas
                nodes={nodes}
                edges={edges}
                onNodeClick={selectNode}
              />

              {/* Artifacts Panel (slide-in from right) */}
              {selectedNode && (
                <ArtifactsPanel
                  node={selectedNode}
                  onClose={() => selectNode(null)}
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
