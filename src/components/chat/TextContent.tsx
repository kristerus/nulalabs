interface TextContentProps {
    text: string;
  }
  
  export function TextContent({ text }: TextContentProps) {
    return (
      <div className="prose prose-sm max-w-none">
        <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
          {text}
        </div>
      </div>
    );
  }