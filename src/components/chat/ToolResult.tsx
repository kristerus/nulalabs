import { CheckCircle2, XCircle } from 'lucide-react';

interface ToolResultProps {
  toolName: string;
  result?: any;
  isError?: boolean;
}

export function ToolResult({ toolName, result, isError }: ToolResultProps) {
  return (
    <div className={`border rounded-lg p-3 my-2 ${
      isError 
        ? 'bg-red-50 border-red-200' 
        : 'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        {isError ? (
          <XCircle className="w-4 h-4 text-red-500" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        )}
        <span className="font-mono text-sm font-semibold text-gray-900">
          {toolName}
        </span>
        <span className="text-xs text-gray-600">
          {isError ? 'Error' : 'Result'}
        </span>
      </div>
      
      {result && (
        <details className="mt-2" open={isError}>
          <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
            {isError ? 'Error details' : 'View result'}
          </summary>
          <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto max-h-60">
            {typeof result === 'string' 
              ? result 
              : JSON.stringify(result, null, 2)
            }
          </pre>
        </details>
      )}
    </div>
  );
}