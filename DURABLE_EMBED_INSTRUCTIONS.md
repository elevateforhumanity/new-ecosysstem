# Durable Landing Page - Embed Instructions

## 📋 Overview
This is a complete, self-contained HTML landing page designed specifically for embedding in Durable's platform. It includes all CSS and JavaScript inline for maximum compatibility.

## 🚀 Quick Setup

### Option 1: Full Page Embed
1. Copy the entire contents of `durable-landing-embed.html`
2. In your Durable site, create a new page
3. Switch to HTML/Code view
4. Paste the complete code
5. Save and publish

### Option 2: Section Embed
If you want to embed specific sections only:

#### Hero Section Only:
```html
<!-- Copy from line 200 to 210 in the HTML file -->
<section class="hero">
    <!-- Hero content -->
</section>
```

#### Features Section Only:
```html
<!-- Copy from line 212 to 240 in the HTML file -->
<section id="features" class="features">
    <!-- Features content -->
</section>
```

## 🎨 Customization Options

### Colors
Update these CSS variables in the `<style>` section:

```css
/* Primary brand color */
--primary-color: #667eea;

/* Secondary brand color */
--secondary-color: #ff6b6b;

/* Background colors */
--bg-light: #f8fafc;
--bg-dark: #2d3748;
```

### Content
1. **Headlines**: Update the `<h1>` and `<h2>` tags
2. **Features**: Modify the feature cards content
3. **Pricing**: Update pricing plans and features
4. **Stats**: Change the numbers in `data-count` attributes

### Call-to-Action Buttons
Update the JavaScript functions:

```javascript
function selectPlan(plan) {
    // Replace with your signup URL
    window.location.href = `https://your-site.com/signup?plan=${plan}`;
}

function startBuilding() {
    // Replace with your builder URL
    window.location.href = 'https://your-site.com/builder';
}
```

## 🔧 Technical Features

### ✅ What's Included:
- **Responsive Design**: Works on all devices
- **Smooth Animations**: CSS keyframes and transitions
- **Interactive Elements**: Hover effects and click handlers
- **Auto-rotating Features**: Highlights different features every 4 seconds
- **Animated Counters**: Numbers count up when scrolled into view
- **Smooth Scrolling**: Navigation links scroll smoothly
- **SEO Optimized**: Proper meta tags and semantic HTML
- **Accessibility**: ARIA labels and keyboard navigation

### 🎯 Dynamic Features:
1. **Feature Rotation**: Auto-highlights features every 4 seconds
2. **Scroll Animations**: Elements animate as they come into view
3. **Counter Animation**: Stats count up when visible
4. **Interactive Pricing**: Click handlers for plan selection
5. **Smooth Navigation**: Anchor links scroll smoothly

## 📱 Browser Compatibility
- ✅ Chrome (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (all versions)
- ✅ Edge (all versions)
- ✅ Mobile browsers (iOS/Android)

## 🔗 Integration with Durable

### Method 1: Custom HTML Block
1. In Durable editor, add a "Custom HTML" block
2. Paste the complete HTML code
3. The page will render with all functionality

### Method 2: Page Template
1. Create a new page in Durable
2. Switch to "Code" or "HTML" view
3. Replace all content with the embed code
4. Save as template for reuse

### Method 3: Section by Section
1. Copy individual sections (hero, features, pricing)
2. Add as separate HTML blocks in Durable
3. Combine with Durable's native elements

## 🎨 Styling Notes

### Fonts
Uses system fonts for maximum compatibility:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

### Colors Used
- **Primary Blue**: `#667eea`
- **Secondary Red**: `#ff6b6b`
- **Dark Gray**: `#2d3748`
- **Light Gray**: `#f8fafc`
- **Text Gray**: `#718096`

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Performance Optimizations

1. **Inline Everything**: No external dependencies
2. **Optimized Images**: Uses emoji icons (no image files)
3. **Minimal JavaScript**: Lightweight, vanilla JS only
4. **CSS Animations**: Hardware-accelerated transforms
5. **Lazy Loading**: Animations trigger on scroll

## 📊 Analytics Integration

Add your analytics code before the closing `</body>` tag:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>

<!-- Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window,document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

## 🔧 Troubleshooting

### Common Issues:

1. **Animations not working**: Ensure JavaScript is enabled
2. **Styling broken**: Check if Durable's CSS is conflicting
3. **Buttons not clickable**: Verify JavaScript functions are included
4. **Mobile layout issues**: Test responsive breakpoints

### Solutions:

1. **CSS Conflicts**: Add `!important` to critical styles
2. **JavaScript Errors**: Check browser console for errors
3. **Layout Issues**: Wrap in container with `max-width: 100%`

## 📞 Support

If you need help customizing or implementing this landing page:

1. Check the browser console for JavaScript errors
2. Validate HTML using W3C validator
3. Test on multiple devices and browsers
4. Ensure all links and buttons have proper handlers

## 🎯 Test URLs

**Live Preview**: [https://8080--01997c51-5c00-7915-9166-f10af4ac25e6.us-east-1-01.gitpod.dev/durable-landing-embed.html](https://8080--01997c51-5c00-7915-9166-f10af4ac25e6.us-east-1-01.gitpod.dev/durable-landing-embed.html)

## 📝 File Structure
```
durable-landing-embed.html (Complete standalone file)
├── HTML Structure
├── Inline CSS (all styling)
├── Inline JavaScript (all functionality)
└── No external dependencies
```

This landing page is ready to embed directly into Durable with zero configuration required!