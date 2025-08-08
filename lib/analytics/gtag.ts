/**
 * Google Analytics 4 (GA4) configuration and gtag utilities
 */

// GA4 Measurement ID - will be set via environment variable
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set' | 'consent',
      targetId: string | Date | object,
      config?: object
    ) => void;
    dataLayer: unknown[];
  }
}

/**
 * Initialize Google Analytics
 */
export const initGA = (): void => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) {
    return;
  }

  // Initialize dataLayer if it doesn't exist
  window.dataLayer = window.dataLayer || [];
  
  // gtag function
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  // Initialize with current timestamp
  window.gtag('js', new Date());

  // Configure GA4
  window.gtag('config', GA_MEASUREMENT_ID, {
    // Enhanced privacy settings
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    
    // Custom configuration
    page_title: document.title,
    page_location: window.location.href,
    
    // Performance and debugging
    debug_mode: process.env.NODE_ENV === 'development',
    send_page_view: true
  });
};

/**
 * Track page views
 */
export const trackPageView = (url: string, title?: string): void => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || !window.gtag) {
    return;
  }

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.origin + url
  });
};

/**
 * Track custom events
 */
export const trackEvent = (
  eventName: string,
  parameters?: {
    event_category?: string;
    event_label?: string;
    value?: number;
    custom_parameters?: Record<string, unknown>;
  }
): void => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || !window.gtag) {
    return;
  }

  window.gtag('event', eventName, {
    event_category: parameters?.event_category,
    event_label: parameters?.event_label,
    value: parameters?.value,
    ...parameters?.custom_parameters
  });
};

/**
 * Track conversions (goals)
 */
export const trackConversion = (
  conversionName: string,
  value?: number,
  currency: string = 'USD'
): void => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || !window.gtag) {
    return;
  }

  window.gtag('event', 'conversion', {
    send_to: GA_MEASUREMENT_ID,
    event_category: 'conversion',
    event_label: conversionName,
    value: value,
    currency: currency
  });
};

/**
 * Set user properties
 */
export const setUserProperty = (properties: Record<string, string>): void => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || !window.gtag) {
    return;
  }

  window.gtag('set', properties);
};

/**
 * Check if GA is available and user has consented
 */
export const isGAAvailable = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    !!GA_MEASUREMENT_ID &&
    !!window.gtag &&
    // Check for user consent (will implement consent management)
    localStorage.getItem('ga-consent') === 'granted'
  );
};