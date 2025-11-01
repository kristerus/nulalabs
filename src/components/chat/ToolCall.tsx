import { Loader2, Wrench, CheckCircle2, XCircle } from 'lucide-react';

interface ToolCallProps {
  toolName: string;
  args?: Record<string, any>;
  state: string;
}

export function ToolCall({ toolName, args, state }: ToolCallProps) {
  const getStatusIcon = () => {
    if (state === 'call') {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
    if (state.startsWith('output')) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    if (state === 'output-error') {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return <Wrench className="w-4 h-4 text-gray-500" />;
  };

  const getStatusText = () => {
    if (state === 'call') return 'Executing...';
    if (state.startsWith('output')) return 'Complete';
    if (state === 'output-error') return 'Error';
    return 'Pending';
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 my-2">
      <div className="flex items-center gap-2 mb-2">
        {getStatusIcon()}
        <span className="font-mono text-sm font-semibold text-gray-900">
          {toolName}
        </span>
        <span className="text-xs text-gray-600">
          {getStatusText()}
        </span>
      </div>
      
      {args && Object.keys(args).length > 0 && (
        <details className="mt-2">
          <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
            View parameters
          </summary>
          <pre className="mt-2 text-xs bg-white p-2 rounded border border-amber-300 overflow-x-auto">
            {JSON.stringify(args, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}