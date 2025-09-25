/**
 * Analytics integration for various services
 */

import { performanceMonitor, analytics, errorMonitor } from './analytics';

// Google Analytics 4 Integration
export class GoogleAnalytics {
  private measurementId: string;
  private isInitialized: boolean = false;

  constructor(measurementId: string) {
    this.measurementId = measurementId;
    this.initialize();
  }

  private initialize() {
    if (typeof window === 'undefined' || this.isInitialized) return;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', this.measurementId, {
      page_title: document.title,
      page_location: window.location.href
    });

    this.isInitialized = true;
  }

  trackEvent(eventName: string, parameters?: Record<string, any>) {
    if (!this.isInitialized) return;

    window.gtag('event', eventName, {
      event_category: parameters?.category || 'engagement',
      event_label: parameters?.label,
      value: parameters?.value,
      ...parameters
    });
  }

  trackPageView(pagePath: string, pageTitle?: string) {
    if (!this.isInitialized) return;

    window.gtag('config', this.measurementId, {
      page_path: pagePath,
      page_title: pageTitle || document.title
    });
  }

  trackPurchase(transactionId: string, value: number, currency: string = 'USD', items?: any[]) {
    if (!this.isInitialized) return;

    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items
    });
  }

  setUserId(userId: string) {
    if (!this.isInitialized) return;

    window.gtag('config', this.measurementId, {
      user_id: userId
    });
  }
}

// Mixpanel Integration
export class MixpanelAnalytics {
  private token: string;
  private isInitialized: boolean = false;

  constructor(token: string) {
    this.token = token;
    this.initialize();
  }

  private initialize() {
    if (typeof window === 'undefined' || this.isInitialized) return;

    // Load Mixpanel script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
    document.head.appendChild(script);

    script.onload = () => {
      window.mixpanel.init(this.token);
      this.isInitialized = true;
    };
  }

  track(eventName: string, properties?: Record<string, any>) {
    if (!this.isInitialized) return;

    window.mixpanel.track(eventName, {
      timestamp: new Date().toISOString(),
      ...properties
    });
  }

  identify(userId: string, properties?: Record<string, any>) {
    if (!this.isInitialized) return;

    window.mixpanel.identify(userId);
    if (properties) {
      window.mixpanel.people.set(properties);
    }
  }

  alias(userId: string) {
    if (!this.isInitialized) return;

    window.mixpanel.alias(userId);
  }
}

// Sentry Error Tracking Integration
export class SentryIntegration {
  private dsn: string;
  private isInitialized: boolean = false;

  constructor(dsn: string) {
    this.dsn = dsn;
    this.initialize();
  }

  private initialize() {
    if (typeof window === 'undefined' || this.isInitialized) return;

    // Load Sentry script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://browser.sentry-cdn.com/7.0.0/bundle.min.js';
    document.head.appendChild(script);

    script.onload = () => {
      window.Sentry.init({
        dsn: this.dsn,
        environment: process.env.NODE_ENV,
        beforeSend(event) {
          // Filter out development errors
          if (process.env.NODE_ENV === 'development') {
            return null;
          }
          return event;
        }
      });

      this.isInitialized = true;
    };
  }

  captureException(error: Error, context?: Record<string, any>) {
    if (!this.isInitialized) return;

    window.Sentry.captureException(error, {
      extra: context
    });
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    if (!this.isInitialized) return;

    window.Sentry.captureMessage(message, level);
  }

  setUser(user: { id: string; email?: string; username?: string }) {
    if (!this.isInitialized) return;

    window.Sentry.setUser(user);
  }

  addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info') {
    if (!this.isInitialized) return;

    window.Sentry.addBreadcrumb({
      message,
      category,
      level
    });
  }
}

// Custom Analytics Service Integration
export class CustomAnalyticsService {
  private endpoint: string;
  private apiKey: string;

  constructor(endpoint: string, apiKey: string) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
  }

  async trackEvent(event: string, properties?: Record<string, any>) {
    try {
      await fetch(`${this.endpoint}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          event,
          properties,
          timestamp: new Date().toISOString(),
          sessionId: analytics.sessionId,
          userId: analytics.userId
        })
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  async trackPerformance(metrics: any[]) {
    try {
      await fetch(`${this.endpoint}/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          metrics,
          timestamp: new Date().toISOString(),
          sessionId: analytics.sessionId,
          userId: analytics.userId
        })
      });
    } catch (error) {
      console.error('Failed to track performance:', error);
    }
  }

  async trackError(error: Error, context?: Record<string, any>) {
    try {
      await fetch(`${this.endpoint}/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          context,
          timestamp: new Date().toISOString(),
          sessionId: analytics.sessionId,
          userId: analytics.userId
        })
      });
    } catch (error) {
      console.error('Failed to track error:', error);
    }
  }
}

// Analytics Manager - Centralized analytics handling
export class AnalyticsManager {
  private services: {
    googleAnalytics?: GoogleAnalytics;
    mixpanel?: MixpanelAnalytics;
    sentry?: SentryIntegration;
    customService?: CustomAnalyticsService;
  } = {};

  constructor(config: {
    googleAnalyticsId?: string;
    mixpanelToken?: string;
    sentryDsn?: string;
    customServiceEndpoint?: string;
    customServiceApiKey?: string;
  }) {
    if (config.googleAnalyticsId) {
      this.services.googleAnalytics = new GoogleAnalytics(config.googleAnalyticsId);
    }

    if (config.mixpanelToken) {
      this.services.mixpanel = new MixpanelAnalytics(config.mixpanelToken);
    }

    if (config.sentryDsn) {
      this.services.sentry = new SentryIntegration(config.sentryDsn);
    }

    if (config.customServiceEndpoint && config.customServiceApiKey) {
      this.services.customService = new CustomAnalyticsService(
        config.customServiceEndpoint,
        config.customServiceApiKey
      );
    }

    this.setupIntegration();
  }

  private setupIntegration() {
    // Integrate with internal analytics
    const originalTrackEvent = analytics.trackEvent.bind(analytics);
    analytics.trackEvent = (event: string, properties?: Record<string, any>) => {
      originalTrackEvent(event, properties);
      this.trackEvent(event, properties);
    };

    const originalTrackError = errorMonitor.recordError.bind(errorMonitor);
    errorMonitor.recordError = (error: string, context?: Record<string, any>) => {
      originalTrackError(error, context);
      this.trackError(new Error(error), context);
    };
  }

  trackEvent(event: string, properties?: Record<string, any>) {
    // Google Analytics
    this.services.googleAnalytics?.trackEvent(event, properties);

    // Mixpanel
    this.services.mixpanel?.track(event, properties);

    // Custom Service
    this.services.customService?.trackEvent(event, properties);
  }

  trackPageView(pagePath: string, pageTitle?: string) {
    this.services.googleAnalytics?.trackPageView(pagePath, pageTitle);
  }

  trackPurchase(transactionId: string, value: number, currency: string = 'USD', items?: any[]) {
    this.services.googleAnalytics?.trackPurchase(transactionId, value, currency, items);
    this.services.mixpanel?.track('Purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items
    });
  }

  setUserId(userId: string) {
    this.services.googleAnalytics?.setUserId(userId);
    this.services.mixpanel?.identify(userId);
    this.services.sentry?.setUser({ id: userId });
  }

  trackError(error: Error, context?: Record<string, any>) {
    this.services.sentry?.captureException(error, context);
    this.services.customService?.trackError(error, context);
  }

  trackPerformance() {
    const metrics = performanceMonitor.getMetrics();
    this.services.customService?.trackPerformance(metrics);
  }

  // Business-specific tracking methods
  trackImageUpload(fileSize: number, fileType: string) {
    this.trackEvent('image_upload', {
      file_size: fileSize,
      file_type: fileType,
      category: 'engagement'
    });
  }

  trackImageProcessing(style: string, processingTime: number, success: boolean) {
    this.trackEvent('image_processing', {
      style,
      processing_time: processingTime,
      success,
      category: 'conversion'
    });
  }

  trackCreditPurchase(amount: number, currency: string, credits: number) {
    this.trackPurchase(`credit_${Date.now()}`, amount, currency, [{
      item_id: 'credits',
      item_name: 'Image Credits',
      category: 'credits',
      quantity: credits,
      price: amount / credits
    }]);
  }

  trackUserSignup(method: string) {
    this.trackEvent('sign_up', {
      method,
      category: 'engagement'
    });
  }

  trackUserLogin(method: string) {
    this.trackEvent('login', {
      method,
      category: 'engagement'
    });
  }
}

// Initialize analytics manager with environment variables
export const analyticsManager = new AnalyticsManager({
  googleAnalyticsId: process.env.VITE_GA_MEASUREMENT_ID,
  mixpanelToken: process.env.VITE_MIXPANEL_TOKEN,
  sentryDsn: process.env.VITE_SENTRY_DSN,
  customServiceEndpoint: process.env.VITE_ANALYTICS_ENDPOINT,
  customServiceApiKey: process.env.VITE_ANALYTICS_API_KEY
});

// Export for easy access
export { analyticsManager as analytics };