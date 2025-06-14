
import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

const FormattedText = ({ text, className = '' }: FormattedTextProps) => {
  const formatText = (text: string) => {
    if (!text) return text;

    // Split text by various markdown patterns while preserving the markers
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|__.*?__|_.*?_|\- .*?(?=\n|$)|\d+\. .*?(?=\n|$))/g);
    
    return parts.map((part, index) => {
      // Bold text with **text**
      if (part.match(/^\*\*(.*?)\*\*$/)) {
        const content = part.replace(/^\*\*(.*?)\*\*$/, '$1');
        return <strong key={index} className="font-bold">{content}</strong>;
      }
      
      // Italic text with *text*
      if (part.match(/^\*(.*?)\*$/)) {
        const content = part.replace(/^\*(.*?)\*$/, '$1');
        return <em key={index} className="italic">{content}</em>;
      }
      
      // Bold text with __text__
      if (part.match(/^__(.*?)__$/)) {
        const content = part.replace(/^__(.*?)__$/, '$1');
        return <strong key={index} className="font-bold">{content}</strong>;
      }
      
      // Italic text with _text_
      if (part.match(/^_(.*?)_$/)) {
        const content = part.replace(/^_(.*?)_$/, '$1');
        return <em key={index} className="italic">{content}</em>;
      }
      
      // List items with - or numbered lists
      if (part.match(/^- /)) {
        const content = part.replace(/^- /, '');
        return (
          <div key={index} className="flex items-start gap-2 my-1">
            <span className="text-pink-600 font-bold">•</span>
            <span>{content}</span>
          </div>
        );
      }
      
      if (part.match(/^\d+\. /)) {
        const content = part.replace(/^\d+\. /, '');
        const number = part.match(/^(\d+)\./)?.[1];
        return (
          <div key={index} className="flex items-start gap-2 my-1">
            <span className="text-pink-600 font-bold">{number}.</span>
            <span>{content}</span>
          </div>
        );
      }
      
      // Regular text - split by line breaks and render each line
      if (part.includes('\n')) {
        return part.split('\n').map((line, lineIndex) => (
          <React.Fragment key={`${index}-${lineIndex}`}>
            {line}
            {lineIndex < part.split('\n').length - 1 && <br />}
          </React.Fragment>
        ));
      }
      
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  return (
    <div className={className}>
      {formatText(text)}
    </div>
  );
};

export default FormattedText;
