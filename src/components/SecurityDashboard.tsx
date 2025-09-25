import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { CardSkeleton, LoadingSpinner } from './ui/loading';
import { AccessibleButton } from './ui/accessible';

interface SecurityLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  event: string;
  details: any;
  userId?: string;
  ip?: string;
}

interface SecurityDashboardProps {
  className?: string;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ className }) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [timeRange, setTimeRange] = useState<number>(24); // hours

  const securityLogs = useQuery(api.security.getSecurityLogs, {
    level: selectedLevel || undefined,
    userId: selectedUserId || undefined,
    since: Date.now() - (timeRange * 60 * 60 * 1000)
  });

  const rateLimitStatus = useQuery(api.security.getRateLimitStatus);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEventDescription = (event: string) => {
    const descriptions: Record<string, string> = {
      'upload_url_request': 'Upload URL requested',
      'image_save': 'Image saved to storage',
      'image_processing_request': 'Image processing requested',
      'image_processing_started': 'Image processing started',
      'rate_limit_exceeded': 'Rate limit exceeded',
      'unauthorized_access_attempt': 'Unauthorized access attempt',
      'invalid_style_parameter': 'Invalid style parameter provided',
      'unauthorized_image_access': 'Unauthorized image access attempt',
      'security_logs_accessed': 'Security logs accessed',
      'function_execution_error': 'Function execution error'
    };
    return descriptions[event] || event;
  };

  if (!securityLogs || !rateLimitStatus) {
    return <CardSkeleton className={className} />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Security Dashboard</h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Log Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              placeholder="Filter by user ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Last Hour</option>
              <option value={24}>Last 24 Hours</option>
              <option value={168}>Last Week</option>
              <option value={720}>Last Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rate Limit Status */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Limit Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {rateLimitStatus.upload.remaining}
            </div>
            <div className="text-sm text-gray-600">Upload Requests</div>
            <div className="text-xs text-gray-500">
              Resets: {new Date(rateLimitStatus.upload.resetTime).toLocaleTimeString()}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {rateLimitStatus.processing.remaining}
            </div>
            <div className="text-sm text-gray-600">Processing Requests</div>
            <div className="text-xs text-gray-500">
              Resets: {new Date(rateLimitStatus.processing.resetTime).toLocaleTimeString()}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {rateLimitStatus.general.remaining}
            </div>
            <div className="text-sm text-gray-600">General Requests</div>
            <div className="text-xs text-gray-500">
              Resets: {new Date(rateLimitStatus.general.resetTime).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Security Logs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Security Logs ({securityLogs.length})
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {securityLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No security logs found for the selected filters.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {securityLogs.map((log: SecurityLog, index: number) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {getEventDescription(log.event)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {log.details && typeof log.details === 'object' ? (
                          <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        ) : (
                          log.details
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatTimestamp(log.timestamp)}</span>
                        {log.userId && (
                          <span>User: {log.userId}</span>
                        )}
                        {log.ip && (
                          <span>IP: {log.ip}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};