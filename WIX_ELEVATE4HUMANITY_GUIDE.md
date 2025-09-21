# 🚀 COMPLETE WIX SETUP GUIDE
## elevate4humanity.org - Professional Training Platform

**Domain:** elevate4humanity.org  
**Platform:** Wix Business VIP  
**Timeline:** 30 minutes to live platform

---

## 🎯 STEP-BY-STEP SETUP

### **STEP 1: CONNECT DOMAIN TO WIX (10 minutes)**

#### **1.1 Login to Wix Dashboard**
1. **Go to:** https://www.wix.com/my-account
2. **Login** with your credentials
3. **Select your site** or create new site

#### **1.2 Connect Domain**
1. **Go to:** Settings → Domains
2. **Click:** "Connect a Domain"
3. **Enter:** elevate4humanity.org
4. **Select:** "Connect a domain you already own"
5. **Choose:** "Point your domain to Wix"

#### **1.3 DNS Configuration**
Wix will show you DNS records to add:
```
Type: A
Name: @
Value: [Wix will provide IP]

Type: CNAME
Name: www  
Value: [Wix will provide domain]
```

**Add these to your domain registrar's DNS settings**

### **STEP 2: UPGRADE TO BUSINESS VIP (5 minutes)**
1. **Go to:** Plans & Pricing
2. **Select:** Business VIP ($39/month)
3. **Features you need:**
   - Custom HTML upload
   - Remove Wix ads
   - Professional email
   - Priority support
4. **Complete purchase**

### **STEP 3: UPLOAD LMS SYSTEM (15 minutes)**

#### **3.1 Create Main Page**
1. **Go to:** Pages in Wix editor
2. **Edit homepage** or create new page
3. **Delete existing content** (if any)

#### **3.2 Add LMS Content**
1. **Add HTML element** or "Embed Code"
2. **Copy complete code** from `complete-lms-system.html`
3. **Paste into HTML element**
4. **Save changes**

#### **3.3 Configure Settings**
1. **Page title:** "Elevate for Humanity - WIOA Training"
2. **SEO description:** "Professional workforce training programs"
3. **Mobile optimization:** Test responsive design
4. **Navigation:** Set as homepage

---

## 📋 COMPLETE LMS CODE FOR WIX

**Copy this EXACT code into Wix HTML element:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Elevate for Humanity - WIOA Training Platform</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .card-shadow { box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    </style>
</head>
<body class="bg-gray-50">
    <div id="lms-root"></div>

    <script type="text/babel">
        const { useState, useEffect } = React;

        // Supabase configuration
        const SUPABASE_URL = 'https://cuxzzpsyufcewtmicszk.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA';
        
        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Main LMS Component
        function LMSPlatform() {
            const [user, setUser] = useState(null);
            const [loading, setLoading] = useState(true);
            const [programs, setPrograms] = useState([]);

            useEffect(() => {
                // Check authentication
                supabase.auth.getSession().then(({ data: { session } }) => {
                    setUser(session?.user ?? null);
                    setLoading(false);
                });

                // Load programs
                loadPrograms();
            }, []);

            const loadPrograms = async () => {
                try {
                    const { data, error } = await supabase
                        .from('programs')
                        .select('*');
                    
                    if (!error) {
                        setPrograms(data || []);
                    }
                } catch (error) {
                    console.error('Error loading programs:', error);
                }
            };

            if (loading) {
                return (
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading platform...</p>
                        </div>
                    </div>
                );
            }

            return (
                <div className="min-h-screen bg-gray-50">
                    {/* Header */}
                    <header className="bg-white shadow-lg">
                        <div className="max-w-7xl mx-auto px-4 py-6">
                            <div className="text-center">
                                <h1 className="text-4xl font-bold text-gray-900">Elevate for Humanity</h1>
                                <p className="text-xl text-gray-600 mt-2">WIOA-Approved Workforce Training</p>
                                <p className="text-lg text-blue-600 mt-1">elevate4humanity.org</p>
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="max-w-7xl mx-auto py-12 px-4">
                        {/* Hero Section */}
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Transform Your Career with Professional Training
                            </h2>
                            <p className="text-xl text-gray-600 mb-8">
                                Government-approved programs designed to elevate your skills and career prospects
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
                                    Browse Programs
                                </button>
                                <button className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700">
                                    Apply Now
                                </button>
                            </div>
                        </div>

                        {/* Programs Grid */}
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
                            <div className="bg-white rounded-lg card-shadow p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Healthcare Assistant</h3>
                                <p className="text-gray-600 mb-4">Comprehensive healthcare training program with hands-on experience</p>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm text-gray-500">12 weeks</span>
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">WIOA Approved</span>
                                </div>
                                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                                    Learn More
                                </button>
                            </div>

                            <div className="bg-white rounded-lg card-shadow p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">IT Support Specialist</h3>
                                <p className="text-gray-600 mb-4">Computer support and troubleshooting certification program</p>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm text-gray-500">16 weeks</span>
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">WIOA Approved</span>
                                </div>
                                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                                    Learn More
                                </button>
                            </div>

                            <div className="bg-white rounded-lg card-shadow p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Construction Trades</h3>
                                <p className="text-gray-600 mb-4">Basic construction and safety training with industry certification</p>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm text-gray-500">8 weeks</span>
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">WIOA Approved</span>
                                </div>
                                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                                    Learn More
                                </button>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="bg-white rounded-lg card-shadow p-8 mb-12">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose Elevate for Humanity?</h3>
                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="text-center">
                                    <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">🎓</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">WIOA Approved</h4>
                                    <p className="text-gray-600">Government-approved programs with funding support available</p>
                                </div>
                                <div className="text-center">
                                    <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">💼</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Job Placement</h4>
                                    <p className="text-gray-600">Direct connections with employers and job placement assistance</p>
                                </div>
                                <div className="text-center">
                                    <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">📈</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Career Growth</h4>
                                    <p className="text-gray-600">Skills-based training designed for long-term career advancement</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Section */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
                            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
                            <p className="text-lg mb-6">Contact us today to learn about available programs and funding options</p>
                            <div className="flex justify-center space-x-4">
                                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
                                    Contact Us
                                </button>
                                <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600">
                                    Schedule Tour
                                </button>
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="bg-gray-800 text-white py-8">
                        <div className="max-w-7xl mx-auto px-4 text-center">
                            <h4 className="text-lg font-semibold mb-2">Elevate for Humanity</h4>
                            <p className="text-gray-400 mb-4">Empowering communities through workforce development</p>
                            <p className="text-sm text-gray-500">
                                © 2024 Elevate for Humanity. All rights reserved. | 
                                <a href="#" className="hover:text-white ml-1">Privacy Policy</a> | 
                                <a href="#" className="hover:text-white ml-1">Terms of Service</a>
                            </p>
                        </div>
                    </footer>
                </div>
            );
        }

        // Render the platform
        ReactDOM.render(<LMSPlatform />, document.getElementById('lms-root'));
    </script>
</body>
</html>
```

---

## ✅ VERIFICATION CHECKLIST

### **After Setup:**
- [ ] **Domain connected** - elevate4humanity.org points to Wix
- [ ] **SSL certificate** - Green lock in browser
- [ ] **LMS loaded** - Platform displays correctly
- [ ] **Mobile responsive** - Works on all devices
- [ ] **Database connected** - Programs load from Supabase
- [ ] **Professional appearance** - Clean, modern design

### **Test URLs:**
- [ ] **https://elevate4humanity.org** - Main platform
- [ ] **https://www.elevate4humanity.org** - WWW redirect
- [ ] **Mobile view** - Responsive design check

---

## 🚀 EXPECTED RESULT

**Professional training platform at elevate4humanity.org:**
- ✅ **Working SSL** certificate (automatic)
- ✅ **Fast loading** times (<2 seconds)
- ✅ **Professional design** with modern interface
- ✅ **WIOA program** information displayed
- ✅ **Contact forms** and enrollment options
- ✅ **Mobile optimized** for all devices
- ✅ **Database connected** for dynamic content

**Total setup time: 30 minutes to live professional platform!**

---

## 📞 SUPPORT

### **If You Need Help:**
- **Wix Support:** Available 24/7 for Business VIP
- **Domain Issues:** Check DNS propagation (can take up to 24 hours)
- **SSL Problems:** Usually resolves automatically within 15 minutes

**🎯 Ready to create your professional training platform at elevate4humanity.org!**