import { useEffect } from 'react';

export const useAnalytics = (pageName) => {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
  }, [pageName]);
};

export default useAnalytics;
