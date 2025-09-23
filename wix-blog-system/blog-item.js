// Blog Post Page Code (/blog/{slug})
// Place this in your Wix Editor: Page Code for the dynamic blog post page

import wixLocation from 'wix-location';
import { setMetaTags } from 'wix-seo-frontend';

$w.onReady(() => {
  try {
    // Get the current item from the dataset (bound to BlogPosts collection)
    const item = $w('#dataset1').getCurrentItem();
    
    if (!item) {
      console.error('No blog post found');
      // Redirect to blog list if post not found
      wixLocation.to('/blog');
      return;
    }

    console.log('Loading blog post:', item.title);

    // Set post title
    if ($w('#postTitle')) {
      $w('#postTitle').text = item.title || 'Untitled Post';
    }

    // Set cover image
    if (item.coverImage && $w('#postImage')) {
      $w('#postImage').src = item.coverImage;
      $w('#postImage').show();
    } else if ($w('#postImage')) {
      $w('#postImage').hide();
    }

    // Set post content
    if ($w('#postContent')) {
      $w('#postContent').html = item.content || '<p>Content not available.</p>';
    }

    // Set post metadata
    if ($w('#postMeta')) {
      const publishDate = new Date(item.publishedAt || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const author = item.author || 'EFH Team';
      $w('#postMeta').text = `By ${author} • ${publishDate}`;
    }

    // Set tags
    if ($w('#postTags') && item.tags && item.tags.length > 0) {
      $w('#postTags').text = `Tags: ${item.tags.join(', ')}`;
      $w('#postTags').show();
    } else if ($w('#postTags')) {
      $w('#postTags').hide();
    }

    // Set up social sharing and SEO meta tags
    const url = `https://elevateforhumanity.org/blog/${item.slug}`;
    const ogImage = item.coverImage || 'https://elevateforhumanity.org/images/efh-og-default.jpg';
    const description = item.excerpt || 
      (item.content ? item.content.replace(/<[^>]+>/g, '').slice(0, 160) : 
       'Read the latest insights from Elevate for Humanity on workforce development and career training.');

    // Set dynamic meta tags for social sharing
    setMetaTags([
      { tag: "title", content: `${item.title} | EFH Blog` },
      { tag: "meta", name: "description", content: description },
      { tag: "meta", property: "og:title", content: item.title },
      { tag: "meta", property: "og:description", content: description },
      { tag: "meta", property: "og:image", content: ogImage },
      { tag: "meta", property: "og:url", content: url },
      { tag: "meta", property: "og:type", content: "article" },
      { tag: "meta", property: "og:site_name", content: "Elevate for Humanity" },
      { tag: "meta", name: "twitter:card", content: "summary_large_image" },
      { tag: "meta", name: "twitter:title", content: item.title },
      { tag: "meta", name: "twitter:description", content: description },
      { tag: "meta", name: "twitter:image", content: ogImage },
      { tag: "meta", property: "article:author", content: item.author || 'EFH Team' },
      { tag: "meta", property: "article:published_time", content: new Date(item.publishedAt || Date.now()).toISOString() }
    ]);

    // Set up back to blog button
    if ($w('#backToBlog')) {
      $w('#backToBlog').onClick(() => {
        wixLocation.to('/blog');
      });
    }

    // Set up social sharing buttons
    setupSocialSharing(item, url);

  } catch (error) {
    console.error('Error loading blog post:', error);
    
    // Show error and redirect
    if ($w('#errorMessage')) {
      $w('#errorMessage').text = 'Unable to load this blog post.';
      $w('#errorMessage').show();
    }
    
    setTimeout(() => {
      wixLocation.to('/blog');
    }, 3000);
  }
});

function setupSocialSharing(item, url) {
  const title = encodeURIComponent(item.title || 'Check out this post from EFH');
  const description = encodeURIComponent(item.excerpt || 'Workforce development insights from Elevate for Humanity');
  
  // Facebook share
  if ($w('#shareFacebook')) {
    $w('#shareFacebook').onClick(() => {
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      wixLocation.to(fbUrl, '_blank');
    });
  }
  
  // LinkedIn share
  if ($w('#shareLinkedIn')) {
    $w('#shareLinkedIn').onClick(() => {
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      wixLocation.to(linkedInUrl, '_blank');
    });
  }
  
  // Twitter share
  if ($w('#shareTwitter')) {
    $w('#shareTwitter').onClick(() => {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${title}&url=${encodeURIComponent(url)}`;
      wixLocation.to(twitterUrl, '_blank');
    });
  }
  
  // Copy link
  if ($w('#copyLink')) {
    $w('#copyLink').onClick(() => {
      // Note: Wix doesn't support clipboard API directly, so we'll show the URL
      if ($w('#linkCopied')) {
        $w('#linkCopied').text = `Link: ${url}`;
        $w('#linkCopied').show();
        setTimeout(() => {
          $w('#linkCopied').hide();
        }, 5000);
      }
    });
  }
}