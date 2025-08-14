
import React from 'react';

export type MessageType = 'user' | 'ai';

interface ChatMessageProps {
  type: MessageType;
  content: string;
  timestamp?: Date;
  audioUrl?: string;
  audioBase64?: string;
}

export function ChatMessage({ type, content, timestamp = new Date(), audioUrl, audioBase64 }: ChatMessageProps) {
  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[75%] lg:max-w-[60%] ${type === 'user' ? 'bg-iso-purple/20' : 'bg-iso-blue/10'} 
        rounded-lg px-4 py-3 shadow-sm relative futuristic-border`}>
        
        <div className="text-sm mb-1">
          {type === 'user' ? (
            <span className="text-iso-purple font-medium">Você</span>
          ) : (
            <span className="text-iso-blue font-medium">ISO Guardian</span>
          )}
        </div>
        
        <div className="text-sm whitespace-pre-wrap">
          {content}
        </div>
        
        {(audioUrl || audioBase64) && (
          <div className="mt-3">
            <audio 
              controls 
              className="w-full max-w-xs"
              src={audioUrl || (audioBase64 ? `data:audio/mp3;base64,${audioBase64}` : undefined)}
            >
              Seu navegador não suporta áudio.
            </audio>
          </div>
        )}
        
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
