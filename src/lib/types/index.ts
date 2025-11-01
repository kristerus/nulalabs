import type { UIMessage } from "@ai-sdk/react";

export type { UIMessage };

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    toolInvocations?: ToolInvocation[];
    createdAt: Date;
  }

  export interface ToolInvocation {
    toolCallId: string;
    toolName: string;
    args: Record<string, any>;
    result?: any;
    state: 'pending' | 'running' | 'result' | 'error';
  }

  export interface Artifact {
    id: string;
    type: 'jsx' | 'text' | 'json';
    content: string;
    title?: string;
  }