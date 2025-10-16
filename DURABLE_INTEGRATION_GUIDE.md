# 🔗 Durable Website Integration Guide

## Overview

**Main Website**: www.elevateforhumanity.org (Durable)  
**LMS Platform**: lms.elevateforhumanity.org (This React App)  
**API Backend**: api.elevateforhumanity.org (Render)

---

## 🎯 Integration Options

### Option 1: Subdomain Links (Recommended)
Simple buttons/links from Durable to your LMS

### Option 2: Embedded Widgets
Embed course catalog, login form, etc. directly in Durable pages

### Option 3: Popup/Modal
Open LMS features in a modal overlay on Durable site

---

## 📋 Step-by-Step Setup

### Step 1: Configure DNS for Subdomains

In your domain registrar (where you bought elevateforhumanity.org):

```
Type    Name    Value                                   TTL
CNAME   lms     elevateforhumanity.pages.dev           Auto
CNAME   api     elevateforhumanity.onrender.com        Auto
```

### Step 2: Configure Cloudflare Pages Custom Domain

1. Go to Cloudflare Pages dashboard
2. Select your project: `elevateforhumanity`
3. Go to "Custom domains"
4. Add: `lms.elevateforhumanity.org`
5. Cloudflare will verify and issue SSL certificate

### Step 3: Configure Render Custom Domain

1. Go to Render dashboard
2. Select your service
3. Go to "Settings" → "Custom Domain"
4. Add: `api.elevateforhumanity.org`
5. Update DNS as instructed

---

## 🔗 Simple Links (Easiest)

### Add to Your Durable Site

```html
<!-- In your Durable site header/navigation -->
<nav>
  <a href="https://www.elevateforhumanity.org">Home</a>
  <a href="https://lms.elevateforhumanity.org">Learning Platform</a>
  <a href="https://lms.elevateforhumanity.org/courses">Courses</a>
  <a href="https://lms.elevateforhumanity.org/partners">Partners</a>
  <a href="https://lms.elevateforhumanity.org/donate">Donate</a>
</nav>

<!-- Call-to-Action Buttons -->
<section class="hero">
  <h1>Transform Your Future</h1>
  <a href="https://lms.elevateforhumanity.org/get-started" class="btn-primary">
    Get Started
  </a>
  <a href="https://lms.elevateforhumanity.org/courses" class="btn-secondary">
    Browse Courses
  </a>
</section>
```

---

## 📦 Embedded Widgets

### Widget 1: Course Catalog

Add this to any Durable page to show courses:

```html
<!-- Add to your Durable page -->
<div id="efh-courses"></div>
<script src="https://lms.elevateforhumanity.org/embed/courses.js"></script>
<script>
  EFH.Courses.init({
    container: '#efh-courses',
    limit: 6,
    showEnroll: true
  });
</script>
```

### Widget 2: Login Form

```html
<!-- Quick login widget -->
<div id="efh-login"></div>
<script src="https://lms.elevateforhumanity.org/embed/login.js"></script>
<script>
  EFH.Login.init({
    container: '#efh-login',
    redirectUrl: 'https://lms.elevateforhumanity.org/dashboard'
  });
</script>
```

### Widget 3: Enrollment Button

```html
<!-- Single course enrollment -->
<button 
  class="efh-enroll-btn" 
  data-course-id="course-123"
  data-course-title="Web Development Bootcamp">
  Enroll Now
</button>
<script src="https://lms.elevateforhumanity.org/embed/enroll.js"></script>
```

### Widget 4: Progress Tracker

```html
<!-- Show user's learning progress -->
<div id="efh-progress"></div>
<script src="https://lms.elevateforhumanity.org/embed/progress.js"></script>
<script>
  EFH.Progress.init({
    container: '#efh-progress',
    userId: 'current-user-id'
  });
</script>
```

### Widget 5: Donation Form

```html
<!-- Embedded donation form -->
<div id="efh-donate"></div>
<script src="https://lms.elevateforhumanity.org/embed/donate.js"></script>
<script>
  EFH.Donate.init({
    container: '#efh-donate',
    amounts: [25, 50, 100, 250],
    recurring: true
  });
</script>
```

---

## 🎨 Styled Buttons for Durable

### CSS for Your Durable Site

```css
/* Add to your Durable site's custom CSS */
.efh-btn {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.efh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.efh-btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.efh-widget {
  border-radius: 12px;
  padding: 24px;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### HTML Examples

```html
<!-- Hero Section -->
<section class="hero">
  <h1>Elevate Your Career</h1>
  <p>World-class workforce development programs</p>
  <div class="cta-buttons">
    <a href="https://lms.elevateforhumanity.org/courses" class="efh-btn">
      Explore Courses
    </a>
    <a href="https://lms.elevateforhumanity.org/get-started" class="efh-btn-secondary">
      Get Started Free
    </a>
  </div>
</section>

<!-- Featured Courses Section -->
<section class="courses">
  <h2>Featured Programs</h2>
  <div id="efh-courses-widget"></div>
  <a href="https://lms.elevateforhumanity.org/courses" class="view-all">
    View All Courses →
  </a>
</section>

<!-- Partner Section -->
<section class="partners">
  <h2>Become a Partner</h2>
  <p>Join our ecosystem of organizations making a difference</p>
  <a href="https://lms.elevateforhumanity.org/partners" class="efh-btn">
    Partner With Us
  </a>
</section>
```

---

## 🚀 Modal/Popup Integration

### Open LMS in Modal

```html
<!-- Add to Durable site -->
<button onclick="openLMSModal('/courses')">Browse Courses</button>

<div id="lms-modal" class="modal">
  <div class="modal-content">
    <span class="close" onclick="closeLMSModal()">&times;</span>
    <iframe id="lms-frame" src="" frameborder="0"></iframe>
  </div>
</div>

<style>
.modal {
  display: none;
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.7);
}

.modal-content {
  position: relative;
  margin: 2% auto;
  width: 90%;
  height: 90%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.modal-content iframe {
  width: 100%;
  height: 100%;
}

.close {
  position: absolute;
  right: 20px;
  top: 10px;
  font-size: 35px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  z-index: 10000;
}
</style>

<script>
function openLMSModal(path) {
  document.getElementById('lms-modal').style.display = 'block';
  document.getElementById('lms-frame').src = 'https://lms.elevateforhumanity.org' + path;
}

function closeLMSModal() {
  document.getElementById('lms-modal').style.display = 'none';
  document.getElementById('lms-frame').src = '';
}

// Close on outside click
window.onclick = function(event) {
  const modal = document.getElementById('lms-modal');
  if (event.target == modal) {
    closeLMSModal();
  }
}
</script>
```

---

## 📱 Mobile-Friendly Integration

### Responsive Navigation

```html
<!-- Mobile-friendly nav for Durable -->
<nav class="mobile-nav">
  <button class="menu-toggle">☰</button>
  <div class="menu-items">
    <a href="https://www.elevateforhumanity.org">Home</a>
    <a href="https://lms.elevateforhumanity.org">Learning</a>
    <a href="https://lms.elevateforhumanity.org/courses">Courses</a>
    <a href="https://lms.elevateforhumanity.org/partners">Partners</a>
    <a href="https://lms.elevateforhumanity.org/donate">Donate</a>
  </div>
</nav>

<style>
@media (max-width: 768px) {
  .menu-items {
    display: none;
    flex-direction: column;
  }
  
  .menu-items.active {
    display: flex;
  }
  
  .menu-toggle {
    display: block;
  }
}
</style>
```

---

## 🔐 Single Sign-On (SSO) Integration

### Share Authentication Between Sites

```javascript
// On Durable site - check if user is logged in to LMS
<script>
async function checkLMSAuth() {
  try {
    const response = await fetch('https://api.elevateforhumanity.org/api/auth/check', {
      credentials: 'include'
    });
    const data = await response.json();
    
    if (data.authenticated) {
      // User is logged in
      document.getElementById('login-btn').style.display = 'none';
      document.getElementById('dashboard-btn').style.display = 'block';
      document.getElementById('user-name').textContent = data.user.name;
    }
  } catch (error) {
    console.log('Not authenticated');
  }
}

checkLMSAuth();
</script>
```

---

## 📊 Analytics Integration

### Track Conversions from Durable to LMS

```html
<!-- Add to Durable site -->
<script>
// Track when users click LMS links
document.querySelectorAll('a[href*="lms.elevateforhumanity.org"]').forEach(link => {
  link.addEventListener('click', function(e) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'lms_click', {
        'event_category': 'engagement',
        'event_label': this.href
      });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', 'ViewContent', {
        content_name: 'LMS Platform'
      });
    }
  });
});
</script>
```

---

## 🎯 Specific Page Integrations

### Homepage Integration

```html
<!-- On Durable homepage -->
<section class="hero">
  <h1>Transform Lives Through Education</h1>
  <p>Access world-class workforce development programs</p>
  <a href="https://lms.elevateforhumanity.org/get-started" class="efh-btn">
    Start Learning Today
  </a>
</section>

<!-- Stats Section -->
<section class="stats">
  <div class="stat">
    <h3 id="student-count">Loading...</h3>
    <p>Active Students</p>
  </div>
  <div class="stat">
    <h3 id="course-count">Loading...</h3>
    <p>Courses Available</p>
  </div>
  <div class="stat">
    <h3 id="certificate-count">Loading...</h3>
    <p>Certificates Issued</p>
  </div>
</section>

<script>
// Fetch live stats from LMS API
fetch('https://api.elevateforhumanity.org/api/stats')
  .then(r => r.json())
  .then(data => {
    document.getElementById('student-count').textContent = data.students;
    document.getElementById('course-count').textContent = data.courses;
    document.getElementById('certificate-count').textContent = data.certificates;
  });
</script>
```

### About Page Integration

```html
<!-- On Durable about page -->
<section class="impact">
  <h2>Our Impact</h2>
  <div id="efh-impact-widget"></div>
  <a href="https://lms.elevateforhumanity.org/impact" class="efh-btn">
    View Full Impact Report
  </a>
</section>
```

### Contact Page Integration

```html
<!-- On Durable contact page -->
<section class="contact-options">
  <div class="option">
    <h3>General Inquiries</h3>
    <p>info@elevateforhumanity.org</p>
  </div>
  <div class="option">
    <h3>Learning Platform Support</h3>
    <a href="https://lms.elevateforhumanity.org/support" class="efh-btn">
      Get Help
    </a>
  </div>
  <div class="option">
    <h3>Partner With Us</h3>
    <a href="https://lms.elevateforhumanity.org/partners" class="efh-btn">
      Become a Partner
    </a>
  </div>
</section>
```

---

## 🛠️ Implementation Checklist

### Phase 1: Basic Links (Day 1)
- [ ] Add navigation links to LMS
- [ ] Add CTA buttons on homepage
- [ ] Add "Get Started" button
- [ ] Add "Browse Courses" link
- [ ] Test all links work

### Phase 2: Styled Integration (Day 2)
- [ ] Add custom CSS for buttons
- [ ] Style navigation consistently
- [ ] Add hover effects
- [ ] Test responsive design
- [ ] Add loading states

### Phase 3: Embedded Widgets (Day 3-4)
- [ ] Create embed scripts (I'll do this)
- [ ] Add course catalog widget
- [ ] Add login widget
- [ ] Add donation widget
- [ ] Test all widgets

### Phase 4: Advanced Features (Day 5+)
- [ ] Set up custom domains
- [ ] Configure SSL certificates
- [ ] Add SSO integration
- [ ] Add analytics tracking
- [ ] Add modal popups

---

## 📝 Quick Copy-Paste Code

### Minimal Integration (5 minutes)

```html
<!-- Add this to your Durable site header -->
<nav>
  <a href="https://lms.elevateforhumanity.org">Learning Platform</a>
  <a href="https://lms.elevateforhumanity.org/courses">Courses</a>
  <a href="https://lms.elevateforhumanity.org/partners">Partners</a>
</nav>

<!-- Add this to your homepage -->
<a href="https://lms.elevateforhumanity.org/get-started" 
   style="display:inline-block;padding:12px 24px;background:#667eea;color:white;text-decoration:none;border-radius:8px;font-weight:600;">
  Start Learning Today
</a>
```

---

## 🚀 Next Steps

1. **Choose Integration Method**: Links, Widgets, or Modal?
2. **Set Up DNS**: Configure subdomains
3. **Add Links**: Start with simple navigation
4. **Test**: Verify everything works
5. **Enhance**: Add widgets and advanced features

---

**Ready to implement? Let me know which integration method you want to start with!**
