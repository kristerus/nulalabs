"use client";

import { WorkflowCanvas } from "./WorkflowCanvas";
import { ArtifactsPanel } from "./ArtifactsPanel";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useWorkflowLayout } from "@/hooks/useWorkflowLayout";
import type { UIMessage } from "@/lib/types";
import { Network, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkflowPanelProps {
  messages: UIMessage[];
  onClose?: () => void;
}

export function WorkflowPanel({ messages, onClose }: WorkflowPanelProps) {
  const { graph, selectedNode, selectNode, isEmpty, nodeCount, phaseCount } =
    useWorkflow(messages);
  const { nodes, edges } = useWorkflowLayout(graph);

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Network className="text-primary flex-shrink-0" size={20} />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base font-semibold truncate">
              Analysis Workflow
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              {isEmpty
                ? "No analyses yet"
                : `${nodeCount} steps across ${phaseCount} phases`}
            </p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="flex-shrink-0"
          >
            <X size={18} />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {isEmpty ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center p-6 sm:p-8">
            <Network className="text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-semibold mb-2">No Workflow Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
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

            {/* Artifacts Panel (slide-in from right within this panel) */}
            {selectedNode && (
              <ArtifactsPanel
                node={selectedNode}
                onClose={() => selectNode(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
