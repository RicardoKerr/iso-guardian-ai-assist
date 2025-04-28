
import React, { useState, useRef } from 'react';
import { ArrowUp, FileUp, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onUploadFile: (file: File) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, onUploadFile, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !disabled) {
      onUploadFile(file);
      // Reset the input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full relative futuristic-border p-1">
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <button 
        type="button"
        onClick={handleFileClick}
        disabled={disabled}
        className="text-muted-foreground hover:text-iso-purple p-2"
      >
        <FileUp size={20} />
      </button>
      
      <button 
        type="button"
        disabled={disabled}
        className="text-muted-foreground hover:text-iso-purple p-2"
      >
        <Mic size={20} />
      </button>
      
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message or question about ISO 27001..."
        className="flex-1 bg-transparent border-none outline-none text-sm px-3 py-2"
        disabled={disabled}
      />
      
      <button 
        type="submit"
        disabled={!message.trim() || disabled}
        className={cn(
          "rounded-full w-8 h-8 flex items-center justify-center transition-colors",
          message.trim() && !disabled
            ? "bg-iso-purple text-white"
            : "bg-secondary text-muted-foreground"
        )}
      >
        <ArrowUp size={18} />
      </button>
    </form>
  );
}
