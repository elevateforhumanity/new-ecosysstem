import { useEffect } from 'react';
import { trackPageView } from '../utils/analytics';

export const useAnalytics = (pageName) => {
  useEffect(() => {
    trackPageView(window.location.pathname, pageName);
  }, [pageName]);
};

export default useAnalytics;
