import React from 'react';
import { Helmet } from 'react-helmet-async';

export const SEO = ({
  title = 'Elevate for Humanity',
  description = 'Empowering communities through technology and innovation',
  keywords = 'elevate, humanity, technology, innovation',
  image = '/og-image.jpg',
  url = 'https://elevateforhumanity.com',
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
};

export default SEO;
