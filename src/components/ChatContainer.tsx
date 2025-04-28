
import React, { useState, useRef, useEffect } from 'react';
import { ChatInput } from './ChatInput';
import { ChatMessage, MessageType } from './ChatMessage';
import { FileTransfer } from './FileTransfer';
import { AIAvatar } from './AIAvatar';

interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
}

interface File {
  id: string;
  name: string;
  size: string;
  type: 'upload' | 'download';
  status: 'pending' | 'complete' | 'error';
}

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Welcome to the ISO Guardian! I\'m your AI assistant for ISO/IEC 27001 compliance. How can I help you today with your information security management system?',
      timestamp: new Date()
    }
  ]);
  
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse = getAIResponse(content);
      setIsProcessing(false);
      setIsSpeaking(true);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }]);
      
      // Simulate speaking time based on message length
      setTimeout(() => {
        setIsSpeaking(false);
      }, Math.min(aiResponse.length * 40, 3000));
    }, 1500);
  };
  
  const handleUploadFile = (file: File) => {
    // Create a new file entry
    const fileSize = formatFileSize(file.size);
    
    const newFile: File = {
      id: Date.now().toString(),
      name: file.name,
      size: fileSize,
      type: 'upload',
      status: 'pending'
    };
    
    setFiles(prev => [...prev, newFile]);
    
    // Simulate processing
    setTimeout(() => {
      setFiles(prev => 
        prev.map(f => 
          f.id === newFile.id ? { ...f, status: 'complete' } : f
        )
      );
      
      handleSendMessage(`I've uploaded a file: ${file.name}`);
      
      // Simulate AI sending a download file in response
      if (file.name.toLowerCase().includes('policy') || file.name.toLowerCase().includes('form')) {
        setTimeout(() => {
          const downloadFile: File = {
            id: (Date.now() + 100).toString(),
            name: 'ISO27001_Compliance_Report.pdf',
            size: '1.4 MB',
            type: 'download',
            status: 'complete'
          };
          
          setFiles(prev => [...prev, downloadFile]);
          
          const aiMessage: Message = {
            id: (Date.now() + 101).toString(),
            type: 'ai',
            content: "I've analyzed your document and created a compliance report based on ISO 27001 requirements. You can download it below.",
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiMessage]);
        }, 4000);
      }
    }, 2000);
  };
  
  const handleDownload = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    alert(`Downloading ${file.name}. In a production app, this would trigger the actual file download.`);
  };
  
  return (
    <div className="flex flex-col md:flex-row h-full gap-6">
      <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col items-center justify-center p-4">
        <AIAvatar 
          isProcessing={isProcessing} 
          isSpeaking={isSpeaking} 
        />
        <div className="w-full mt-6 space-y-4">
          <SuggestionButton onClick={() => handleSendMessage("What is ISO/IEC 27001?")}>
            What is ISO/IEC 27001?
          </SuggestionButton>
          
          <SuggestionButton onClick={() => handleSendMessage("How do I prepare for an ISO 27001 audit?")}>
            How do I prepare for an ISO 27001 audit?
          </SuggestionButton>
          
          <SuggestionButton onClick={() => handleSendMessage("What documents are required for ISO 27001 compliance?")}>
            Required ISO 27001 documents?
          </SuggestionButton>
        </div>
      </div>
      
      <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-4">
          {messages.map(message => (
            <ChatMessage 
              key={message.id}
              type={message.type}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
          
          {isProcessing && (
            <div className="flex mb-4">
              <div className="bg-iso-blue/10 rounded-lg px-4 py-3 shadow-sm">
                <div className="typing-indicator flex space-x-1">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
          
          <FileTransfer 
            files={files}
            onDownload={handleDownload}
          />
        </div>
        
        <div className="p-4 border-t border-iso-purple/20">
          <ChatInput 
            onSendMessage={handleSendMessage}
            onUploadFile={handleUploadFile}
            disabled={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}

interface SuggestionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

function SuggestionButton({ children, onClick }: SuggestionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2 text-sm bg-iso-purple/10 hover:bg-iso-purple/20 text-left rounded-md border border-iso-purple/30 transition-colors"
    >
      {children}
    </button>
  );
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}

// Simple response generation based on user input
function getAIResponse(message: string): string {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('what is iso') || messageLower.includes('what is 27001')) {
    return "ISO/IEC 27001 is an international standard for information security management. It provides a framework for organizations to protect their information through risk management. The standard helps organizations manage the security of assets such as financial information, intellectual property, employee details, and third-party entrusted information.";
  } 
  else if (messageLower.includes('audit')) {
    return "To prepare for an ISO 27001 audit, you should:\n\n1. Ensure all required documentation is up-to-date\n2. Conduct internal audits to identify gaps\n3. Address any nonconformities\n4. Train relevant staff on procedures\n5. Review your information security management system (ISMS)\n6. Prepare evidence of control implementation\n7. Brief key stakeholders about the audit process";
  }
  else if (messageLower.includes('document') || messageLower.includes('documentation')) {
    return "Key documents required for ISO 27001 compliance include:\n\n1. Information Security Policy\n2. Statement of Applicability (SoA)\n3. Risk Assessment and Treatment Methodology\n4. Risk Treatment Plan\n5. Information Asset Inventory\n6. Access Control Policy\n7. Incident Response Plan\n8. Business Continuity Plan\n9. Internal Audit Program\n10. Management Review Process\n\nWould you like me to provide more details about any specific document?";
  }
  else if (messageLower.includes('upload') || messageLower.includes('file')) {
    return "You can upload your security documents or forms for analysis. I can review them against ISO 27001 requirements and provide feedback on compliance gaps. Would you like to upload a document now?";
  }
  else {
    return "Thank you for your question about ISO 27001 compliance. To provide you with the most accurate guidance, could you please specify which aspect of information security management you're interested in? I can help with risk assessment, required documentation, control implementation, audit preparation, or other compliance-related topics.";
  }
}
