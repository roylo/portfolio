'use client';

/**
 * Google Analytics component for loading GA4 script and initializing tracking
 */

import Script from 'next/script';
import { useEffect } from 'react';
import { initGA, GA_MEASUREMENT_ID } from '@/lib/analytics';
import { analyticsStorage, hasDoNotTrack, isBot } from '@/lib/analytics/utils';

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const gaId = measurementId || GA_MEASUREMENT_ID;
  
  useEffect(() => {
    // Don't load analytics for bots or if Do Not Track is enabled
    if (isBot() || hasDoNotTrack()) {
      return;
    }
    
    // Check for user consent
    const consent = analyticsStorage.getConsent();
    if (consent === 'denied') {
      return;
    }
    
    // If no consent recorded yet, we'll initialize but respect the consent banner
    // The consent banner will handle the actual consent flow
    if (gaId) {
      initGA();
    }
  }, [gaId]);
  
  // Don't render anything if GA is not configured or user conditions aren't met
  if (!gaId || isBot() || hasDoNotTrack()) {
    return null;
  }
  
  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        id="google-analytics-script"
      />
      <Script
        id="google-analytics-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Set default consent state first
            gtag('consent', 'default', {
              'analytics_storage': 'denied'
            });
            
            // Initialize with privacy-first settings
            gtag('config', '${gaId}', {
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false,
              send_page_view: false, // We'll handle this after consent
              debug_mode: ${process.env.NODE_ENV === 'development'}
            });
            
            // Set up consent state based on stored preference
            const consent = localStorage.getItem('ga-consent');
            if (consent === 'granted') {
              gtag('consent', 'update', {
                'analytics_storage': 'granted'
              });
              // Send initial page view after consent is granted
              gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href
              });
            }
          `
        }}
      />
    </>
  );
}

/**
 * Hook for managing GA consent
 */
export function useAnalyticsConsent() {
  const grantConsent = () => {
    analyticsStorage.setConsent(true);
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
      
      // Send initial page view after consent is granted
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href
      });
    }
  };
  
  const denyConsent = () => {
    analyticsStorage.setConsent(false);
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      });
    }
  };
  
  const hasConsent = (): boolean => {
    return analyticsStorage.hasConsent();
  };
  
  const getConsentStatus = (): 'granted' | 'denied' | null => {
    return analyticsStorage.getConsent();
  };
  
  return {
    grantConsent,
    denyConsent,
    hasConsent,
    getConsentStatus
  };
}