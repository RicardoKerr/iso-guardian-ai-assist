import React, { useState, useRef, useEffect } from 'react';
import { Settings, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChatInput } from './ChatInput';
import { ChatMessage, MessageType } from './ChatMessage';
import { FileTransfer } from './FileTransfer';
import { AIAvatar } from './AIAvatar';
import { WebhookSettings } from './WebhookSettings';
import { WebhookTrigger } from './WebhookTrigger';
import { WebhookMonitor } from './WebhookMonitor';
import { Button } from '@/components/ui/button';
import { useWebhook } from '@/hooks/useWebhook';

interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  audioUrl?: string;
  audioBase64?: string;
}

// Rename our custom File interface to FileItem to avoid conflicts with the browser's File interface
interface FileItem {
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
      content: 'Bem-vindo ao ISO Guardian! Sou seu assistente de IA para conformidade com ISO/IEC 27001. Como posso ajudá-lo hoje com seu sistema de gestão de segurança da informação?',
      timestamp: new Date()
    }
  ]);
  
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showWebhookSettings, setShowWebhookSettings] = useState(false);
  const [showWebhookMonitor, setShowWebhookMonitor] = useState(false);
  const { sendMessage, isLoading, monitoring } = useWebhook();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (content: string, audioBase64?: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
      audioBase64: audioBase64
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    // Determine message type based on content and context
    const messageType = detectMessageType(content, files);
    
    // Prepare message data for N8N
    const messageData = {
      message: content,
      audioBase64: audioBase64,
      timestamp: new Date().toISOString(),
      sessionId: generateSessionId(),
      messageType: audioBase64 ? 'audio' : messageType,
      context: {
        previousMessages: messages.slice(-5), // Last 5 messages for context
        files: files
      }
    };
    
    try {
      // Send to N8N and get response
      const n8nResponse = await sendMessage(messageData);
      
      setIsProcessing(false);
      setIsSpeaking(true);
      
      // Use N8N response or fallback
      const aiContent = n8nResponse?.message || getAIResponse(content);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiContent,
        timestamp: new Date(),
        audioUrl: n8nResponse?.audioUrl,
        audioBase64: n8nResponse?.audioBase64
      }]);
      
      // Calculate speaking duration based on content length
      setTimeout(() => {
        setIsSpeaking(false);
      }, Math.min(aiContent.length * 40, 3000));
      
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      setIsProcessing(false);
      
      // Fallback to static response on error
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getAIResponse(content),
        timestamp: new Date()
      }]);
    }
  };
  
  // Fix: Update this function to handle the browser's File interface
  const handleUploadFile = (browserFile: File) => {
    // Create a new file entry
    const fileSize = formatFileSize(browserFile.size);
    
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: browserFile.name,
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
      
      handleSendMessage(`I've uploaded a file: ${browserFile.name}`);
      
      // Simulate AI sending a download file in response
      if (browserFile.name.toLowerCase().includes('policy') || browserFile.name.toLowerCase().includes('form')) {
        setTimeout(() => {
          const downloadFile: FileItem = {
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
    
    alert(`Baixando ${file.name}. Em um aplicativo de produção, isso iniciaria o download real do arquivo.`);
  };
  
  return (
    <div className="flex flex-col md:flex-row h-full gap-6">
      <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col items-center justify-center p-4">
        <AIAvatar 
          isProcessing={isProcessing} 
          isSpeaking={isSpeaking} 
        />
        
        {/* Webhook Controls */}
        <div className="w-full mt-4 space-y-2">
          <WebhookTrigger 
            chatMessages={messages}
            files={files}
            onTrigger={() => console.log('Dados enviados para N8N')}
          />
          
          <Button
            onClick={() => setShowWebhookSettings(true)}
            variant="outline"
            size="sm"
            className="w-full bg-secondary/20 hover:bg-secondary/30 text-muted-foreground border border-secondary/30"
          >
            <Settings size={16} className="mr-2" />
            Configurar N8N
          </Button>
          
          <Button
            onClick={() => setShowWebhookMonitor(true)}
            variant="outline"
            size="sm"
            className="w-full bg-iso-blue/20 hover:bg-iso-blue/30 text-iso-blue border border-iso-blue/30"
          >
            <Activity size={16} className="mr-2" />
            Monitor N8N
          </Button>
        </div>
        
        <div className="w-full mt-6 space-y-4">
          <SuggestionButton onClick={() => handleSendMessage("O que é ISO/IEC 27001?")}>
            O que é ISO/IEC 27001?
          </SuggestionButton>
          
          <SuggestionButton onClick={() => handleSendMessage("Como me preparar para uma auditoria ISO 27001?")}>
            Como me preparar para uma auditoria ISO 27001?
          </SuggestionButton>
          
          <SuggestionButton onClick={() => handleSendMessage("Quais documentos são necessários para conformidade ISO 27001?")}>
            Documentos necessários ISO 27001?
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
              audioUrl={message.audioUrl}
              audioBase64={message.audioBase64}
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
            disabled={isProcessing || isLoading}
          />
        </div>
      </div>
      
      <WebhookSettings 
        isOpen={showWebhookSettings}
        onClose={() => setShowWebhookSettings(false)}
      />

      {/* Webhook Monitor Dialog */}
      <Dialog open={showWebhookMonitor} onOpenChange={setShowWebhookMonitor}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-iso-blue" />
              <span>Monitor de Webhook N8N</span>
            </DialogTitle>
            <DialogDescription>
              Monitore requisições, latência e status de conectividade com o N8N em tempo real.
            </DialogDescription>
          </DialogHeader>
          <WebhookMonitor monitoring={monitoring} />
        </DialogContent>
      </Dialog>
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
  
  if (messageLower.includes('o que é iso') || messageLower.includes('o que é 27001')) {
    return "A ISO/IEC 27001 é um padrão internacional para gestão de segurança da informação. Fornece uma estrutura para as organizações protegerem suas informações através da gestão de riscos. O padrão ajuda as organizações a gerenciar a segurança de ativos como informações financeiras, propriedade intelectual, detalhes de funcionários e informações confiadas por terceiros.";
  } 
  else if (messageLower.includes('auditoria')) {
    return "Para se preparar para uma auditoria ISO 27001, você deve:\n\n1. Garantir que toda a documentação obrigatória esteja atualizada\n2. Realizar auditorias internas para identificar lacunas\n3. Tratar quaisquer não conformidades\n4. Treinar a equipe relevante nos procedimentos\n5. Revisar seu sistema de gestão de segurança da informação (SGSI)\n6. Preparar evidências da implementação de controles\n7. Orientar as principais partes interessadas sobre o processo de auditoria";
  }
  else if (messageLower.includes('documento') || messageLower.includes('documentação')) {
    return "Documentos principais necessários para conformidade ISO 27001 incluem:\n\n1. Política de Segurança da Informação\n2. Declaração de Aplicabilidade (DdA)\n3. Metodologia de Avaliação e Tratamento de Riscos\n4. Plano de Tratamento de Riscos\n5. Inventário de Ativos de Informação\n6. Política de Controle de Acesso\n7. Plano de Resposta a Incidentes\n8. Plano de Continuidade de Negócios\n9. Programa de Auditoria Interna\n10. Processo de Análise Crítica da Direção\n\nGostaria que eu fornecesse mais detalhes sobre algum documento específico?";
  }
  else if (messageLower.includes('upload') || messageLower.includes('arquivo')) {
    return "Você pode enviar seus documentos de segurança ou formulários para análise. Posso revisá-los em relação aos requisitos da ISO 27001 e fornecer feedback sobre lacunas de conformidade. Gostaria de enviar um documento agora?";
  }
  else {
    return "Obrigado por sua pergunta sobre conformidade ISO 27001. Para fornecer a orientação mais precisa, você poderia especificar qual aspecto da gestão de segurança da informação lhe interessa? Posso ajudar com avaliação de riscos, documentação obrigatória, implementação de controles, preparação para auditoria ou outros tópicos relacionados à conformidade.";
  }
}

// Generate a session ID for tracking conversations
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Detect message type based on content and context
function detectMessageType(content: string, files: FileItem[]): string {
  const contentLower = content.toLowerCase();
  
  // Check if message mentions file upload
  if (contentLower.includes('upload') || contentLower.includes('arquivo') || 
      contentLower.includes('enviado') || contentLower.includes('file')) {
    return 'document';
  }
  
  // Check if there are recent file uploads
  if (files.length > 0 && files.some(f => f.status === 'complete' && f.type === 'upload')) {
    return 'document';
  }
  
  // Check for audio-related keywords
  if (contentLower.includes('áudio') || contentLower.includes('audio') || 
      contentLower.includes('som') || contentLower.includes('voice')) {
    return 'audio';
  }
  
  // Check for image-related keywords
  if (contentLower.includes('imagem') || contentLower.includes('image') || 
      contentLower.includes('foto') || contentLower.includes('picture')) {
    return 'image';
  }
  
  // Default to text
  return 'text';
}
