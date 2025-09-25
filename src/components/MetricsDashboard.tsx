import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { CardSkeleton, LoadingSpinner } from './ui/loading';
import { performanceMonitor, analytics, errorMonitor } from '../lib/analytics';

interface MetricsDashboardProps {
  className?: string;
}

interface BusinessMetrics {
  totalUsers: number;
  totalImages: number;
  totalRevenue: number;
  averageProcessingTime: number;
  errorRate: number;
  conversionRate: number;
  userRetention: number;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration - in production, this would come from your analytics service
  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        totalUsers: 1250,
        totalImages: 5420,
        totalRevenue: 12500,
        averageProcessingTime: 45.2,
        errorRate: 2.1,
        conversionRate: 12.5,
        userRetention: 78.3
      });

      setPerformanceMetrics({
        lcp: performanceMonitor.getAverageMetric('LCP'),
        fid: performanceMonitor.getAverageMetric('FID'),
        cls: performanceMonitor.getAverageMetric('CLS'),
        fcp: performanceMonitor.getAverageMetric('FCP'),
        ttfb: performanceMonitor.getAverageMetric('TTFB')
      });

      setIsLoading(false);
    };

    loadMetrics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDuration = (seconds: number) => {
    return `${seconds.toFixed(1)}s`;
  };

  const getPerformanceScore = (value: number, thresholds: { good: number; needsImprovement: number }) => {
    if (value <= thresholds.good) return { score: 'Good', color: 'text-green-600' };
    if (value <= thresholds.needsImprovement) return { score: 'Needs Improvement', color: 'text-yellow-600' };
    return { score: 'Poor', color: 'text-red-600' };
  };

  if (isLoading) {
    return <CardSkeleton className={className} />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics?.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Images Processed</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics?.totalImages.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(metrics?.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
              <p className="text-2xl font-semibold text-gray-900">{formatDuration(metrics?.averageProcessingTime || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Web Vitals</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatDuration(performanceMetrics?.lcp || 0)}
            </div>
            <div className="text-sm text-gray-600 mb-1">LCP</div>
            <div className={`text-xs font-medium ${getPerformanceScore(performanceMetrics?.lcp || 0, { good: 2.5, needsImprovement: 4.0 }).color}`}>
              {getPerformanceScore(performanceMetrics?.lcp || 0, { good: 2.5, needsImprovement: 4.0 }).score}
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {performanceMetrics?.fid ? `${performanceMetrics.fid.toFixed(1)}ms` : '0ms'}
            </div>
            <div className="text-sm text-gray-600 mb-1">FID</div>
            <div className={`text-xs font-medium ${getPerformanceScore(performanceMetrics?.fid || 0, { good: 100, needsImprovement: 300 }).color}`}>
              {getPerformanceScore(performanceMetrics?.fid || 0, { good: 100, needsImprovement: 300 }).score}
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {performanceMetrics?.cls ? performanceMetrics.cls.toFixed(3) : '0.000'}
            </div>
            <div className="text-sm text-gray-600 mb-1">CLS</div>
            <div className={`text-xs font-medium ${getPerformanceScore(performanceMetrics?.cls || 0, { good: 0.1, needsImprovement: 0.25 }).color}`}>
              {getPerformanceScore(performanceMetrics?.cls || 0, { good: 0.1, needsImprovement: 0.25 }).score}
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatDuration(performanceMetrics?.fcp || 0)}
            </div>
            <div className="text-sm text-gray-600 mb-1">FCP</div>
            <div className={`text-xs font-medium ${getPerformanceScore(performanceMetrics?.fcp || 0, { good: 1.8, needsImprovement: 3.0 }).color}`}>
              {getPerformanceScore(performanceMetrics?.fcp || 0, { good: 1.8, needsImprovement: 3.0 }).score}
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatDuration(performanceMetrics?.ttfb || 0)}
            </div>
            <div className="text-sm text-gray-600 mb-1">TTFB</div>
            <div className={`text-xs font-medium ${getPerformanceScore(performanceMetrics?.ttfb || 0, { good: 0.8, needsImprovement: 1.8 }).color}`}>
              {getPerformanceScore(performanceMetrics?.ttfb || 0, { good: 0.8, needsImprovement: 1.8 }).score}
            </div>
          </div>
        </div>
      </div>

      {/* Business KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Error Rate</h4>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-gray-900">
              {formatPercentage(metrics?.errorRate || 0)}
            </div>
            <div className="ml-4">
              <div className={`text-sm font-medium ${(metrics?.errorRate || 0) < 5 ? 'text-green-600' : 'text-red-600'}`}>
                {(metrics?.errorRate || 0) < 5 ? 'Good' : 'Needs Attention'}
              </div>
              <div className="text-xs text-gray-500">Last 24 hours</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rate</h4>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-gray-900">
              {formatPercentage(metrics?.conversionRate || 0)}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-blue-600">Above Average</div>
              <div className="text-xs text-gray-500">Free to paid</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">User Retention</h4>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-gray-900">
              {formatPercentage(metrics?.userRetention || 0)}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-green-600">Excellent</div>
              <div className="text-xs text-gray-500">30-day retention</div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Events */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {analytics.getEvents().slice(-5).map((event, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <div className="text-sm font-medium text-gray-900">{event.event}</div>
                <div className="text-xs text-gray-500">
                  {event.timestamp.toLocaleTimeString()}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {event.userId ? `User: ${event.userId.slice(0, 8)}...` : 'Anonymous'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Summary</h3>
        <div className="space-y-3">
          {errorMonitor.getErrors().slice(-3).map((error, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <div className="text-sm font-medium text-red-600">{error.error}</div>
                <div className="text-xs text-gray-500">
                  {error.timestamp.toLocaleTimeString()}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {error.userId ? `User: ${error.userId.slice(0, 8)}...` : 'System'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};