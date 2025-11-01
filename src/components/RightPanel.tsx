"use client";

import { useState } from "react";
import { WorkflowPanel } from "./workflow/WorkflowPanel";
import { LabNotebook } from "./notebook/LabNotebook";
import type { UIMessage } from "@/lib/types";
import { Network, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "workflow" | "notebook";

interface RightPanelProps {
  messages: UIMessage[];
  artifacts: any[];
  hasWorkflow: boolean;
  hasArtifacts: boolean;
  initialTab?: Tab;
  onClose?: () => void;
}

export function RightPanel({
  messages,
  artifacts,
  hasWorkflow,
  hasArtifacts,
  initialTab = "workflow",
  onClose,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // If only one type of content, show it directly without tabs
  if (hasWorkflow && !hasArtifacts) {
    return <WorkflowPanel messages={messages} onClose={onClose} />;
  }

  if (!hasWorkflow && hasArtifacts) {
    return <LabNotebook artifacts={artifacts} />;
  }

  // Both exist - show tabbed interface
  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Tab Bar */}
      <div className="flex items-center border-b flex-shrink-0">
        <button
          onClick={() => setActiveTab("workflow")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
            activeTab === "workflow"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
          )}
        >
          <Network size={16} />
          <span>Workflow</span>
        </button>
        <button
          onClick={() => setActiveTab("notebook")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
            activeTab === "notebook"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
          )}
        >
          <FlaskConical size={16} />
          <span>Lab Notebook</span>
        </button>
        <div className="flex-1" />
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "workflow" ? (
          <WorkflowPanel messages={messages} />
        ) : (
          <LabNotebook artifacts={artifacts} />
        )}
      </div>
    </div>
  );
}
