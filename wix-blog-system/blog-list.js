// Blog List Page Code (/blog)
// Place this in your Wix Editor: Page Code for the blog list page

import wixData from 'wix-data';
import wixLocation from 'wix-location';

const COLL = 'BlogPosts';

$w.onReady(async () => {
  try {
    // Query published blog posts, newest first
    const items = await wixData.query(COLL)
      .eq('isPublished', true)
      .descending('publishedAt')
      .limit(1000)
      .find()
      .then(r => r.items);

    console.log(`Found ${items.length} blog posts`);

    // Populate the repeater with blog posts
    $w('#blogRepeater').data = items;
    
    $w('#blogRepeater').onItemReady(($item, item) => {
      // Set post title
      $item('#cardTitle').text = item.title || 'Untitled Post';
      
      // Set excerpt with fallback
      const excerpt = item.excerpt || 
        (item.content ? item.content.replace(/<[^>]+>/g, '').slice(0, 150) + '...' : 'Read more...');
      $item('#cardExcerpt').text = excerpt;
      
      // Set cover image if available
      if (item.coverImage) {
        $item('#cardImage').src = item.coverImage;
        $item('#cardImage').show();
      } else {
        $item('#cardImage').hide();
      }
      
      // Set up read more button
      $item('#cardLink').label = 'Read More';
      $item('#cardLink').onClick(() => {
        wixLocation.to(`/blog/${item.slug}`);
      });
      
      // Add meta information
      if ($item('#cardMeta')) {
        const publishDate = new Date(item.publishedAt || Date.now()).toLocaleDateString();
        const author = item.author || 'EFH Team';
        $item('#cardMeta').text = `${author} • ${publishDate}`;
      }
      
      // Add tags if available
      if ($item('#cardTags') && item.tags && item.tags.length > 0) {
        $item('#cardTags').text = item.tags.slice(0, 3).join(', ');
        $item('#cardTags').show();
      } else if ($item('#cardTags')) {
        $item('#cardTags').hide();
      }
    });

    // Update page title
    if ($w('#pageTitle')) {
      $w('#pageTitle').text = 'EFH Blog - Workforce Development Insights';
    }
    
    // Update page description
    if ($w('#pageDescription')) {
      $w('#pageDescription').text = 'Stay updated with the latest in workforce development, career training, and success stories from Elevate for Humanity.';
    }

  } catch (error) {
    console.error('Error loading blog posts:', error);
    
    // Show error message to user
    if ($w('#errorMessage')) {
      $w('#errorMessage').text = 'Unable to load blog posts. Please try again later.';
      $w('#errorMessage').show();
    }
  }
});