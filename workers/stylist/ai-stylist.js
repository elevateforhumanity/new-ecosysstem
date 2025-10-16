/**
 * AI Website Stylist Worker
 * 
 * Generates branded web pages using Workers AI and your brand theme.
 * Outputs React/Tailwind code that matches your brand identity.
 * 
 * Brand Colors:
 * - Primary: #E53935 (red)
 * - Secondary: #FF9800 (orange)
 * - Accent: #2196F3 (blue)
 * - Background: #FFFFFF (white)
 * - Text: #0D0D0D (dark)
 */

const BRAND_THEME = {
  colors: {
    primary: "#E53935",     // red
    secondary: "#FF9800",   // orange
    accent: "#2196F3",      // blue
    background: "#FFFFFF",  // white
    text: "#0D0D0D"         // dark
  },
  fonts: {
    heading: "Poppins",
    body: "Inter"
  },
  tone: "Empowering, professional, energetic, trustworthy",
  organization: "Elevate for Humanity",
  mission: "Providing accessible education and career development opportunities"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route: POST /generate - Generate a page
      if (path === '/generate' && request.method === 'POST') {
        const { pageType, description, sections } = await request.json();
        
        const page = await generatePage(env, pageType, description, sections);
        
        return new Response(JSON.stringify({
          success: true,
          page,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: POST /generate-section - Generate a single section
      if (path === '/generate-section' && request.method === 'POST') {
        const { sectionType, content } = await request.json();
        
        const section = await generateSection(env, sectionType, content);
        
        return new Response(JSON.stringify({
          success: true,
          section,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: POST /generate-asset - Generate marketing asset
      if (path === '/generate-asset' && request.method === 'POST') {
        const { assetType, content } = await request.json();
        
        const asset = await generateAsset(env, assetType, content);
        
        return new Response(JSON.stringify({
          success: true,
          asset,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: GET /theme - Get brand theme
      if (path === '/theme' && request.method === 'GET') {
        return new Response(JSON.stringify({
          success: true,
          theme: BRAND_THEME,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: GET /templates - List available templates
      if (path === '/templates' && request.method === 'GET') {
        const templates = getPageTemplates();
        
        return new Response(JSON.stringify({
          success: true,
          templates,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Health check
      if (path === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          service: 'ai-stylist',
          timestamp: new Date().toISOString(),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });

    } catch (error) {
      console.error('AI Stylist Error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

/**
 * Generate a complete page with section images and icons
 */
async function generatePage(env, pageType, description, sections = []) {
  const systemPrompt = `You are an expert web designer for ${BRAND_THEME.organization}.

BRAND IDENTITY:
- Colors: Primary ${BRAND_THEME.colors.primary} (red), Secondary ${BRAND_THEME.colors.secondary} (orange), Accent ${BRAND_THEME.colors.accent} (blue)
- Fonts: Headings ${BRAND_THEME.fonts.heading}, Body ${BRAND_THEME.fonts.body}
- Tone: ${BRAND_THEME.tone}
- Mission: ${BRAND_THEME.mission}

Generate a ${pageType} page with React/Tailwind code.

REQUIREMENTS:
- Use ONLY Tailwind CSS classes
- Use brand colors: text-red-600, bg-orange-500, text-blue-600
- Use ${BRAND_THEME.fonts.heading} for headings, ${BRAND_THEME.fonts.body} for body
- Make it responsive (mobile-first)
- Include proper semantic HTML
- Add hover effects and transitions
- Make it accessible (ARIA labels, alt text)
- Include image placeholders like {{IMG:programs}}, {{IMG:services}} where section images belong
- Include icon placeholders like {{ICON:partners}}, {{ICON:features}} for small badges

OUTPUT FORMAT (JSON):
{
  "title": "Page title",
  "html": "<section>...</section>",
  "tailwindClasses": ["text-red-600", "bg-orange-500"],
  "summary": "Brief description of the page",
  "sections": ["hero", "features", "cta"]
}

IMPORTANT: 
- Respond ONLY with valid JSON. No markdown, no code blocks.
- DO NOT include hero image markup - we will inject it automatically
- Place {{IMG:sectionname}} where card/section images should go
- Place {{ICON:name}} where small icons/badges should go`;

  const userPrompt = `Create a ${pageType} page for ${BRAND_THEME.organization}.

Description: ${description}

${sections.length > 0 ? `Include these sections: ${sections.join(', ')}` : 'Include appropriate sections for this page type.'}

Make it professional, engaging, and aligned with our mission of providing accessible education.`;

  const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  // Parse AI response
  const text = response.response || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('Failed to generate page - invalid AI response');
  }
  
  const basePage = JSON.parse(jsonMatch[0]);
  
  // Generate hero image
  const heroPrompt = `Hero banner for ${pageType} page. Brand colors: red (#E53935), orange (#FF9800), blue (#2196F3), white. Style: clean, empowering, professional, vibrant, modern education platform.`;
  const heroUrl = await generateImage(env, heroPrompt, { width: 1280, height: 560 });
  
  // Extract placeholders from HTML
  const placeholders = extractPlaceholders(basePage.html);
  const assets = {};
  
  // Generate section images
  for (const tag of placeholders.IMG) {
    const prompt = `Section banner for "${tag}" in brand colors red, orange, blue, white. Style: modern, high-contrast, minimal text, web hero/card graphic, education theme.`;
    assets[`IMG:${tag}`] = await generateImage(env, prompt, { width: 1024, height: 640 });
  }
  
  // Generate SVG icons
  for (const tag of placeholders.ICON) {
    assets[`ICON:${tag}`] = generateSvgIcon(tag);
  }
  
  // Build final HTML with hero and replaced placeholders
  let finalHtml = `<section class="relative overflow-hidden">
  <img src="${heroUrl}" alt="Hero image" class="w-full h-[480px] object-cover" />
  <div class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white px-4">
    <h1 class="text-5xl font-bold mb-2 text-center">${escapeHtml(basePage.title || pageType)}</h1>
    <p class="text-lg max-w-2xl text-center">${escapeHtml(basePage.summary || description)}</p>
  </div>
</section>
${basePage.html}`;

  // Replace image placeholders
  for (const [key, value] of Object.entries(assets)) {
    if (key.startsWith('IMG:')) {
      const tag = key.slice(4);
      const pattern = new RegExp(`\\{\\{IMG:${escapeRegExp(tag)}\\}\\}`, 'g');
      finalHtml = finalHtml.replace(
        pattern,
        `<img src="${value}" alt="${escapeHtml(tag)} image" class="w-full h-48 object-cover rounded-xl shadow" loading="lazy" />`
      );
    } else if (key.startsWith('ICON:')) {
      const tag = key.slice(5);
      const pattern = new RegExp(`\\{\\{ICON:${escapeRegExp(tag)}\\}\\}`, 'g');
      finalHtml = finalHtml.replace(pattern, value);
    }
  }
  
  return {
    title: basePage.title || pageType,
    html: finalHtml,
    tailwindClasses: basePage.tailwindClasses || [],
    summary: basePage.summary || description,
    sections: basePage.sections || [],
    assets,
    pageType,
    theme: BRAND_THEME,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a single section
 */
async function generateSection(env, sectionType, content) {
  const systemPrompt = `You are a web design AI for ${BRAND_THEME.organization}.

Generate a ${sectionType} section using React/Tailwind.

BRAND COLORS:
- Primary: ${BRAND_THEME.colors.primary} (use text-red-600, bg-red-600)
- Secondary: ${BRAND_THEME.colors.secondary} (use text-orange-500, bg-orange-500)
- Accent: ${BRAND_THEME.colors.accent} (use text-blue-600, bg-blue-600)

SECTION TYPES:
- hero: Large heading, subheading, CTA button
- features: Grid of 3-4 feature cards
- testimonials: Customer quotes with photos
- cta: Call-to-action with button
- pricing: Pricing tiers
- faq: Accordion-style FAQ
- contact: Contact form
- team: Team member cards
- stats: Statistics with numbers

OUTPUT JSON:
{
  "html": "<section>...</section>",
  "summary": "What this section does"
}

Respond ONLY with JSON.`;

  const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate a ${sectionType} section: ${content}` },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  const text = response.response || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error('Failed to generate section');
}

/**
 * Generate marketing asset (social media post, flyer, etc.)
 */
async function generateAsset(env, assetType, content) {
  const systemPrompt = `You are a graphic design AI for ${BRAND_THEME.organization}.

Generate ${assetType} content using our brand colors and style.

BRAND:
- Colors: ${BRAND_THEME.colors.primary}, ${BRAND_THEME.colors.secondary}, ${BRAND_THEME.colors.accent}
- Tone: ${BRAND_THEME.tone}

ASSET TYPES:
- social_post: Instagram/Facebook post (1080x1080)
- story: Instagram story (1080x1920)
- flyer: Event flyer (8.5x11)
- banner: Website banner (1200x400)
- email_header: Email header image (600x200)

OUTPUT JSON:
{
  "html": "<div>...</div>",
  "dimensions": "1080x1080",
  "summary": "Description of the asset",
  "copyText": "Text content for the asset"
}

Respond ONLY with JSON.`;

  const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate a ${assetType}: ${content}` },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const text = response.response || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error('Failed to generate asset');
}

/**
 * Get available page templates
 */
function getPageTemplates() {
  return {
    home: {
      name: "Home Page",
      description: "Main landing page with hero, features, and CTA",
      defaultSections: ["hero", "features", "testimonials", "cta"],
      examples: [
        "Welcoming homepage highlighting our mission and programs",
        "Homepage focused on student success stories",
        "Homepage with enrollment CTA and program showcase"
      ]
    },
    about: {
      name: "About Us",
      description: "Organization story, mission, and team",
      defaultSections: ["hero", "mission", "team", "stats"],
      examples: [
        "About page highlighting our impact and values",
        "About page with team bios and organization history",
        "About page focused on our mission and vision"
      ]
    },
    programs: {
      name: "Programs",
      description: "Course catalog and program details",
      defaultSections: ["hero", "program_grid", "benefits", "cta"],
      examples: [
        "Programs page with course cards and enrollment info",
        "Programs page highlighting career outcomes",
        "Programs page with filtering and search"
      ]
    },
    contact: {
      name: "Contact",
      description: "Contact form and information",
      defaultSections: ["hero", "contact_form", "faq"],
      examples: [
        "Contact page with form and office hours",
        "Contact page with multiple contact methods",
        "Contact page with FAQ and support info"
      ]
    },
    enroll: {
      name: "Enrollment",
      description: "Enrollment process and payment",
      defaultSections: ["hero", "steps", "pricing", "cta"],
      examples: [
        "Enrollment page with step-by-step process",
        "Enrollment page with payment plans",
        "Enrollment page with program selection"
      ]
    },
    success: {
      name: "Success Stories",
      description: "Student testimonials and outcomes",
      defaultSections: ["hero", "testimonials", "stats", "cta"],
      examples: [
        "Success stories with student quotes and photos",
        "Success stories with career outcomes",
        "Success stories with video testimonials"
      ]
    }
  };
}
