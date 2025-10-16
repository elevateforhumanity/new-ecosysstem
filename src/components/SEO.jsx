import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title = 'Elevate for Humanity - Workforce Development & Learning Platform',
  description = 'Transform your career with our comprehensive workforce development programs. Access courses, certifications, and career support.',
  keywords = 'workforce development, online learning, career training, professional development, LMS',
  image = 'https://lms.elevateforhumanity.org/og-image.jpg',
  url = 'https://lms.elevateforhumanity.org',
  type = 'website'
}) {
  const fullTitle = title.includes('Elevate for Humanity') ? title : `${title} | Elevate for Humanity`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Elevate for Humanity" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Elevate for Humanity" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Schema.org markup */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "name": "Elevate for Humanity",
          "description": description,
          "url": url,
          "logo": "https://lms.elevateforhumanity.org/logo.png",
          "sameAs": [
            "https://www.facebook.com/elevateforhumanity",
            "https://twitter.com/elevate4humanity",
            "https://www.linkedin.com/company/elevate-for-humanity"
          ]
        })}
      </script>
    </Helmet>
  );
}
