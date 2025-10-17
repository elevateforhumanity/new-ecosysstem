/**
 * Google Analytics 4 Integration
 * Handles page views, events, and conversions
 */

// Initialize Google Analytics
export const initGA = () => {
  const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

  if (!gaId) {
    console.log('[Analytics] Google Analytics ID not set');
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', gaId, {
    send_page_view: false, // We'll send manually
    anonymize_ip: true, // GDPR compliance
  });

  console.log('[Analytics] Google Analytics initialized');
};

// Track page view
export const trackPageView = (path, title) => {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', 'page_view', {
    page_path: path || window.location.pathname,
    page_title: title || document.title,
    page_location: window.location.href,
  });
};

// Track custom event
export const trackEvent = (eventName, params = {}) => {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', eventName, params);
};

// Track enrollment
export const trackEnrollment = (courseId, courseName) => {
  trackEvent('enrollment', {
    course_id: courseId,
    course_name: courseName,
    value: 0, // Free courses
  });
};

// Track course completion
export const trackCourseCompletion = (courseId, courseName) => {
  trackEvent('course_completion', {
    course_id: courseId,
    course_name: courseName,
  });
};

// Track certificate earned
export const trackCertificate = (courseId, courseName) => {
  trackEvent('certificate_earned', {
    course_id: courseId,
    course_name: courseName,
  });
};

// Track form submission
export const trackFormSubmission = (formName) => {
  trackEvent('form_submission', {
    form_name: formName,
  });
};

// Track button click
export const trackButtonClick = (buttonName, location) => {
  trackEvent('button_click', {
    button_name: buttonName,
    location: location,
  });
};

// Track search
export const trackSearch = (searchTerm, resultsCount) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
};

// Track video play
export const trackVideoPlay = (videoTitle, videoId) => {
  trackEvent('video_play', {
    video_title: videoTitle,
    video_id: videoId,
  });
};

// Track download
export const trackDownload = (fileName, fileType) => {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType,
  });
};

// Track outbound link
export const trackOutboundLink = (url, linkText) => {
  trackEvent('outbound_link', {
    link_url: url,
    link_text: linkText,
  });
};

// Track error
export const trackError = (errorMessage, errorLocation) => {
  trackEvent('error', {
    error_message: errorMessage,
    error_location: errorLocation,
  });
};

export default {
  initGA,
  trackPageView,
  trackEvent,
  trackEnrollment,
  trackCourseCompletion,
  trackCertificate,
  trackFormSubmission,
  trackButtonClick,
  trackSearch,
  trackVideoPlay,
  trackDownload,
  trackOutboundLink,
  trackError,
};
