#!/usr/bin/env node

/**
 * SISTER SITE AUTOPILOT - SELFISHINC.ORG
 * Creates sister landing page and hooks domain
 * Connects to main elevateforhumanity.org ecosystem
 */

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🌐 SISTER SITE AUTOPILOT - SELFISHINC.ORG');
console.log('==========================================');
console.log('🎯 Creating sister landing page with domain hookup\n');

// Sister site configuration
const SISTER_CONFIG = {
  domain: 'selfishinc.org',
  mainSite: 'elevateforhumanity.org',
  theme: 'corporate-blue',
  focus: 'business-development',
  redirects: true
};

// 1. CREATE SISTER LANDING PAGE
function createSisterLandingPage() {
  console.log('🏗️ Creating selfishinc.org landing page...\n');
  
  const sisterLandingPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selfish Inc | Business Development & Professional Training</title>
    <meta name="description" content="Transform your business with professional development programs. Leadership training, business strategy, and workforce development solutions.">
    
    <!-- Domain Verification -->
    <meta name="domain-verification" content="selfishinc-org-verified">
    
    <!-- SEO -->
    <link rel="canonical" href="https://www.selfishinc.org/">
    <meta property="og:title" content="Selfish Inc | Business Development & Professional Training">
    <meta property="og:description" content="Transform your business with professional development programs">
    <meta property="og:url" content="https://www.selfishinc.org">
    <meta property="og:type" content="website">
    <meta property="og:image" content="https://www.selfishinc.org/assets/og-image.jpg">
    
    <!-- Styles -->
    <link href="https://cdn.tailwindcss.com/3.3.0/tailwind.min.css" rel="stylesheet">
    <style>
        .hero-gradient { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-8px); box-shadow: 0 25px 50px rgba(0,0,0,0.15); }
        .rotating-banner { animation: slideIn 0.8s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        .pulse-cta { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <nav class="bg-white shadow-lg sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="/" class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold text-lg">S</span>
                        </div>
                        <div>
                            <span class="font-bold text-xl text-gray-900">Selfish Inc</span>
                            <div class="text-xs text-gray-500">Business Development</div>
                        </div>
                    </a>
                </div>
                <div class="hidden md:flex items-center space-x-6">
                    <a href="#programs" class="text-gray-700 hover:text-blue-600 font-medium">Programs</a>
                    <a href="#about" class="text-gray-700 hover:text-blue-600 font-medium">About</a>
                    <a href="#contact" class="text-gray-700 hover:text-blue-600 font-medium">Contact</a>
                    <a href="https://elevateforhumanity.org" class="text-gray-700 hover:text-blue-600 font-medium">Training Portal</a>
                    <a href="#apply" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium pulse-cta">Get Started</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Rotating Banner -->
    <div id="rotatingBanner" class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 text-center rotating-banner">
        <div class="max-w-7xl mx-auto px-4">
            <span id="bannerText" class="font-medium">🚀 Transform Your Business • Professional Development Programs • Leadership Training</span>
        </div>
    </div>

    <!-- Hero Section -->
    <section class="hero-gradient text-white py-20 lg:py-32">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                    <h1 class="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                        Transform Your <span class="text-yellow-400">Business</span>
                    </h1>
                    <p class="text-xl mb-8 text-blue-100 leading-relaxed">
                        Professional development programs designed to elevate your team, boost productivity, and drive business growth through strategic workforce development.
                    </p>
                    <div class="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
                        <a href="#programs" class="block sm:inline-block bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all transform hover:scale-105">
                            Explore Programs
                        </a>
                        <a href="https://elevateforhumanity.org/apply" class="block sm:inline-block border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-all">
                            Start Training
                        </a>
                    </div>
                    
                    <!-- Trust Indicators -->
                    <div class="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                            <div class="text-2xl font-bold text-yellow-400">500+</div>
                            <div class="text-sm text-blue-200">Companies Served</div>
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-yellow-400">95%</div>
                            <div class="text-sm text-blue-200">Success Rate</div>
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-yellow-400">24/7</div>
                            <div class="text-sm text-blue-200">Support</div>
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-yellow-400">$2M+</div>
                            <div class="text-sm text-blue-200">ROI Generated</div>
                        </div>
                    </div>
                </div>
                
                <!-- Video Section -->
                <div class="relative">
                    <div class="bg-white rounded-2xl p-8 shadow-2xl">
                        <h3 class="text-2xl font-bold text-gray-900 mb-4">See Results in Action</h3>
                        <div class="aspect-video bg-gray-900 rounded-lg mb-4 relative overflow-hidden">
                            <video id="heroVideo" class="w-full h-full object-cover" controls poster="/assets/video-poster.jpg">
                                <source src="/assets/business-transformation.mp4" type="video/mp4">
                                <source src="/assets/business-transformation.webm" type="video/webm">
                                Your browser does not support the video tag.
                            </video>
                            <div class="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center" id="videoOverlay">
                                <button onclick="playVideo()" class="bg-white bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 transition-all">
                                    <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8 5v10l8-5-8-5z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <p class="text-gray-600 text-sm">Watch how we transformed ABC Corp's productivity by 40% in 90 days</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Programs Section -->
    <section id="programs" class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold text-gray-900 mb-4">Business Development Programs</h2>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">Comprehensive training solutions designed to drive measurable business results</p>
            </div>
            
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Leadership Development -->
                <div class="card-hover bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div class="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                        <div class="absolute inset-0 bg-black bg-opacity-20"></div>
                        <div class="absolute bottom-4 left-4 text-white">
                            <div class="text-2xl font-bold">👑</div>
                        </div>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-2">Leadership Development</h3>
                        <p class="text-gray-600 mb-4">Transform managers into leaders with strategic thinking, team building, and decision-making skills.</p>
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-2xl font-bold text-blue-600">$4,500</span>
                            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">ROI: 300%</span>
                        </div>
                        <a href="https://elevateforhumanity.org/apply?program=leadership" class="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                            Enroll Team
                        </a>
                    </div>
                </div>

                <!-- Business Strategy -->
                <div class="card-hover bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div class="h-48 bg-gradient-to-br from-green-500 to-blue-600 relative">
                        <div class="absolute inset-0 bg-black bg-opacity-20"></div>
                        <div class="absolute bottom-4 left-4 text-white">
                            <div class="text-2xl font-bold">📊</div>
                        </div>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-2">Business Strategy</h3>
                        <p class="text-gray-600 mb-4">Data-driven strategic planning, market analysis, and competitive positioning for growth.</p>
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-2xl font-bold text-blue-600">$6,500</span>
                            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">ROI: 450%</span>
                        </div>
                        <a href="https://elevateforhumanity.org/apply?program=strategy" class="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                            Enroll Team
                        </a>
                    </div>
                </div>

                <!-- Digital Transformation -->
                <div class="card-hover bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div class="h-48 bg-gradient-to-br from-purple-500 to-pink-600 relative">
                        <div class="absolute inset-0 bg-black bg-opacity-20"></div>
                        <div class="absolute bottom-4 left-4 text-white">
                            <div class="text-2xl font-bold">🚀</div>
                        </div>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-2">Digital Transformation</h3>
                        <p class="text-gray-600 mb-4">Modernize operations with technology integration, automation, and digital workflows.</p>
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-2xl font-bold text-blue-600">$8,500</span>
                            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">ROI: 600%</span>
                        </div>
                        <a href="https://elevateforhumanity.org/apply?program=digital" class="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                            Enroll Team
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
            <p class="text-xl mb-8 text-blue-100">Join 500+ companies that have accelerated growth with our programs</p>
            <div class="space-x-4">
                <a href="https://elevateforhumanity.org/apply" class="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all inline-block">
                    Start Your Transformation
                </a>
                <a href="#contact" class="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-all inline-block">
                    Schedule Consultation
                </a>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid md:grid-cols-4 gap-8">
                <div>
                    <div class="flex items-center space-x-3 mb-4">
                        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold text-lg">S</span>
                        </div>
                        <span class="font-bold text-xl">Selfish Inc</span>
                    </div>
                    <p class="text-gray-400">Transforming businesses through strategic workforce development and professional training.</p>
                </div>
                <div>
                    <h3 class="font-semibold mb-4">Programs</h3>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="#programs" class="hover:text-white">Leadership Development</a></li>
                        <li><a href="#programs" class="hover:text-white">Business Strategy</a></li>
                        <li><a href="#programs" class="hover:text-white">Digital Transformation</a></li>
                        <li><a href="https://elevateforhumanity.org/programs" class="hover:text-white">All Training Programs</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-semibold mb-4">Company</h3>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="#about" class="hover:text-white">About Us</a></li>
                        <li><a href="#contact" class="hover:text-white">Contact</a></li>
                        <li><a href="https://elevateforhumanity.org" class="hover:text-white">Training Portal</a></li>
                        <li><a href="https://elevateforhumanity.org/student-portal" class="hover:text-white">Student Portal</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-semibold mb-4">Connect</h3>
                    <p class="text-gray-400 mb-2">📧 info@selfishinc.org</p>
                    <p class="text-gray-400 mb-2">📞 (555) 123-4567</p>
                    <p class="text-gray-400">🏢 Indianapolis, IN</p>
                </div>
            </div>
            <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; ${new Date().getFullYear()} Selfish Inc. All rights reserved. | Sister site of <a href="https://elevateforhumanity.org" class="text-blue-400 hover:text-blue-300">Elevate for Humanity</a></p>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script>
        // Rotating banner messages
        const bannerMessages = [
            "🚀 Transform Your Business • Professional Development Programs • Leadership Training",
            "📊 500+ Companies Transformed • 95% Success Rate • Proven ROI",
            "💼 Leadership Development • Business Strategy • Digital Transformation",
            "🎯 Custom Training Solutions • Expert Instructors • Measurable Results"
        ];
        
        let currentBanner = 0;
        
        function rotateBanner() {
            const bannerText = document.getElementById('bannerText');
            bannerText.style.opacity = '0';
            
            setTimeout(() => {
                currentBanner = (currentBanner + 1) % bannerMessages.length;
                bannerText.textContent = bannerMessages[currentBanner];
                bannerText.style.opacity = '1';
            }, 300);
        }
        
        // Rotate banner every 4 seconds
        setInterval(rotateBanner, 4000);
        
        // Video functionality
        function playVideo() {
            const video = document.getElementById('heroVideo');
            const overlay = document.getElementById('videoOverlay');
            
            video.play();
            overlay.style.display = 'none';
            
            // Track video play
            trackEvent('video_played', 'hero_video');
        }
        
        // Analytics tracking
        function trackEvent(event, details) {
            console.log('Event:', event, 'Details:', details);
            // Send to analytics service
        }
        
        // Track page view
        trackEvent('page_view', 'selfishinc_landing');
        
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    </script>
</body>
</html>`;

  fs.writeFileSync('selfishinc-landing.html', sisterLandingPage);
  console.log('✅ Created: selfishinc-landing.html');
}

// 2. CREATE DOMAIN CONFIGURATION
function createDomainConfig() {
  console.log('🌐 Setting up domain configuration...\n');
  
  const domainConfig = `# SISTER SITE DOMAIN CONFIGURATION

## Domain Setup for selfishinc.org

### DNS Configuration
Add these DNS records to selfishinc.org:

\`\`\`
Type: CNAME
Name: www
Value: elevateforhumanity.org

Type: A
Name: @
Value: [Your hosting IP]

Type: TXT
Name: @
Value: "v=spf1 include:_spf.google.com ~all"
\`\`\`

### Netlify/Vercel Setup
1. Add custom domain: selfishinc.org
2. Add www.selfishinc.org
3. Enable SSL certificate
4. Set up redirects

### Cloudflare Setup (Recommended)
1. Add selfishinc.org to Cloudflare
2. Point DNS to main hosting
3. Enable SSL/TLS encryption
4. Set up page rules for redirects

## Redirect Configuration

### Main Site Redirects
\`\`\`
# _redirects file
/programs/* https://elevateforhumanity.org/programs/:splat 301
/apply/* https://elevateforhumanity.org/apply/:splat 301
/student-portal/* https://elevateforhumanity.org/student-portal/:splat 301
\`\`\`

### Sister Site Specific Pages
- / → selfishinc landing page
- /business → business programs
- /leadership → leadership training
- /strategy → business strategy
- /contact → contact form

## Implementation Steps

1. **Upload Landing Page**
   - Deploy selfishinc-landing.html as index.html
   - Ensure all assets are accessible

2. **Configure Domain**
   - Point selfishinc.org DNS to hosting
   - Set up SSL certificate
   - Test domain resolution

3. **Set Up Redirects**
   - Configure redirects to main site
   - Test all redirect paths
   - Ensure proper tracking

4. **Test Everything**
   - Verify site loads on selfishinc.org
   - Test all links and redirects
   - Check mobile responsiveness
   - Verify analytics tracking

## Monitoring
- Set up uptime monitoring
- Track conversion rates
- Monitor redirect performance
- Check SEO rankings`;

  fs.writeFileSync('domain-configuration.md', domainConfig);
  console.log('✅ Created: domain-configuration.md');
}

// 3. CREATE NETLIFY CONFIGURATION
function createNetlifyConfig() {
  console.log('⚙️ Creating Netlify configuration...\n');
  
  const netlifyConfig = `# Netlify configuration for sister site
[build]
  publish = "."
  command = "echo 'Sister site deployed'"

# Custom domain configuration
[[redirects]]
  from = "https://selfishinc.org/*"
  to = "https://www.selfishinc.org/:splat"
  status = 301
  force = true

# Program redirects to main site
[[redirects]]
  from = "/programs/*"
  to = "https://elevateforhumanity.org/programs/:splat"
  status = 301

[[redirects]]
  from = "/apply"
  to = "https://elevateforhumanity.org/apply?source=selfishinc"
  status = 301

[[redirects]]
  from = "/student-portal"
  to = "https://elevateforhumanity.org/student-portal"
  status = 301

# Headers for sister site
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"`;

  fs.writeFileSync('netlify-sister.toml', netlifyConfig);
  console.log('✅ Created: netlify-sister.toml');
}

// 4. MAIN FUNCTION
function createSisterSite() {
  console.log('🎯 Creating sister site for selfishinc.org...\n');
  
  createSisterLandingPage();
  createDomainConfig();
  createNetlifyConfig();
  
  console.log('\n🎉 SISTER SITE COMPLETE!');
  console.log('\n📁 Generated files:');
  console.log('   🌐 selfishinc-landing.html - Sister site landing page');
  console.log('   📋 domain-configuration.md - DNS and domain setup');
  console.log('   ⚙️ netlify-sister.toml - Netlify configuration');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Deploy selfishinc-landing.html to hosting');
  console.log('2. Configure DNS for selfishinc.org');
  console.log('3. Set up SSL certificate');
  console.log('4. Test domain and redirects');
  
  console.log('\n✨ Features:');
  console.log('   🎬 Video integration ready');
  console.log('   🔄 Rotating banners');
  console.log('   💼 Business-focused design');
  console.log('   🔗 Connected to main ecosystem');
  console.log('   📱 Mobile responsive');
  console.log('   🎯 Conversion optimized');
  
  console.log('\n🌐 Sister site will drive traffic to main training portal!');
}

// Run the sister site creator
createSisterSite();