
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WebhookData {
  timestamp: string;
  chatMessages: any[];
  files: any[];
  complianceData: any;
  sessionId: string;
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
        mode: "no-cors",
        body: JSON.stringify({
          ...data,
          source: "ISO Guardian",
          triggered_from: window.location.origin,
        }),
      });

      const duration = Math.round(performance.now() - start);
      console.info("[Webhook] Requisição finalizada", { durationMs: duration, corsMode: "no-cors" });

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
    testWebhook
  };
}
