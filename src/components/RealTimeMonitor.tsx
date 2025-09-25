import React, { useState, useEffect, useRef } from 'react';
import { performanceMonitor, analytics, errorMonitor } from '../lib/analytics';

interface RealTimeMonitorProps {
  className?: string;
}

interface SystemStatus {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
}

export const RealTimeMonitor: React.FC<RealTimeMonitorProps> = ({ className }) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'healthy',
    uptime: 99.9,
    responseTime: 120,
    errorRate: 0.1,
    activeUsers: 0
  });

  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Simulate real-time updates
    const updateStatus = () => {
      setLastUpdate(new Date());
      
      // Simulate system metrics
      const newStatus = {
        status: Math.random() > 0.95 ? 'degraded' : 'healthy' as 'healthy' | 'degraded' | 'down',
        uptime: 99.9 + (Math.random() - 0.5) * 0.2,
        responseTime: 120 + (Math.random() - 0.5) * 40,
        errorRate: Math.max(0, 0.1 + (Math.random() - 0.5) * 0.2),
        activeUsers: Math.floor(Math.random() * 50) + 10
      };

      setSystemStatus(newStatus);
    };

    intervalRef.current = setInterval(updateStatus, 5000);
    updateStatus(); // Initial update

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'down': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '🟢';
      case 'degraded': return '🟡';
      case 'down': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Real-time System Status</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl mb-1">{getStatusIcon(systemStatus.status)}</div>
          <div className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(systemStatus.status)}`}>
            {systemStatus.status.toUpperCase()}
          </div>
          <div className="text-xs text-gray-500 mt-1">System Status</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {systemStatus.uptime.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Uptime</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {systemStatus.responseTime.toFixed(0)}ms
          </div>
          <div className="text-xs text-gray-500 mt-1">Response Time</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {systemStatus.activeUsers}
          </div>
          <div className="text-xs text-gray-500 mt-1">Active Users</div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Live Performance Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Image Processing Queue</div>
            <div className="text-lg font-semibold text-gray-900">
              {Math.floor(Math.random() * 10)} pending
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">API Response Time</div>
            <div className="text-lg font-semibold text-gray-900">
              {Math.floor(Math.random() * 200 + 50)}ms
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Error Rate (24h)</div>
            <div className="text-lg font-semibold text-gray-900">
              {systemStatus.errorRate.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {analytics.getEvents().slice(-5).map((event, index) => (
            <div key={index} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-gray-700">{event.event}</span>
              </div>
              <span className="text-gray-500">
                {event.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Last Update */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

// Health Check Component
export const HealthCheck: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<{
    api: 'healthy' | 'degraded' | 'down';
    database: 'healthy' | 'degraded' | 'down';
    storage: 'healthy' | 'degraded' | 'down';
    ai: 'healthy' | 'degraded' | 'down';
  }>({
    api: 'healthy',
    database: 'healthy',
    storage: 'healthy',
    ai: 'healthy'
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // In production, these would be actual health check calls
        const checks = await Promise.allSettled([
          fetch('/api/health'),
          fetch('/api/database/health'),
          fetch('/api/storage/health'),
          fetch('/api/ai/health')
        ]);

        setHealthStatus({
          api: checks[0].status === 'fulfilled' ? 'healthy' : 'down',
          database: checks[1].status === 'fulfilled' ? 'healthy' : 'down',
          storage: checks[2].status === 'fulfilled' ? 'healthy' : 'down',
          ai: checks[3].status === 'fulfilled' ? 'healthy' : 'down'
        });
      } catch (error) {
        console.error('Health check failed:', error);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Service Health</h4>
      <div className="space-y-2">
        {Object.entries(healthStatus).map(([service, status]) => (
          <div key={service} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 capitalize">{service}</span>
            <span className={`text-sm font-medium ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};