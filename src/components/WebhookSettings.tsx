
import React, { useState } from 'react';
import { Settings, Webhook, TestTube, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebhook } from '@/hooks/useWebhook';
import { cn } from '@/lib/utils';

interface WebhookSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WebhookSettings({ isOpen, onClose }: WebhookSettingsProps) {
  const { webhookUrl, setWebhookUrl, isLoading, testWebhook } = useWebhook();
  const [tempUrl, setTempUrl] = useState(webhookUrl);

  const handleSave = () => {
    setWebhookUrl(tempUrl);
    onClose();
  };

  const handleTest = async () => {
    setWebhookUrl(tempUrl);
    await testWebhook();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-iso-dark border border-iso-purple/30 rounded-lg p-6 w-full max-w-md futuristic-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Webhook className="text-iso-purple" size={20} />
            <h3 className="text-lg font-semibold">Configurações do Webhook N8N</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-white"
          >
            ✕
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              URL do Webhook N8N
            </label>
            <input
              type="url"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="https://n8n.rakewells.com/webhook-test/..."
              className="w-full bg-secondary/30 border border-iso-purple/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-iso-purple/50"
            />
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Este webhook será usado para enviar dados de conformidade ISO 27001 coletados durante as consultas para automação no N8N.</p>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleTest}
              disabled={isLoading || !tempUrl}
              className="flex-1 bg-iso-blue/20 hover:bg-iso-blue/30 text-iso-blue border border-iso-blue/30"
              variant="outline"
            >
              <TestTube size={16} className="mr-2" />
              {isLoading ? 'Testando...' : 'Testar'}
            </Button>
            
            <Button
              onClick={handleSave}
              className="flex-1 bg-iso-purple hover:bg-iso-purple/80"
            >
              <Save size={16} className="mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
