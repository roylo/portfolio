/**
 * Custom event definitions for portfolio analytics
 */

import { trackEvent, trackConversion } from './gtag';

// Event Categories
export const EVENT_CATEGORIES = {
  PORTFOLIO: 'Portfolio',
  CHATBOT: 'Chatbot',
  ENGAGEMENT: 'Engagement',
  CONVERSION: 'Conversion',
  NAVIGATION: 'Navigation',
  PERFORMANCE: 'Performance'
} as const;

// Portfolio Interaction Events
export const portfolioEvents = {
  /**
   * Track project page views
   */
  viewProject: (projectSlug: string, projectTitle: string) => {
    trackEvent('view_project', {
      event_category: EVENT_CATEGORIES.PORTFOLIO,
      event_label: projectSlug,
      custom_parameters: {
        project_title: projectTitle,
        page_type: 'project_detail'
      }
    });
  },

  /**
   * Track project gallery interactions
   */
  viewProjectGallery: (projectSlug: string, imageIndex: number) => {
    trackEvent('view_project_gallery', {
      event_category: EVENT_CATEGORIES.PORTFOLIO,
      event_label: `${projectSlug}_image_${imageIndex}`,
      value: imageIndex,
      custom_parameters: {
        project_slug: projectSlug,
        image_index: imageIndex
      }
    });
  },

  /**
   * Track external project link clicks
   */
  clickProjectLink: (projectSlug: string, linkType: 'live_demo' | 'github' | 'case_study') => {
    trackEvent('click_project_link', {
      event_category: EVENT_CATEGORIES.PORTFOLIO,
      event_label: `${projectSlug}_${linkType}`,
      custom_parameters: {
        project_slug: projectSlug,
        link_type: linkType,
        outbound: true
      }
    });
  },

  /**
   * Track blog post views
   */
  viewBlogPost: (postSlug: string, postTitle: string) => {
    trackEvent('view_blog_post', {
      event_category: EVENT_CATEGORIES.PORTFOLIO,
      event_label: postSlug,
      custom_parameters: {
        post_title: postTitle,
        page_type: 'blog_post'
      }
    });
  },

  /**
   * Track fragment (artwork) views
   */
  viewFragment: (fragmentId: string) => {
    trackEvent('view_fragment', {
      event_category: EVENT_CATEGORIES.PORTFOLIO,
      event_label: fragmentId,
      custom_parameters: {
        fragment_id: fragmentId,
        page_type: 'fragment'
      }
    });
  }
};

// Engagement Events
export const engagementEvents = {
  /**
   * Track resume downloads
   */
  downloadResume: () => {
    trackConversion('resume_download');
    trackEvent('download_resume', {
      event_category: EVENT_CATEGORIES.CONVERSION,
      event_label: 'resume_pdf',
      custom_parameters: {
        file_type: 'pdf',
        conversion_type: 'download'
      }
    });
  },

  /**
   * Track contact form submissions
   */
  submitContactForm: (formData: { name: string; email: string; message: string }) => {
    trackConversion('contact_form_submission');
    trackEvent('submit_contact_form', {
      event_category: EVENT_CATEGORIES.CONVERSION,
      event_label: 'contact_form',
      custom_parameters: {
        form_type: 'contact',
        conversion_type: 'form_submission',
        message_length: formData.message.length,
        has_company_email: formData.email.includes('@') && !formData.email.includes('gmail.com') && !formData.email.includes('yahoo.com')
      }
    });
  },

  /**
   * Track social media clicks
   */
  clickSocialLink: (platform: 'linkedin' | 'github' | 'twitter' | 'email') => {
    trackEvent('click_social_link', {
      event_category: EVENT_CATEGORIES.ENGAGEMENT,
      event_label: platform,
      custom_parameters: {
        social_platform: platform,
        outbound: true
      }
    });
  },

  /**
   * Track search usage
   */
  searchContent: (query: string, resultsCount: number) => {
    trackEvent('search_content', {
      event_category: EVENT_CATEGORIES.ENGAGEMENT,
      event_label: 'site_search',
      value: resultsCount,
      custom_parameters: {
        search_term: query,
        results_count: resultsCount
      }
    });
  },

  /**
   * Track scroll depth for key pages
   */
  trackScrollDepth: (page: string, depth: 25 | 50 | 75 | 100) => {
    trackEvent('scroll_depth', {
      event_category: EVENT_CATEGORIES.ENGAGEMENT,
      event_label: `${page}_${depth}`,
      value: depth,
      custom_parameters: {
        page_type: page,
        scroll_depth: depth
      }
    });
  }
};

// Navigation Events
export const navigationEvents = {
  /**
   * Track navigation menu usage
   */
  clickNavigation: (section: string, fromPage: string) => {
    trackEvent('click_navigation', {
      event_category: EVENT_CATEGORIES.NAVIGATION,
      event_label: `${fromPage}_to_${section}`,
      custom_parameters: {
        from_page: fromPage,
        to_section: section,
        navigation_type: 'main_nav'
      }
    });
  },

  /**
   * Track 404 errors
   */
  track404: (requestedPath: string, referrer?: string) => {
    trackEvent('404_error', {
      event_category: EVENT_CATEGORIES.NAVIGATION,
      event_label: requestedPath,
      custom_parameters: {
        requested_path: requestedPath,
        referrer: referrer || 'direct',
        error_type: '404'
      }
    });
  }
};

// Performance Events
export const performanceEvents = {
  /**
   * Track Core Web Vitals
   */
  trackWebVital: (name: string, value: number, id: string) => {
    trackEvent('web_vital', {
      event_category: EVENT_CATEGORIES.PERFORMANCE,
      event_label: name,
      value: Math.round(value),
      custom_parameters: {
        metric_name: name,
        metric_value: value,
        metric_id: id
      }
    });
  },

  /**
   * Track page load performance
   */
  trackPageLoad: (page: string, loadTime: number) => {
    trackEvent('page_load_time', {
      event_category: EVENT_CATEGORIES.PERFORMANCE,
      event_label: page,
      value: Math.round(loadTime),
      custom_parameters: {
        page_type: page,
        load_time_ms: loadTime
      }
    });
  },

  /**
   * Track errors
   */
  trackError: (errorType: string, errorMessage: string, page: string) => {
    trackEvent('javascript_error', {
      event_category: EVENT_CATEGORIES.PERFORMANCE,
      event_label: `${page}_${errorType}`,
      custom_parameters: {
        error_type: errorType,
        error_message: errorMessage.substring(0, 150), // Limit length
        page_type: page
      }
    });
  }
};