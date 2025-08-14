
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WebhookData {
  timestamp: string;
  chatMessages: any[];
  files: any[];
  complianceData: any;
  sessionId: string;
}

interface MessageData {
  message: string;
  timestamp: string;
  sessionId: string;
  context: {
    previousMessages: any[];
    files: any[];
  };
}

interface N8NResponse {
  message?: string;
  audioUrl?: string;
  audioBase64?: string;
  data?: any;
}

export function useWebhook() {
  const [webhookUrl, setWebhookUrl] = useState('https://n8n.rakewells.com/webhook-test/iso-guardian-27001');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendWebhook = async (data: WebhookData) => {
    if (!webhookUrl) {
      toast({
        title: "Erro",
        description: "URL do webhook não configurada",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    const start = performance.now();
    console.info("[Webhook] Enviando dados para N8N", { url: webhookUrl, ts: new Date().toISOString() });

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        body: JSON.stringify({
          ...data,
          source: "ISO Guardian",
          triggered_from: window.location.origin,
        }),
      });

      const duration = Math.round(performance.now() - start);
      
      if (!response.ok) {
        console.error("[Webhook] Erro na resposta", { status: response.status, statusText: response.statusText, durationMs: duration });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.info("[Webhook] Requisição finalizada", { status: response.status, durationMs: duration });

      toast({
        title: "Dados Enviados",
        description: "Dados de conformidade enviados para o N8N com sucesso. Verifique o histórico do seu workflow.",
      });
      
      return true;
    } catch (error) {
      const duration = Math.round(performance.now() - start);
      console.error("Erro ao enviar webhook:", error, { durationMs: duration });
      toast({
        title: "Erro",
        description: "Falha ao enviar dados para o N8N. Verifique a URL e tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageData: MessageData): Promise<N8NResponse | null> => {
    if (!webhookUrl) {
      toast({
        title: "Erro",
        description: "URL do webhook não configurada",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    const start = performance.now();
    console.info("[Webhook] Enviando mensagem para N8N", { 
      url: webhookUrl, 
      messagePreview: messageData.message.substring(0, 50),
      ts: new Date().toISOString() 
    });

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        body: JSON.stringify({
          ...messageData,
          type: "chat_message",
          source: "ISO Guardian",
          triggered_from: window.location.origin,
        }),
      });

      const duration = Math.round(performance.now() - start);
      
      if (!response.ok) {
        console.error("[Webhook] Erro na resposta da mensagem", { status: response.status, statusText: response.statusText, durationMs: duration });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData: N8NResponse = await response.json();
      console.info("[Webhook] Resposta da mensagem recebida", { 
        status: response.status, 
        hasMessage: !!responseData.message,
        hasAudio: !!(responseData.audioUrl || responseData.audioBase64),
        durationMs: duration 
      });
      
      return responseData;
    } catch (error) {
      const duration = Math.round(performance.now() - start);
      console.error("Erro ao enviar mensagem para webhook:", error, { durationMs: duration });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const testWebhook = async () => {
    const testData: WebhookData = {
      timestamp: new Date().toISOString(),
      chatMessages: [],
      files: [],
      complianceData: { test: true, message: "Teste de conectividade ISO Guardian" },
      sessionId: 'test-session'
    };

    return await sendWebhook(testData);
  };

  return {
    webhookUrl,
    setWebhookUrl,
    isLoading,
    sendWebhook,
    sendMessage,
    testWebhook
  };
}
