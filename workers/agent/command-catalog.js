/**
 * EFH Agent Command Catalog
 * Defines all available actions the AI agent can perform
 * Used for documentation and validation
 */

export const COMMAND_CATALOG = {
  createProgram: {
    description: "Create a new training program",
    params: {
      title: { type: "string", required: true, description: "Program title" },
      description: { type: "string", required: false, description: "Program description" },
      hours: { type: "number", required: false, description: "Duration in hours", default: 120 },
      credentials: { type: "string", required: false, description: "Credential awarded" },
      published: { type: "boolean", required: false, description: "Publish immediately", default: true },
    },
    examples: [
      "Create a new Tax Prep Training program for $2500 tuition",
      "Add a Medical Billing course with 160 hours",
      "Create Healthcare Administration program",
    ],
  },

  updateTuition: {
    description: "Update program tuition amount",
    params: {
      id: { type: "string", required: true, description: "Program ID (UUID)" },
      amount: { type: "number", required: true, description: "New tuition amount in dollars" },
    },
    examples: [
      "Update tuition for program abc-123 to $3000",
      "Change program xyz tuition to $2500",
    ],
  },

  createAffiliate: {
    description: "Add a new affiliate partner",
    params: {
      name: { type: "string", required: true, description: "Affiliate name" },
      email: { type: "string", required: true, description: "Contact email" },
      commission_rate: { type: "number", required: false, description: "Commission percentage", default: 10 },
    },
    examples: [
      "Add affiliate partner John Smith with email john@example.com",
      "Create affiliate for ABC Training Center",
    ],
  },

  addStudent: {
    description: "Enroll a student in a program",
    params: {
      student_id: { type: "string", required: true, description: "Student user ID (UUID)" },
      program_id: { type: "string", required: true, description: "Program/course ID (UUID)" },
    },
    examples: [
      "Enroll student abc-123 in program xyz-789",
      "Add student to Tax Prep course",
    ],
  },

  updateEnrollment: {
    description: "Modify student enrollment status",
    params: {
      enrollment_id: { type: "string", required: true, description: "Enrollment ID (UUID)" },
      status: { type: "string", required: true, description: "Status: active, completed, dropped" },
      progress: { type: "number", required: false, description: "Progress percentage (0-100)" },
    },
    examples: [
      "Mark enrollment abc-123 as completed",
      "Update enrollment xyz to 75% progress",
      "Set enrollment status to dropped",
    ],
  },

  generateReport: {
    description: "Generate ETPL or compliance report",
    params: {
      type: { type: "string", required: true, description: "Report type: etpl, compliance, enrollment" },
    },
    examples: [
      "Generate ETPL report",
      "Create compliance report",
      "Generate enrollment statistics",
    ],
  },

  processPayout: {
    description: "Process affiliate payout",
    params: {
      affiliate_id: { type: "string", required: true, description: "Affiliate user ID (UUID)" },
      amount: { type: "number", required: true, description: "Payout amount in dollars" },
    },
    examples: [
      "Process $500 payout to affiliate abc-123",
      "Pay affiliate xyz $1200",
    ],
  },

  getStats: {
    description: "Retrieve dashboard statistics",
    params: {},
    examples: [
      "Show me the stats",
      "Get dashboard statistics",
      "What are the current numbers?",
    ],
  },
};

/**
 * Generate system prompt with command catalog
 */
export function generateSystemPrompt() {
  const actions = Object.entries(COMMAND_CATALOG)
    .map(([action, config]) => {
      const params = Object.entries(config.params)
        .map(([name, spec]) => `${name}: ${spec.type}${spec.required ? ' (required)' : ''}`)
        .join(', ');
      return `- ${action}: ${config.description} (params: ${params || 'none'})`;
    })
    .join('\n');

  return `You are the EFH Autopilot Agent. Respond only in valid JSON: { action: string, params: object }

Available actions:
${actions}

Examples:
User: "Create a new Tax Prep Training program for $2500 tuition"
Response: {"action":"createProgram","params":{"title":"Tax Prep Training","tuition":2500,"hours":120}}

User: "Update tuition for program abc123 to $3000"
Response: {"action":"updateTuition","params":{"id":"abc123","amount":3000}}

User: "Generate ETPL report"
Response: {"action":"generateReport","params":{"type":"etpl"}}`;
}

/**
 * Validate action and params against catalog
 */
export function validateAction(action, params) {
  const config = COMMAND_CATALOG[action];
  
  if (!config) {
    return { valid: false, error: `Unknown action: ${action}` };
  }

  // Check required params
  for (const [paramName, paramSpec] of Object.entries(config.params)) {
    if (paramSpec.required && !(paramName in params)) {
      return { valid: false, error: `Missing required parameter: ${paramName}` };
    }
  }

  return { valid: true };
}
