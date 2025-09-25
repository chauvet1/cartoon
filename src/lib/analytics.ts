/**
 * Performance monitoring and analytics for Paperbag
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UserEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId: string;
  timestamp: Date;
}

export interface ErrorEvent {
  error: string;
  stack?: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  context?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Monitor Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();
  }

  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;
        
        this.recordMetric('LCP', lastEntry.startTime, {
          element: lastEntry.element?.tagName,
          url: lastEntry.url
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to observe LCP:', error);
    }
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime, {
            eventType: entry.name
          });
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to observe FID:', error);
    }
  }

  private observeCLS() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        this.recordMetric('CLS', clsValue);
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to observe CLS:', error);
    }
  }

  private observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('FCP', entry.startTime);
        });
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to observe FCP:', error);
    }
  }

  private observeTTFB() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('TTFB', entry.responseStart - entry.requestStart);
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to observe TTFB:', error);
    }
  }

  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
      metadata
    };

    this.metrics.push(metric);

    // Send to analytics service
    this.sendMetric(metric);
  }

  recordCustomMetric(name: string, value: number, metadata?: Record<string, any>) {
    this.recordMetric(`custom_${name}`, value, metadata);
  }

  recordImageProcessingTime(startTime: number, endTime: number, style: string) {
    const duration = endTime - startTime;
    this.recordCustomMetric('image_processing_time', duration, { style });
  }

  recordFileUploadTime(startTime: number, endTime: number, fileSize: number) {
    const duration = endTime - startTime;
    this.recordCustomMetric('file_upload_time', duration, { fileSize });
  }

  recordAPIResponseTime(url: string, startTime: number, endTime: number, status: number) {
    const duration = endTime - startTime;
    this.recordCustomMetric('api_response_time', duration, { url, status });
  }

  private sendMetric(metric: PerformanceMetric) {
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Google Analytics, Mixpanel, etc.
      console.log('Sending metric:', metric);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  getAverageMetric(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

class AnalyticsTracker {
  private events: UserEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.trackPageView();
    this.setupAutomaticTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private trackPageView() {
    this.trackEvent('page_view', {
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    });
  }

  private setupAutomaticTracking() {
    // Track route changes
    let currentPath = window.location.pathname;
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.trackPageView();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const dataTrack = target.getAttribute('data-track');
      
      if (dataTrack) {
        this.trackEvent('click', {
          element: dataTrack,
          text: target.textContent?.trim(),
          href: target.getAttribute('href')
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent('form_submit', {
        formId: form.id,
        formAction: form.action,
        formMethod: form.method
      });
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  trackEvent(event: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const userEvent: UserEvent = {
      event,
      properties,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date()
    };

    this.events.push(userEvent);
    this.sendEvent(userEvent);
  }

  trackImageUpload(fileSize: number, fileType: string) {
    this.trackEvent('image_upload', {
      fileSize,
      fileType,
      timestamp: Date.now()
    });
  }

  trackImageProcessing(style: string, processingTime: number) {
    this.trackEvent('image_processing', {
      style,
      processingTime,
      timestamp: Date.now()
    });
  }

  trackCreditPurchase(amount: number, currency: string) {
    this.trackEvent('credit_purchase', {
      amount,
      currency,
      timestamp: Date.now()
    });
  }

  trackError(error: string, context?: Record<string, any>) {
    const errorEvent: ErrorEvent = {
      error,
      stack: new Error().stack,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      context
    };

    this.trackEvent('error', {
      error: errorEvent.error,
      stack: errorEvent.stack,
      context: errorEvent.context
    });
  }

  private sendEvent(event: UserEvent) {
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Google Analytics, Mixpanel, etc.
      console.log('Sending event:', event);
    }
  }

  getEvents(): UserEvent[] {
    return [...this.events];
  }

  getEventsByType(eventType: string): UserEvent[] {
    return this.events.filter(event => event.event === eventType);
  }

  getSessionDuration(): number {
    const firstEvent = this.events[0];
    const lastEvent = this.events[this.events.length - 1];
    
    if (!firstEvent || !lastEvent) return 0;
    
    return lastEvent.timestamp.getTime() - firstEvent.timestamp.getTime();
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }
}

class ErrorMonitor {
  private errors: ErrorEvent[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.setupGlobalErrorHandling();
  }

  private setupGlobalErrorHandling() {
    // Handle unhandled errors
    window.addEventListener('error', (event) => {
      this.recordError(event.error?.message || 'Unknown error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'unhandled_error'
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError(event.reason?.message || 'Unhandled promise rejection', {
        type: 'unhandled_rejection',
        reason: event.reason
      });
    });
  }

  recordError(error: string, context?: Record<string, any>) {
    if (!this.isEnabled) return;

    const errorEvent: ErrorEvent = {
      error,
      stack: new Error().stack,
      sessionId: analytics.sessionId,
      timestamp: new Date(),
      context
    };

    this.errors.push(errorEvent);
    this.sendError(errorEvent);
  }

  private sendError(error: ErrorEvent) {
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, etc.
      console.error('Sending error:', error);
    }
  }

  getErrors(): ErrorEvent[] {
    return [...this.errors];
  }

  getErrorRate(): number {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const recentErrors = this.errors.filter(
      error => error.timestamp.getTime() > oneHourAgo
    );
    
    return recentErrors.length;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }
}

// Global instances
export const performanceMonitor = new PerformanceMonitor();
export const analytics = new AnalyticsTracker();
export const errorMonitor = new ErrorMonitor();

// Utility functions
export function trackPerformance(name: string, fn: () => Promise<any>): Promise<any>;
export function trackPerformance(name: string, fn: () => any): any;
export function trackPerformance(name: string, fn: () => any | Promise<any>) {
  const startTime = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const endTime = performance.now();
      performanceMonitor.recordCustomMetric(name, endTime - startTime);
    });
  } else {
    const endTime = performance.now();
    performanceMonitor.recordCustomMetric(name, endTime - startTime);
    return result;
  }
}

export function trackAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  return fn().finally(() => {
    const endTime = performance.now();
    performanceMonitor.recordCustomMetric(name, endTime - startTime);
  });
}

// React hook for tracking component performance
export function usePerformanceTracking(componentName: string) {
  const startTime = performance.now();
  
  React.useEffect(() => {
    const endTime = performance.now();
    performanceMonitor.recordCustomMetric(
      `component_render_${componentName}`,
      endTime - startTime
    );
  });
}

// Export for React
export { usePerformanceTracking };