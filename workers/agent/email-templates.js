/**
 * Email Templates for AI Employee
 * 
 * All templates support variable substitution using {{variable}} syntax
 * and conditional blocks using {{#if variable}}...{{/if}}
 */

export const EMAIL_TEMPLATES = {
  // ===== Lead Nurturing =====
  enrollment_inquiry: {
    subject: "Welcome to Elevate for Humanity - {{programName}} Program",
    body: `Hi {{name}},

Thank you for your interest in Elevate for Humanity's {{programName}} program!

We're excited to help you advance your career and achieve your goals. Our {{programName}} program is designed to provide you with practical skills and industry-recognized credentials.

**Program Highlights:**
✅ Expert-led instruction
✅ Flexible online learning
✅ Affordable tuition with payment plans
✅ Job placement assistance
✅ Certificate of completion

**Next Steps:**
{{#if checkoutUrl}}
Ready to enroll? Complete your registration here:
{{checkoutUrl}}
{{else}}
I'd love to schedule a quick call to answer any questions and help you get started. What time works best for you this week?
{{/if}}

{{#if hasQuestions}}
You asked: "{{question}}"

{{answer}}
{{/if}}

Feel free to reply to this email with any questions. I'm here to help!

Best regards,
The Elevate for Humanity Team

P.S. Our programs fill up quickly, so don't wait to secure your spot!`,
  },

  payment_question: {
    subject: "Re: Payment Options for {{programName}}",
    body: `Hi {{name}},

Thanks for reaching out about payment options for our {{programName}} program.

**Tuition:** ${{tuition}}

**Payment Options:**
1. **Pay in Full** - Get {{discount}}% discount
2. **Payment Plan** - {{installments}} monthly payments of ${{monthlyAmount}}
3. **Financial Aid** - Apply for scholarships and grants

{{#if checkoutUrl}}
You can review all payment options and enroll here:
{{checkoutUrl}}
{{/if}}

**What's Included:**
- All course materials and resources
- Lifetime access to course content
- Certificate of completion
- Job placement assistance
- Community support

Have more questions? Just reply to this email!

Best regards,
The EFH Team`,
  },

  general: {
    subject: "Re: {{subject}}",
    body: `Hi {{name}},

Thanks for reaching out to Elevate for Humanity!

{{#if answer}}
{{answer}}
{{else}}
I received your message and I'm looking into this for you. I'll get back to you within 24 hours with a detailed response.
{{/if}}

{{#if nextSteps}}
**Next Steps:**
{{nextSteps}}
{{/if}}

{{#if resources}}
**Helpful Resources:**
{{#each resources}}
- {{this}}
{{/each}}
{{/if}}

Is there anything else I can help you with?

Best regards,
The Elevate for Humanity Team`,
  },

  // ===== Enrollment & Onboarding =====
  welcome: {
    subject: "🎉 Welcome to {{programName}}!",
    body: `Hi {{name}},

Congratulations! You're officially enrolled in {{programName}}.

**What Happens Next:**

1. **Access Your Course** (within 24 hours)
   You'll receive login credentials to access your course materials.

2. **Join the Community**
   Connect with fellow students and instructors in our private forum.

3. **Start Learning**
   Begin with Module 1 and work at your own pace.

**Your Program Details:**
- Program: {{programName}}
- Start Date: {{startDate}}
- Duration: {{duration}}
- Support: Available 7 days a week

{{#if paymentPlan}}
**Payment Schedule:**
Your next payment of ${{nextPayment}} is due on {{nextPaymentDate}}.
{{/if}}

**Need Help?**
- Email: support@elevateforhumanity.org
- Community Forum: [link]
- Office Hours: Tuesdays & Thursdays, 6-8 PM EST

We're thrilled to have you with us. Let's get started!

Best regards,
The EFH Team`,
  },

  enrollment_checkout: {
    subject: "Complete Your Enrollment - {{programName}}",
    body: `Hi {{name}},

Great news! Your enrollment link for {{programName}} is ready.

**Complete Your Enrollment:**
{{checkoutUrl}}

**What You'll Get:**
✅ {{duration}} of expert instruction
✅ All course materials included
✅ Certificate of completion
✅ Job placement assistance
✅ Lifetime access to course updates

**Payment Options Available:**
- Pay in full (save {{discount}}%)
- Monthly payment plan
- Financial aid options

{{#if expiresAt}}
⏰ This link expires on {{expiresAt}}, so don't wait!
{{/if}}

Questions? Just reply to this email.

Best regards,
The EFH Team`,
  },

  // ===== Reminders & Follow-ups =====
  reminder: {
    subject: "Reminder: {{reminderType}} - {{programName}}",
    body: `Hi {{name}},

This is a friendly reminder about {{reminderType}}.

{{#if paymentDue}}
**Payment Due:**
Amount: ${{amount}}
Due Date: {{dueDate}}
Pay Now: {{paymentUrl}}

{{#if lateFee}}
⚠️ A late fee of ${{lateFee}} will be applied after {{dueDate}}.
{{/if}}
{{/if}}

{{#if enrollmentIncomplete}}
**Complete Your Enrollment:**
You started the enrollment process for {{programName}} but haven't finished yet.

Complete your enrollment here:
{{checkoutUrl}}

This program starts on {{startDate}}, and spots are filling up fast!
{{/if}}

{{#if courseProgress}}
**Course Progress:**
You're {{progressPercent}}% through {{programName}}. Keep up the great work!

Next up: {{nextModule}}
{{/if}}

Need help? Just reply to this email.

Best regards,
The EFH Team`,
  },

  followup_no_response: {
    subject: "Following up - {{programName}}",
    body: `Hi {{name}},

I wanted to follow up on your interest in our {{programName}} program.

I know life gets busy, so I wanted to make sure you didn't miss this opportunity.

**Quick Recap:**
- Program: {{programName}}
- Duration: {{duration}}
- Next Start Date: {{startDate}}
- Tuition: ${{tuition}} (payment plans available)

{{#if checkoutUrl}}
Ready to enroll? Here's your link:
{{checkoutUrl}}
{{/if}}

**Still have questions?**
Just reply to this email or schedule a quick call: {{calendarUrl}}

If you're no longer interested, no problem! Just let me know and I'll stop following up.

Best regards,
The EFH Team`,
  },

  // ===== Affiliate Program =====
  affiliate_welcome: {
    subject: "Welcome to the EFH Affiliate Program!",
    body: `Hi {{name}},

Welcome to the Elevate for Humanity Affiliate Program!

**Your Affiliate Details:**
- Tier: {{tier}}
- Commission Rate: {{commissionRate}}%
- Affiliate ID: {{affiliateId}}

**Your Unique Referral Link:**
{{referralUrl}}

**How It Works:**
1. Share your referral link with your network
2. When someone enrolls using your link, you earn {{commissionRate}}%
3. Get paid monthly via direct deposit or PayPal

**Marketing Resources:**
- Email templates: {{resourcesUrl}}/email-templates
- Social media graphics: {{resourcesUrl}}/graphics
- Program brochures: {{resourcesUrl}}/brochures

**Commission Structure:**
- Bronze ({{bronzeRate}}%): 0-10 referrals
- Silver ({{silverRate}}%): 11-25 referrals
- Gold ({{goldRate}}%): 26-50 referrals
- Platinum ({{platinumRate}}%): 51+ referrals

**Track Your Performance:**
Login to your affiliate dashboard: {{dashboardUrl}}

Questions? Email affiliates@elevateforhumanity.org

Let's make an impact together!

Best regards,
The EFH Affiliate Team`,
  },

  affiliate_commission_earned: {
    subject: "💰 You Earned a Commission!",
    body: `Hi {{name}},

Great news! You just earned a commission.

**Commission Details:**
- Student: {{studentName}}
- Program: {{programName}}
- Enrollment Amount: ${{enrollmentAmount}}
- Your Commission: ${{commissionAmount}}

**Your Stats This Month:**
- Total Referrals: {{totalReferrals}}
- Total Commissions: ${{totalCommissions}}
- Current Tier: {{tier}}

{{#if nextTier}}
🎯 You're {{referralsToNextTier}} referrals away from {{nextTier}} tier ({{nextTierRate}}% commission)!
{{/if}}

**Payment Schedule:**
Commissions are paid on the 15th of each month for the previous month's earnings.

Keep up the great work!

Best regards,
The EFH Affiliate Team`,
  },

  // ===== Administrative =====
  document_received: {
    subject: "Document Received - {{documentType}}",
    body: `Hi {{name}},

We've received your {{documentType}} document.

**Document Details:**
- Type: {{documentType}}
- Received: {{receivedDate}}
- Status: {{status}}

{{#if approved}}
✅ Your document has been approved and added to your file.
{{else}}
⏳ Your document is being reviewed. We'll notify you within 2-3 business days.
{{/if}}

{{#if additionalDocsNeeded}}
**Additional Documents Needed:**
{{#each additionalDocs}}
- {{this}}
{{/each}}

Please upload these documents at your earliest convenience.
{{/if}}

Questions? Reply to this email.

Best regards,
The EFH Team`,
  },

  support_ticket: {
    subject: "Support Ticket #{{ticketId}} - {{subject}}",
    body: `Hi {{name}},

We've received your support request.

**Ticket Details:**
- Ticket ID: #{{ticketId}}
- Subject: {{subject}}
- Priority: {{priority}}
- Status: {{status}}

{{#if response}}
**Our Response:**
{{response}}
{{else}}
We're looking into this and will respond within {{responseTime}}.
{{/if}}

{{#if resolved}}
✅ This ticket has been marked as resolved. If you need further assistance, just reply to this email.
{{/if}}

Best regards,
The EFH Support Team`,
  },
};

/**
 * Simple template engine (Handlebars-like)
 */
export function renderTemplate(template, variables) {
  let result = template;
  
  // Replace simple variables {{name}}
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : '';
  });
  
  // Handle conditionals {{#if var}}...{{/if}}
  result = result.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, content) => {
    return variables[key] ? content : '';
  });
  
  // Handle loops {{#each array}}...{{/each}}
  result = result.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, key, content) => {
    const array = variables[key];
    if (!Array.isArray(array)) return '';
    return array.map(item => content.replace(/\{\{this\}\}/g, item)).join('\n');
  });
  
  return result.trim();
}

/**
 * Get template by name
 */
export function getTemplate(name) {
  return EMAIL_TEMPLATES[name] || null;
}

/**
 * Render email from template
 */
export function renderEmail(templateName, variables) {
  const template = getTemplate(templateName);
  if (!template) {
    throw new Error(`Template not found: ${templateName}`);
  }
  
  return {
    subject: renderTemplate(template.subject, variables),
    body: renderTemplate(template.body, variables),
  };
}

/**
 * List all available templates
 */
export function listTemplates() {
  return Object.keys(EMAIL_TEMPLATES);
}

/**
 * Get template categories
 */
export function getTemplateCategories() {
  return {
    'Lead Nurturing': ['enrollment_inquiry', 'payment_question', 'general'],
    'Enrollment & Onboarding': ['welcome', 'enrollment_checkout'],
    'Reminders & Follow-ups': ['reminder', 'followup_no_response'],
    'Affiliate Program': ['affiliate_welcome', 'affiliate_commission_earned'],
    'Administrative': ['document_received', 'support_ticket'],
  };
}
