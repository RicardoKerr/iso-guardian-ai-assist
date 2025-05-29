
import React from 'react';
import { Webhook, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebhook } from '@/hooks/useWebhook';

interface WebhookTriggerProps {
  chatMessages: any[];
  files: any[];
  onTrigger?: () => void;
}

export function WebhookTrigger({ chatMessages, files, onTrigger }: WebhookTriggerProps) {
  const { sendWebhook, isLoading } = useWebhook();

  const handleSendData = async () => {
    const complianceData = {
      totalMessages: chatMessages.length,
      filesUploaded: files.filter(f => f.type === 'upload').length,
      filesGenerated: files.filter(f => f.type === 'download').length,
      lastActivity: new Date().toISOString(),
      complianceTopics: extractComplianceTopics(chatMessages)
    };

    const webhookData = {
      timestamp: new Date().toISOString(),
      chatMessages: chatMessages.map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      files: files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        status: file.status
      })),
      complianceData,
      sessionId: generateSessionId()
    };

    const success = await sendWebhook(webhookData);
    if (success && onTrigger) {
      onTrigger();
    }
  };

  return (
    <Button
      onClick={handleSendData}
      disabled={isLoading || chatMessages.length === 0}
      className="bg-iso-purple/20 hover:bg-iso-purple/30 text-iso-purple border border-iso-purple/30"
      variant="outline"
      size="sm"
    >
      <Webhook size={16} className="mr-2" />
      {isLoading ? 'Enviando...' : 'Enviar para N8N'}
    </Button>
  );
}

// Helper functions
function extractComplianceTopics(messages: any[]): string[] {
  const topics = new Set<string>();
  
  messages.forEach(msg => {
    const content = msg.content.toLowerCase();
    if (content.includes('iso') || content.includes('27001')) topics.add('ISO27001');
    if (content.includes('auditoria')) topics.add('Auditoria');
    if (content.includes('documento')) topics.add('Documentação');
    if (content.includes('risco')) topics.add('Gestão de Riscos');
    if (content.includes('política')) topics.add('Políticas');
    if (content.includes('controle')) topics.add('Controles');
  });
  
  return Array.from(topics);
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
