import React, { useState, useRef } from 'react';
import { ArrowUp, FileUp, Mic, Square, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAudioRecording } from '@/hooks/useAudioRecording';

interface ChatInputProps {
  onSendMessage: (message: string, audioBase64?: string) => void;
  onUploadFile: (file: File) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, onUploadFile, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    isRecording, 
    recordingTime, 
    startRecording, 
    stopRecording, 
    cancelRecording, 
    error 
  } = useAudioRecording();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isRecording) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleMicClick = async () => {
    if (disabled) return;
    
    if (isRecording) {
      // Stop recording and send audio
      const audioBase64 = await stopRecording();
      if (audioBase64) {
        onSendMessage('🎤 Mensagem de áudio', audioBase64);
      }
    } else {
      // Start recording
      await startRecording();
    }
  };

  const handleCancelRecording = () => {
    cancelRecording();
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

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-2 px-3 py-2 bg-destructive/20 text-destructive text-sm rounded-md">
          {error}
        </div>
      )}
      
      {isRecording && (
        <div className="mb-2 flex items-center justify-between px-3 py-2 bg-iso-purple/20 rounded-md">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-iso-purple font-medium">Gravando...</span>
            <span className="text-sm text-muted-foreground">{formatRecordingTime(recordingTime)}</span>
          </div>
          <button
            type="button"
            onClick={handleCancelRecording}
            className="text-muted-foreground hover:text-destructive p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
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
          disabled={disabled || isRecording}
          className="text-muted-foreground hover:text-iso-purple p-2 disabled:opacity-50"
        >
          <FileUp size={20} />
        </button>
        
        <button 
          type="button"
          onClick={handleMicClick}
          disabled={disabled}
          className={cn(
            "p-2 transition-colors",
            isRecording 
              ? "text-red-500 hover:text-red-600" 
              : "text-muted-foreground hover:text-iso-purple"
          )}
        >
          {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
        </button>
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isRecording ? "Gravando áudio..." : "Digite sua mensagem ou pergunta sobre ISO 27001..."}
          className="flex-1 bg-transparent border-none outline-none text-sm px-3 py-2"
          disabled={disabled || isRecording}
        />
        
        <button 
          type="submit"
          disabled={!message.trim() || disabled || isRecording}
          className={cn(
            "rounded-full w-8 h-8 flex items-center justify-center transition-colors",
            message.trim() && !disabled && !isRecording
              ? "bg-iso-purple text-white"
              : "bg-secondary text-muted-foreground"
          )}
        >
          <ArrowUp size={18} />
        </button>
      </form>
    </div>
  );
}
