/**
 * Tool Registry - Defines all actions the AI employee can take
 * 
 * Each tool has:
 * - description: What it does
 * - parameters: Required/optional params with types
 * - requiresApproval: Whether human approval is needed
 * - riskLevel: low, medium, high (for audit logging)
 * - category: Type of action (crm, payment, email, file, affiliate)
 */

export const TOOL_REGISTRY = {
  // ===== CRM & Lead Management =====
  createLead: {
    description: "Create or update a lead in the CRM system",
    category: "crm",
    riskLevel: "low",
    requiresApproval: false,
    parameters: {
      email: { type: "string", required: true, description: "Lead email address" },
      name: { type: "string", required: false, description: "Lead full name" },
      source: { type: "string", required: false, description: "Lead source (email, website, referral)" },
      notes: { type: "string", required: false, description: "Additional notes about the lead" },
    },
    examples: [
      {
        input: "New inquiry from john@example.com about Leadership program",
        output: {
          email: "john@example.com",
          name: "John",
          source: "email",
          notes: "Interested in Leadership program"
        }
      }
    ]
  },

  updateLead: {
    description: "Update lead status or information",
    category: "crm",
    riskLevel: "low",
    requiresApproval: false,
    parameters: {
      leadId: { type: "string", required: true, description: "Lead UUID" },
      status: { type: "enum", required: false, enum: ["new", "contacted", "qualified", "enrolled", "lost"], description: "New lead status" },
      notes: { type: "string", required: false, description: "Additional notes" },
    },
    examples: [
      {
        input: "Mark lead as contacted",
        output: {
          leadId: "uuid-here",
          status: "contacted"
        }
      }
    ]
  },

  scheduleTask: {
    description: "Schedule a follow-up task for a lead",
    category: "crm",
    riskLevel: "low",
    requiresApproval: false,
    parameters: {
      leadId: { type: "string", required: true, description: "Lead UUID" },
      followupDate: { type: "string", required: true, description: "ISO date string for follow-up" },
      action: { type: "string", required: true, description: "Action to take (send_email, make_call, etc.)" },
      notes: { type: "string", required: false, description: "Task notes" },
    },
    examples: [
      {
        input: "Follow up with lead next week",
        output: {
          leadId: "uuid-here",
          followupDate: "2024-01-15T10:00:00Z",
          action: "send_email",
          notes: "Check if ready to enroll"
        }
      }
    ]
  },

  // ===== Email & Communication =====
  sendFollowupEmail: {
    description: "Send a templated follow-up email",
    category: "email",
    riskLevel: "low",
    requiresApproval: false,
    parameters: {
      to: { type: "string", required: true, description: "Recipient email address" },
      template: { type: "enum", required: true, enum: ["enrollment_inquiry", "payment_question", "general", "welcome", "reminder"], description: "Email template to use" },
      vars: { type: "object", required: false, description: "Template variables (name, programName, etc.)" },
      subject: { type: "string", required: false, description: "Custom subject line (overrides template)" },
    },
    examples: [
      {
        input: "Send enrollment inquiry email to john@example.com",
        output: {
          to: "john@example.com",
          template: "enrollment_inquiry",
          vars: {
            name: "John",
            programName: "Leadership Development"
          }
        }
      }
    ]
  },

  // ===== Payments & Enrollment =====
  makeCheckout: {
    description: "Create a Stripe checkout link for enrollment or donation",
    category: "payment",
    riskLevel: "medium",
    requiresApproval: false,
    parameters: {
      type: { type: "enum", required: true, enum: ["enrollment", "donation"], description: "Checkout type" },
      amount_cents: { type: "number", required: false, description: "Amount in cents (for donations)" },
      programId: { type: "string", required: false, description: "Program UUID (for enrollments)" },
      email: { type: "string", required: true, description: "Customer email" },
      name: { type: "string", required: false, description: "Customer name" },
      meta: { type: "object", required: false, description: "Additional metadata" },
    },
    examples: [
      {
        input: "Create enrollment checkout for Tax Prep program",
        output: {
          type: "enrollment",
          programId: "uuid-here",
          email: "john@example.com",
          name: "John Doe",
          meta: {
            source: "email_inquiry"
          }
        }
      },
      {
        input: "Create $50 donation checkout",
        output: {
          type: "donation",
          amount_cents: 5000,
          email: "donor@example.com",
          name: "Jane Smith"
        }
      }
    ]
  },

  enrollStudent: {
    description: "Enroll a student in a program after payment",
    category: "enrollment",
    riskLevel: "high",
    requiresApproval: true,
    parameters: {
      studentId: { type: "string", required: true, description: "Student user UUID" },
      programId: { type: "string", required: true, description: "Program UUID" },
      paymentId: { type: "string", required: true, description: "Stripe payment intent ID" },
    },
    examples: [
      {
        input: "Enroll student after successful payment",
        output: {
          studentId: "uuid-here",
          programId: "uuid-here",
          paymentId: "pi_xxx"
        }
      }
    ]
  },

  // ===== File Management =====
  uploadIntakeDoc: {
    description: "Upload intake documents (W-2, ID, etc.) to R2 storage",
    category: "file",
    riskLevel: "high",
    requiresApproval: true,
    parameters: {
      owner_email: { type: "string", required: true, description: "Document owner email" },
      purpose: { type: "string", required: true, description: "Document purpose (intake, w2, id, etc.)" },
      files: { type: "array", required: true, description: "Array of file objects with name, content_b64, mime" },
    },
    examples: [
      {
        input: "Upload W-2 document from email attachment",
        output: {
          owner_email: "student@example.com",
          purpose: "w2",
          files: [{
            name: "w2_2023.pdf",
            content_b64: "base64-encoded-content",
            mime: "application/pdf"
          }]
        }
      }
    ]
  },

  // ===== Affiliate Management =====
  createAffiliate: {
    description: "Set up a new affiliate account",
    category: "affiliate",
    riskLevel: "medium",
    requiresApproval: true,
    parameters: {
      email: { type: "string", required: true, description: "Affiliate email" },
      name: { type: "string", required: true, description: "Affiliate name" },
      commission_rate: { type: "number", required: false, description: "Commission rate (0.10 = 10%)" },
      tier: { type: "enum", required: false, enum: ["bronze", "silver", "gold", "platinum"], description: "Affiliate tier" },
    },
    examples: [
      {
        input: "Create affiliate account for Jane",
        output: {
          email: "jane@example.com",
          name: "Jane Smith",
          tier: "bronze",
          commission_rate: 0.10
        }
      }
    ]
  },

  // ===== Reporting & Analytics =====
  getStats: {
    description: "Retrieve platform statistics and metrics",
    category: "reporting",
    riskLevel: "low",
    requiresApproval: false,
    parameters: {
      metric: { type: "enum", required: true, enum: ["enrollments", "revenue", "affiliates", "leads"], description: "Metric to retrieve" },
      startDate: { type: "string", required: false, description: "Start date (ISO format)" },
      endDate: { type: "string", required: false, description: "End date (ISO format)" },
    },
    examples: [
      {
        input: "Get enrollment stats for last month",
        output: {
          metric: "enrollments",
          startDate: "2024-01-01",
          endDate: "2024-01-31"
        }
      }
    ]
  },

  // ===== Internal Actions =====
  logAgentEvent: {
    description: "Log AI agent activity for audit trail",
    category: "internal",
    riskLevel: "low",
    requiresApproval: false,
    parameters: {
      source: { type: "string", required: true, description: "Event source (email, manual, cron)" },
      from: { type: "string", required: false, description: "Originator (email address, user ID)" },
      subject: { type: "string", required: false, description: "Event subject/title" },
      plan: { type: "object", required: true, description: "Planned actions" },
      result: { type: "object", required: false, description: "Execution results" },
      metadata: { type: "object", required: false, description: "Additional metadata" },
    },
    examples: [
      {
        input: "Log email processing event",
        output: {
          source: "email",
          from: "john@example.com",
          subject: "Enrollment inquiry",
          plan: { action: "createLead", params: {} },
          result: { success: true }
        }
      }
    ]
  },

  // ===== System Management =====
  createCloudflareToken: {
    description: "Create Cloudflare API token with deployment permissions",
    category: "system",
    riskLevel: "high",
    requiresApproval: true,
    parameters: {
      accountId: { type: "string", required: true, description: "Cloudflare account ID" },
      existingToken: { type: "string", required: true, description: "Current API token with token creation permission" },
      tokenName: { type: "string", required: false, description: "Name for the new token" },
    },
    examples: [
      {
        input: "Create deployment token for Workers",
        output: {
          accountId: "6ba1d2a52a3fa230972960db307ac7c0",
          existingToken: "current_token_here",
          tokenName: "EFH Deployment Token"
        }
      }
    ]
  },
};

/**
 * Get tool by name
 */
export function getTool(name) {
  return TOOL_REGISTRY[name] || null;
}

/**
 * Get all tools in a category
 */
export function getToolsByCategory(category) {
  return Object.entries(TOOL_REGISTRY)
    .filter(([_, tool]) => tool.category === category)
    .reduce((acc, [name, tool]) => {
      acc[name] = tool;
      return acc;
    }, {});
}

/**
 * Get all tools by risk level
 */
export function getToolsByRiskLevel(riskLevel) {
  return Object.entries(TOOL_REGISTRY)
    .filter(([_, tool]) => tool.riskLevel === riskLevel)
    .reduce((acc, [name, tool]) => {
      acc[name] = tool;
      return acc;
    }, {});
}

/**
 * Get tools that require approval
 */
export function getApprovalRequiredTools() {
  return Object.entries(TOOL_REGISTRY)
    .filter(([_, tool]) => tool.requiresApproval)
    .reduce((acc, [name, tool]) => {
      acc[name] = tool;
      return acc;
    }, {});
}

/**
 * Validate tool parameters
 */
export function validateToolParams(toolName, params) {
  const tool = getTool(toolName);
  if (!tool) {
    return { valid: false, errors: [`Unknown tool: ${toolName}`] };
  }

  const errors = [];

  // Check required parameters
  for (const [paramName, paramDef] of Object.entries(tool.parameters)) {
    if (paramDef.required && !(paramName in params)) {
      errors.push(`Missing required parameter: ${paramName}`);
    }

    // Type checking
    if (paramName in params) {
      const value = params[paramName];
      
      switch (paramDef.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`Parameter ${paramName} must be a string`);
          }
          break;
        case 'number':
          if (typeof value !== 'number') {
            errors.push(`Parameter ${paramName} must be a number`);
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`Parameter ${paramName} must be a boolean`);
          }
          break;
        case 'object':
          if (typeof value !== 'object' || value === null) {
            errors.push(`Parameter ${paramName} must be an object`);
          }
          break;
        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`Parameter ${paramName} must be an array`);
          }
          break;
        case 'enum':
          if (!paramDef.enum.includes(value)) {
            errors.push(`Parameter ${paramName} must be one of: ${paramDef.enum.join(', ')}`);
          }
          break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate tool documentation
 */
export function generateToolDocs() {
  const categories = {};
  
  for (const [name, tool] of Object.entries(TOOL_REGISTRY)) {
    if (!categories[tool.category]) {
      categories[tool.category] = [];
    }
    categories[tool.category].push({ name, ...tool });
  }

  let docs = '# AI Employee Tool Registry\n\n';
  docs += 'This document lists all actions the AI employee can perform.\n\n';

  for (const [category, tools] of Object.entries(categories)) {
    docs += `## ${category.toUpperCase()}\n\n`;
    
    for (const tool of tools) {
      docs += `### ${tool.name}\n\n`;
      docs += `**Description:** ${tool.description}\n\n`;
      docs += `**Risk Level:** ${tool.riskLevel}\n\n`;
      docs += `**Requires Approval:** ${tool.requiresApproval ? 'Yes' : 'No'}\n\n`;
      
      docs += '**Parameters:**\n\n';
      for (const [paramName, paramDef] of Object.entries(tool.parameters)) {
        const required = paramDef.required ? '(required)' : '(optional)';
        docs += `- \`${paramName}\` ${required}: ${paramDef.description}\n`;
        if (paramDef.enum) {
          docs += `  - Options: ${paramDef.enum.join(', ')}\n`;
        }
      }
      docs += '\n';
      
      if (tool.examples && tool.examples.length > 0) {
        docs += '**Examples:**\n\n';
        for (const example of tool.examples) {
          docs += `*${example.input}*\n\n`;
          docs += '```json\n';
          docs += JSON.stringify(example.output, null, 2);
          docs += '\n```\n\n';
        }
      }
      
      docs += '---\n\n';
    }
  }

  return docs;
}

/**
 * Get tool statistics
 */
export function getToolStats() {
  const stats = {
    total: Object.keys(TOOL_REGISTRY).length,
    byCategory: {},
    byRiskLevel: {},
    requiresApproval: 0,
  };

  for (const tool of Object.values(TOOL_REGISTRY)) {
    // By category
    stats.byCategory[tool.category] = (stats.byCategory[tool.category] || 0) + 1;
    
    // By risk level
    stats.byRiskLevel[tool.riskLevel] = (stats.byRiskLevel[tool.riskLevel] || 0) + 1;
    
    // Requires approval
    if (tool.requiresApproval) {
      stats.requiresApproval++;
    }
  }

  return stats;
}
