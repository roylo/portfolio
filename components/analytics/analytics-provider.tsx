'use client';

/**
 * Analytics context provider for managing analytics state and session tracking
 */

import { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { 
  trackPageView, 
  generateSessionId, 
  analyticsStorage,
  chatbotEvents,
  performanceEvents,
  navigationEvents 
} from '@/lib/analytics';

interface AnalyticsContextType {
  sessionId: string;
  isAnalyticsEnabled: boolean;
  trackPageView: (path: string, title?: string) => void;
  trackChatbotSession: {
    start: () => void;
    end: () => void;
    sendMessage: (message: string, category: string) => void;
    receiveResponse: (type: string, responseTime: number, confidence?: number) => void;
  };
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const [sessionId] = useState(() => generateSessionId());
  const [isAnalyticsEnabled, setIsAnalyticsEnabled] = useState(false);
  const [chatbotSessionActive, setChatbotSessionActive] = useState(false);
  const chatbotSessionStart = useRef<number>(0);
  const chatbotMessageCount = useRef<number>(0);
  const chatbotConversions = useRef<number>(0);
  const lastActivity = useRef<string>('session_start');
  
  // Track analytics consent status
  useEffect(() => {
    const checkConsent = () => {
      setIsAnalyticsEnabled(analyticsStorage.hasConsent());
    };
    
    checkConsent();
    
    // Check periodically for consent changes
    const interval = setInterval(checkConsent, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Track page views on route changes
  useEffect(() => {
    if (isAnalyticsEnabled) {
      const title = document.title;
      trackPageView(pathname, title);
      
      // Track navigation events
      navigationEvents.clickNavigation(
        pathname.split('/')[1] || 'home',
        sessionStorage.getItem('lastPage') || 'direct'
      );
      
      sessionStorage.setItem('lastPage', pathname);
    }
  }, [pathname, isAnalyticsEnabled]);
  
  // Track performance metrics
  useEffect(() => {
    if (!isAnalyticsEnabled) return;
    
    // Track Core Web Vitals
    // const trackWebVital = (metric: { name: string; value: number; id: string }) => {
    //   performanceEvents.trackWebVital(metric.name, metric.value, metric.id);
    // };
    
    // Track page load time
    const trackPageLoad = () => {
      const pageType = pathname.split('/')[1] || 'home';
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      if (loadTime > 0) {
        performanceEvents.trackPageLoad(pageType, loadTime);
      }
    };
    
    // Track errors
    const trackError = (event: ErrorEvent) => {
      const pageType = pathname.split('/')[1] || 'home';
      performanceEvents.trackError('javascript_error', event.message, pageType);
    };
    
    // Track unhandled promise rejections
    const trackUnhandledRejection = (event: PromiseRejectionEvent) => {
      const pageType = pathname.split('/')[1] || 'home';
      performanceEvents.trackError('unhandled_promise', String(event.reason), pageType);
    };
    
    // Set up event listeners
    window.addEventListener('error', trackError);
    window.addEventListener('unhandledrejection', trackUnhandledRejection);
    window.addEventListener('load', trackPageLoad);
    
    // Web Vitals tracking could be added here with web-vitals package
    
    return () => {
      window.removeEventListener('error', trackError);
      window.removeEventListener('unhandledrejection', trackUnhandledRejection);
      window.removeEventListener('load', trackPageLoad);
    };
  }, [isAnalyticsEnabled, pathname]);
  
  // Chatbot session management
  const chatbotTracking = useMemo(() => ({
    start: () => {
      if (!isAnalyticsEnabled || chatbotSessionActive) return;
      
      chatbotEvents.startSession(sessionId);
      setChatbotSessionActive(true);
      chatbotSessionStart.current = Date.now();
      chatbotMessageCount.current = 0;
      chatbotConversions.current = 0;
      lastActivity.current = 'session_start';
    },
    
    end: () => {
      if (!isAnalyticsEnabled || !chatbotSessionActive) return;
      
      const duration = Date.now() - chatbotSessionStart.current;
      chatbotEvents.endSession(
        sessionId,
        duration,
        chatbotMessageCount.current,
        chatbotConversions.current,
        lastActivity.current
      );
      setChatbotSessionActive(false);
    },
    
    sendMessage: (message: string, category: string) => {
      if (!isAnalyticsEnabled) return;
      
      if (!chatbotSessionActive) {
        // Access start method from within the object
        chatbotEvents.startSession(sessionId);
        setChatbotSessionActive(true);
        chatbotSessionStart.current = Date.now();
        chatbotMessageCount.current = 0;
        chatbotConversions.current = 0;
        lastActivity.current = 'session_start';
      }
      
      chatbotMessageCount.current += 1;
      chatbotEvents.sendMessage(
        sessionId,
        message.length,
        category as keyof typeof import('@/lib/analytics/chatbot-events').QUESTION_CATEGORIES,
        chatbotMessageCount.current
      );
      lastActivity.current = 'message_sent';
    },
    
    receiveResponse: (type: string, responseTime: number, confidence?: number) => {
      if (!isAnalyticsEnabled) return;
      
      chatbotEvents.receiveResponse(sessionId, type as 'text' | 'jd-analysis' | 'behavioral-question' | 'suggestion', responseTime, confidence);
      lastActivity.current = 'response_received';
      
      // Track conversions for high-value interactions
      if (type === 'jd-analysis' || type === 'behavioral-question') {
        chatbotConversions.current += 1;
      }
    }
  }), [isAnalyticsEnabled, chatbotSessionActive, sessionId]);
  
  // Clean up chatbot session on unmount or page close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (chatbotSessionActive) {
        chatbotTracking.end();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (chatbotSessionActive) {
        chatbotTracking.end();
      }
    };
  }, [chatbotSessionActive, chatbotTracking]);
  
  const contextValue: AnalyticsContextType = {
    sessionId,
    isAnalyticsEnabled,
    trackPageView: (path: string, title?: string) => {
      if (isAnalyticsEnabled) {
        trackPageView(path, title);
      }
    },
    trackChatbotSession: chatbotTracking
  };
  
  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Hook to access analytics context
 */
export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

/**
 * Hook for tracking scroll depth
 */
export function useScrollTracking(pageType: string) {
  const { isAnalyticsEnabled } = useAnalytics();
  const [trackedDepths, setTrackedDepths] = useState<Set<number>>(new Set());
  
  useEffect(() => {
    if (!isAnalyticsEnabled) return;
    
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      // Track at 25%, 50%, 75%, 100%
      const milestones = [25, 50, 75, 100];
      
      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !trackedDepths.has(milestone)) {
          import('@/lib/analytics').then(({ engagementEvents }) => {
            engagementEvents.trackScrollDepth(pageType, milestone as 25 | 50 | 75 | 100);
          });
          setTrackedDepths(prev => new Set(prev).add(milestone));
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAnalyticsEnabled, pageType, trackedDepths]);
}