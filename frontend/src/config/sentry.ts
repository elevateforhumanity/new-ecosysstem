import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

/**
 * Initialize Sentry for React frontend
 */
export const initSentry = () => {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn('VITE_SENTRY_DSN not configured, skipping Sentry initialization');
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE || 'development',
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    
    integrations: [
      new BrowserTracing({
        // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/api\.elevateforhumanity\.org/,
          /^https:\/\/elevateforhumanity\.org/,
        ],
      }),
      new Sentry.Replay({
        // Capture 10% of all sessions in production
        sessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        // Capture 100% of sessions with errors
        errorSampleRate: 1.0,
        // Mask all text content
        maskAllText: true,
        // Block all media (images, videos, etc.)
        blockAllMedia: true,
      }),
    ],
    
    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
          if (breadcrumb.data) {
            // Remove sensitive keys
            const sensitiveKeys = ['password', 'token', 'api_key', 'secret', 'authorization'];
            sensitiveKeys.forEach(key => {
              if (breadcrumb.data && key in breadcrumb.data) {
                breadcrumb.data[key] = '[REDACTED]';
              }
            });
          }
          return breadcrumb;
        });
      }
      
      // Remove sensitive request data
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      
      return event;
    },
    
    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Facebook
      'fb_xd_fragment',
      // ISP optimizing proxy
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      'conduitPage',
      // Generic errors
      'Non-Error promise rejection captured',
      'Network request failed',
      'Failed to fetch',
      'NetworkError',
      'Load failed',
      // ResizeObserver errors (harmless)
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
    ],
  });
};

/**
 * Helper function to capture exceptions manually
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Helper function to capture messages
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

/**
 * Helper function to set user context
 */
export const setUserContext = (user: { id: string; email?: string; username?: string } | null) => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } else {
    Sentry.setUser(null);
  }
};

/**
 * Helper function to add breadcrumb
 */
export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb) => {
  Sentry.addBreadcrumb(breadcrumb);
};

/**
 * Error Boundary component
 */
export const ErrorBoundary = Sentry.ErrorBoundary;

export default Sentry;
