"use client";

import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plan,
  PlanCard,
  PlanHeader,
  PlanTitle,
  PlanDescription,
  PlanTrigger,
  PlanContent,
} from "@/components/ai-elements/plan";
import type { Plan as PlanType } from "@/lib/types";
import { FileText, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlansPanelProps {
  plans: PlanType[];
  onClose?: () => void;
}

export function PlansPanel({ plans, onClose }: PlansPanelProps) {
  const isEmpty = plans.length === 0;
  const planCount = plans.length;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Sparkles className="text-primary flex-shrink-0" size={20} />
          <h2 className="text-sm sm:text-base font-semibold truncate">
            Plans
          </h2>
          {!isEmpty && (
            <Badge variant="secondary" className="ml-2">
              {planCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {isEmpty ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <FileText className="text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-semibold mb-2">No Plans Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              When you ask for a plan or strategy, it will appear here with all
              the details.
            </p>
          </div>
        ) : (
          // Plans list
          <div className="p-4 space-y-4">
            {plans.map((plan, idx) => (
              <PlanCard key={plan.id}>
                <Plan defaultOpen={idx === plans.length - 1}>
                  <PlanHeader>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <PlanTitle>{plan.title}</PlanTitle>
                        {plan.isStreaming && (
                          <Badge variant="outline" className="text-xs">
                            <span className="animate-pulse">Generating...</span>
                          </Badge>
                        )}
                      </div>
                      {plan.description && (
                        <PlanDescription>{plan.description}</PlanDescription>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(plan.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <PlanTrigger />
                  </PlanHeader>
                  <PlanContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2 prose-p:text-sm prose-p:leading-relaxed prose-ul:text-sm prose-ol:text-sm prose-li:my-1 prose-strong:font-semibold prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none">
                      <ReactMarkdown>{plan.content}</ReactMarkdown>
                    </div>
                  </PlanContent>
                </Plan>
              </PlanCard>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
