import { useState, useEffect, useRef } from 'react';

export interface WebhookRequest {
  id: string;
  url: string;
  method: string;
  timestamp: string;
  payload: any;
  status: 'pending' | 'success' | 'error';
  duration?: number;
  response?: any;
  error?: string;
  messageType?: string;
}

export interface WebhookStats {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  averageLatency: number;
  lastSuccess?: string;
  lastError?: string;
  consecutiveErrors: number;
  isConnected: boolean;
}

export function useWebhookMonitoring() {
  const [requests, setRequests] = useState<WebhookRequest[]>([]);
  const [stats, setStats] = useState<WebhookStats>({
    totalRequests: 0,
    successCount: 0,
    errorCount: 0,
    averageLatency: 0,
    consecutiveErrors: 0,
    isConnected: true,
  });
  
  const [healthCheckInterval, setHealthCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const lastHealthCheck = useRef<Date>(new Date());

  // Maximum number of requests to keep in history
  const MAX_REQUESTS = 50;

  const addRequest = (request: Omit<WebhookRequest, 'id'>) => {
    const newRequest: WebhookRequest = {
      ...request,
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    let updatedRequests: WebhookRequest[] = [];
    
    setRequests(prev => {
      updatedRequests = [newRequest, ...prev].slice(0, MAX_REQUESTS);
      return updatedRequests;
    });

    // Update stats
    setStats(prev => {
      const newStats = { ...prev };
      newStats.totalRequests++;
      
      if (request.status === 'success') {
        newStats.successCount++;
        newStats.consecutiveErrors = 0;
        newStats.lastSuccess = request.timestamp;
        newStats.isConnected = true;
      } else if (request.status === 'error') {
        newStats.errorCount++;
        newStats.consecutiveErrors++;
        newStats.lastError = request.timestamp;
        
        // Mark as disconnected if 3+ consecutive errors
        if (newStats.consecutiveErrors >= 3) {
          newStats.isConnected = false;
        }
      }

      // Calculate average latency from recent successful requests
      if (request.status === 'success' && request.duration) {
        const recentSuccessful = [newRequest, ...requests]
          .filter(r => r.status === 'success' && r.duration)
          .slice(0, 10);
        
        if (recentSuccessful.length > 0) {
          newStats.averageLatency = Math.round(
            recentSuccessful.reduce((sum, r) => sum + (r.duration || 0), 0) / recentSuccessful.length
          );
        }
      }

      return newStats;
    });

    return newRequest.id;
  };

  const updateRequest = (id: string, updates: Partial<WebhookRequest>) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, ...updates } : req
    ));

      // Update stats if status changed
      if (updates.status) {
        setStats(prev => {
          const newStats = { ...prev };
          
          if (updates.status === 'success') {
            newStats.successCount++;
            newStats.consecutiveErrors = 0;
            newStats.lastSuccess = updates.timestamp || new Date().toISOString();
            newStats.isConnected = true;
          } else if (updates.status === 'error') {
            newStats.errorCount++;
            newStats.consecutiveErrors++;
            newStats.lastError = updates.timestamp || new Date().toISOString();
            
            if (newStats.consecutiveErrors >= 3) {
              newStats.isConnected = false;
            }
          }

          return newStats;
        });
      }
  };

  const startHealthCheck = (webhookUrl: string) => {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
    }

    const interval = setInterval(async () => {
      const now = new Date();
      const timeSinceLastCheck = now.getTime() - lastHealthCheck.current.getTime();
      
      // Only check if it's been more than 30 seconds since last activity
      if (timeSinceLastCheck > 30000) {
        try {
          const start = performance.now();
          const response = await fetch(webhookUrl, {
            method: 'HEAD', // Use HEAD to minimize data transfer
            mode: 'cors',
          });
          
          const duration = Math.round(performance.now() - start);
          
          addRequest({
            url: webhookUrl,
            method: 'HEAD',
            timestamp: now.toISOString(),
            payload: null,
            status: response.ok ? 'success' : 'error',
            duration,
            messageType: 'health-check'
          });
        } catch (error) {
          addRequest({
            url: webhookUrl,
            method: 'HEAD',
            timestamp: now.toISOString(),
            payload: null,
            status: 'error',
            error: error instanceof Error ? error.message : 'Health check failed',
            messageType: 'health-check'
          });
        }
      }
      
      lastHealthCheck.current = now;
    }, 60000); // Check every minute

    setHealthCheckInterval(interval);
  };

  const stopHealthCheck = () => {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
      setHealthCheckInterval(null);
    }
  };

  const clearHistory = () => {
    setRequests([]);
    setStats({
      totalRequests: 0,
      successCount: 0,
      errorCount: 0,
      averageLatency: 0,
      consecutiveErrors: 0,
      isConnected: true,
    });
  };

  const getRecentRequests = (count: number = 10) => {
    return requests.slice(0, count);
  };

  const getRequestsByType = (messageType: string) => {
    return requests.filter(req => req.messageType === messageType);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
    };
  }, [healthCheckInterval]);

  return {
    requests,
    stats,
    addRequest,
    updateRequest,
    startHealthCheck,
    stopHealthCheck,
    clearHistory,
    getRecentRequests,
    getRequestsByType,
  };
}
