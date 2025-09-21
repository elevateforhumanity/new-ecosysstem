# Selfish Inc Landing Page Implementation for Elevate4Humanity Wix Site

## Strategy Overview

Create a new page within the elevate4humanity.org Wix site specifically for Selfish Inc business development content, then connect www.selfishinc.org domain to redirect to this page.

## Implementation Plan

### Step 1: Create New Page in Wix
1. **Access Wix Editor** for elevate4humanity.org
2. **Add New Page**:
   - Go to Pages panel in Wix Editor
   - Click "Add Page"
   - Choose "Blank Page" template
   - Name it "Selfish Inc" or "selfishinc"
   - Set URL slug as `/selfishinc` or `/selfish-inc`

### Step 2: Page Content Structure

#### Page URL: `elevate4humanity.org/selfishinc`
#### Page Title: "Selfish Inc | Business Development & Professional Training"

### Step 3: Domain Connection Strategy

#### Option A: Domain Forwarding (Recommended)
- Set up www.selfishinc.org to redirect to `elevate4humanity.org/selfishinc`
- 301 redirect preserves SEO value
- Easiest to implement

#### Option B: Wix Multi-Domain (Premium Feature)
- Connect www.selfishinc.org as additional domain in Wix
- Point specifically to the selfishinc page
- Requires Wix Business plan or higher

## Page Content Implementation

### Selfish Inc Page Layout:

```
HEADER:
- Logo: "Selfish Inc" with "S" icon
- Tagline: "Business Development"
- Navigation: Programs | About | Services | Contact

HERO SECTION:
- Headline: "Transform Your Business with Strategic Development"
- Subheadline: "Professional training and business strategy solutions for growth-minded leaders"
- CTA: "Explore Programs" | "Schedule Consultation"

SERVICES SECTION:
- Leadership Development
- Business Strategy Consulting  
- Professional Training Programs
- Organizational Development

ABOUT SECTION:
- Company mission and values
- Founder information
- Business philosophy

CONTACT SECTION:
- Contact form
- Business information
- Social media links
```

## Wix Implementation Steps

### 1. Create the Page
```
Wix Editor → Pages → Add Page → Blank Page
Page Name: "Selfish Inc"
URL: /selfishinc
```

### 2. Add Header Section
```
Add Strip → Header
- Logo: Text element "Selfish Inc" with blue background "S" icon
- Navigation menu with: Programs, About, Services, Contact
- Background: White with shadow
```

### 3. Add Hero Section
```
Add Strip → Hero
- Background: Blue gradient (#1e3a8a to #3b82f6)
- Headline: "Transform Your Business with Strategic Development"
- Subheadline: "Professional training and business strategy solutions for growth-minded leaders"
- Two CTA buttons: "Explore Programs" and "Schedule Consultation"
```

### 4. Add Services Section
```
Add Strip → Content
- 4-column layout
- Service cards with icons and descriptions
- Hover effects for interactivity
```

### 5. Add Contact Section
```
Add Strip → Contact
- Contact form (Wix form element)
- Business information
- Social media icons
```

## Domain Connection Implementation

### Method 1: Domain Registrar Redirect (Easiest)

1. **Access Domain Registrar** for selfishinc.org
2. **Set up URL Forwarding**:
   - From: www.selfishinc.org
   - To: https://elevate4humanity.org/selfishinc
   - Type: 301 Permanent Redirect
   - Include path: No (redirect to specific page)

### Method 2: DNS CNAME (Advanced)

1. **In Domain Registrar DNS Settings**:
   ```
   Type: CNAME
   Name: www
   Value: elevate4humanity.org
   ```

2. **In Wix Settings**:
   - Add www.selfishinc.org as connected domain
   - Point to /selfishinc page specifically

### Method 3: Wix Multi-Domain Setup

1. **Wix Dashboard** → Settings → Domains
2. **Connect Domain** → "Connect a domain you already own"
3. **Enter**: www.selfishinc.org
4. **Advanced Settings** → Point to specific page: /selfishinc

## Content Ready for Copy-Paste

### Hero Section Content:
```
Transform Your Business with Strategic Development

Professional training and business strategy solutions for growth-minded leaders. We help organizations unlock their potential through targeted development programs and strategic consulting.

[Explore Programs] [Schedule Consultation]
```

### Services Section:
```
LEADERSHIP DEVELOPMENT
Build stronger leaders at every level of your organization
- Executive coaching
- Leadership assessments  
- Team development
- Succession planning

BUSINESS STRATEGY CONSULTING
Strategic planning and implementation support
- Market analysis
- Growth strategies
- Operational efficiency
- Change management

PROFESSIONAL TRAINING PROGRAMS
Customized training solutions for your team
- Skills development
- Professional certifications
- Workshop facilitation
- Online learning platforms

ORGANIZATIONAL DEVELOPMENT
Transform your company culture and processes
- Culture assessment
- Process improvement
- Performance management
- Employee engagement
```

### About Section:
```
About Selfish Inc

Selfish Inc is a business development consultancy focused on helping organizations achieve sustainable growth through strategic planning, leadership development, and professional training.

Our Philosophy:
Being "selfish" about your business development means prioritizing the growth and success of your organization and people. We believe that when businesses invest in themselves strategically, they create value for all stakeholders.

Our Approach:
- Data-driven strategies
- Customized solutions
- Measurable results
- Long-term partnerships
```

## Technical Implementation

### Wix Page Settings:
```
Page Name: Selfish Inc
URL: /selfishinc
SEO Title: Selfish Inc | Business Development & Professional Training
Meta Description: Transform your business with strategic development. Professional training and business strategy solutions for growth-minded leaders.
```

### Custom CSS for Wix:
```css
/* Add to Wix Custom CSS */
.selfishinc-hero {
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%);
    color: white;
    padding: 80px 20px;
    text-align: center;
}

.selfishinc-logo {
    background: #1e40af;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 18px;
}

.service-card {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.service-card:hover {
    transform: translateY(-5px);
}
```

## Testing Checklist

### Before Going Live:
- [ ] Page loads correctly at elevate4humanity.org/selfishinc
- [ ] All content displays properly
- [ ] Navigation works
- [ ] Contact form functions
- [ ] Mobile responsive design
- [ ] SEO settings configured

### After Domain Connection:
- [ ] www.selfishinc.org redirects to correct page
- [ ] No redirect loops
- [ ] SSL certificate works
- [ ] Page loads quickly
- [ ] Analytics tracking works

## Timeline

### Day 1: Page Creation
- Create new page in Wix
- Add basic content structure
- Configure page settings

### Day 2: Content Implementation  
- Add all content sections
- Style and format elements
- Test functionality

### Day 3: Domain Connection
- Set up domain forwarding
- Test redirect functionality
- Monitor for issues

### Day 4: Final Testing
- Comprehensive testing
- SEO verification
- Performance optimization

## Expected Results

After implementation:
- ✅ www.selfishinc.org will show dedicated business development content
- ✅ Maintains Selfish Inc branding and messaging
- ✅ Professional business-focused design
- ✅ Clear separation from mental wellness content
- ✅ SEO optimized for business development keywords

## Next Steps

1. **Access Wix Editor** for elevate4humanity.org
2. **Create new page** with URL `/selfishinc`
3. **Implement content** using our ready-to-copy sections
4. **Set up domain forwarding** from www.selfishinc.org
5. **Test and launch**

---

**Ready to create the dedicated Selfish Inc landing page within your existing Wix site!**