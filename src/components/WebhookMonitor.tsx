import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Database, Eye, Trash2, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWebhookMonitoring, type WebhookRequest } from '@/hooks/useWebhookMonitoring';

interface WebhookMonitorProps {
  monitoring: ReturnType<typeof useWebhookMonitoring>;
}

export function WebhookMonitor({ monitoring }: WebhookMonitorProps) {
  const { requests, stats, clearHistory, getRecentRequests } = monitoring;
  const [selectedRequest, setSelectedRequest] = useState<WebhookRequest | null>(null);

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMessageTypeColor = (type?: string) => {
    switch (type) {
      case 'text': return 'bg-blue-100 text-blue-800';
      case 'audio': return 'bg-purple-100 text-purple-800';
      case 'image': return 'bg-green-100 text-green-800';
      case 'document': return 'bg-orange-100 text-orange-800';
      case 'health-check': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const recentRequests = getRecentRequests(10);

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {stats.isConnected ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className={`text-xs ${stats.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.isConnected ? 'Conectado' : 'Desconectado'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-xl font-bold">{stats.totalRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Sucesso</p>
                <p className="text-xl font-bold text-green-600">{stats.successCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Latência</p>
                <p className="text-xl font-bold">{formatDuration(stats.averageLatency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.consecutiveErrors >= 3 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium text-red-800">Problemas de Conectividade</p>
                <p className="text-sm text-red-600">
                  {stats.consecutiveErrors} erros consecutivos. Verifique a URL do webhook.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg">Requisições Recentes</CardTitle>
            <CardDescription>Últimas 10 requisições para o N8N</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={clearHistory}>
              <Trash2 className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {recentRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma requisição registrada
                </p>
              ) : (
                recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{request.method}</span>
                          {request.messageType && (
                            <Badge variant="secondary" className={`text-xs ${getMessageTypeColor(request.messageType)}`}>
                              {request.messageType}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(request.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(request.duration)}
                      </span>
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedRequest && getStatusIcon(selectedRequest.status)}
              <span>Detalhes da Requisição</span>
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && formatTimestamp(selectedRequest.timestamp)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <ScrollArea className="max-h-96">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Método</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest.method}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest.status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Duração</p>
                    <p className="text-sm text-muted-foreground">{formatDuration(selectedRequest.duration)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tipo</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest.messageType || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">URL</p>
                  <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                    {selectedRequest.url}
                  </code>
                </div>

                {selectedRequest.payload && (
                  <div>
                    <p className="text-sm font-medium mb-2">Payload</p>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedRequest.payload, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedRequest.response && (
                  <div>
                    <p className="text-sm font-medium mb-2">Resposta</p>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedRequest.response, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedRequest.error && (
                  <div>
                    <p className="text-sm font-medium mb-2">Erro</p>
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {selectedRequest.error}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}