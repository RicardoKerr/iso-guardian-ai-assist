
import React from 'react';

export type MessageType = 'user' | 'ai';

interface ChatMessageProps {
  type: MessageType;
  content: string;
  timestamp?: Date;
}

export function ChatMessage({ type, content, timestamp = new Date() }: ChatMessageProps) {
  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[75%] lg:max-w-[60%] ${type === 'user' ? 'bg-iso-purple/20' : 'bg-iso-blue/10'} 
        rounded-lg px-4 py-3 shadow-sm relative futuristic-border`}>
        
        <div className="text-sm mb-1">
          {type === 'user' ? (
            <span className="text-iso-purple font-medium">You</span>
          ) : (
            <span className="text-iso-blue font-medium">ISO Guardian</span>
          )}
        </div>
        
        <div className="text-sm whitespace-pre-wrap">
          {content}
        </div>
        
        <div className="text-[10px] text-muted-foreground mt-2 text-right">
          {formatTimestamp(timestamp)}
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
