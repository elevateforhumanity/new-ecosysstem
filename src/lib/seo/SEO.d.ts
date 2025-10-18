declare module '../lib/seo/SEO' {
  import { FC } from 'react';
  
  interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
  }
  
  const SEO: FC<SEOProps>;
  export default SEO;
}
