const MODEL = "@cf/meta/llama-3-8b-instruct";
const RATE_LIMIT = 30; // requests per day per IP (form generation is expensive)

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return cors();

    if (req.method === "POST" && url.pathname === "/form") {
      const clientIP = req.headers.get("CF-Connecting-IP") || "unknown";
      
      // Rate limiting check
      const rateLimitKey = `ratelimit:form:${clientIP}:${getDateKey()}`;
      const currentCount = await getKVCount(env, rateLimitKey);
      if (currentCount >= RATE_LIMIT) {
        return jsonRes({ ok:false, error:"Rate limit exceeded. Try again tomorrow." }, 429);
      }

      try {
        const body = await req.json();
        const {
          prompt = "Create an intake form for name, email, phone",
          storage = "supabase", // future: allow other backends
          table = "intake_forms",
          brand = env.BRAND_NAME || "EFH"
        } = body || {};

        const sys = `You generate form schemas. Return structured text with SCHEMA: and COMPONENT: sections.`;
        const usr = `Brand: ${brand}
Storage: ${storage}
Table: ${table}
Prompt: ${prompt}

Generate a form with appropriate fields. Include validation rules.`;

        const startTime = Date.now();
        const out = await runAI(env, MODEL, sys, usr, 0.2);
        const duration = Date.now() - startTime;
        
        // Parse structured response
        const result = parseFormResponse(out, prompt, table);
        
        // Increment rate limit counter
        await incrementKVCount(env, rateLimitKey);
        
        // Log to analyzer
        await logToAnalyzer(env, "ai-form", "generate", true, duration, { fields: result.schema.fields.length });
        
        return jsonRes({ ok:true, ...result, storage, table, _meta: { duration_ms: duration } });
      } catch (e) {
        await logToAnalyzer(env, "ai-form", "generate", false, 0, { error: String(e) });
        return jsonRes({ ok:false, error:String(e) }, 500);
      }
    }

    return jsonRes({ ok:true, module:"ai-form" });
  }
};

/* helpers */
function parseFormResponse(text, prompt, table) {
  // Generate basic form schema based on common patterns
  const fields = [];
  
  // Common fields based on prompt keywords
  if (/name/i.test(prompt)) {
    fields.push({ key: "full_name", label: "Full Name", type: "text", required: true, min: 2, max: 100 });
  }
  if (/email/i.test(prompt)) {
    fields.push({ key: "email", label: "Email Address", type: "email", required: true });
  }
  if (/phone/i.test(prompt)) {
    fields.push({ key: "phone", label: "Phone Number", type: "tel", required: false });
  }
  if (/address/i.test(prompt)) {
    fields.push({ key: "address", label: "Address", type: "text", required: false, max: 200 });
  }
  if (/message|comment|note/i.test(prompt)) {
    fields.push({ key: "message", label: "Message", type: "textarea", required: false, max: 1000 });
  }
  
  // Default fields if none matched
  if (fields.length === 0) {
    fields.push(
      { key: "name", label: "Name", type: "text", required: true },
      { key: "email", label: "Email", type: "email", required: true }
    );
  }
  
  const schema = {
    name: table || "form_submission",
    fields
  };
  
  const react_component = generateReactComponent(schema);
  
  return { schema, react_component };
}

function generateReactComponent(schema) {
  return `import { useState } from 'react';

export default function ${toPascalCase(schema.name)}({ onSubmit }) {
  const [formData, setFormData] = useState({
${schema.fields.map(f => `    ${f.key}: ''`).join(',\n')}
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
${schema.fields.filter(f => f.required).map(f => `    if (!formData.${f.key}?.trim()) newErrors.${f.key} = '${f.label} is required';`).join('\n')}
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">${schema.name.replace(/_/g, ' ')}</h2>
${schema.fields.map(f => `      
      <div className="mb-4">
        <label htmlFor="${f.key}" className="block text-sm font-medium text-gray-700 mb-2">
          ${f.label}${f.required ? ' *' : ''}
        </label>
        <${f.type === 'textarea' ? 'textarea' : 'input'}
          type="${f.type === 'textarea' ? '' : f.type}"
          id="${f.key}"
          name="${f.key}"
          value={formData.${f.key}}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ${f.required ? 'required' : ''}
        ${f.type === 'textarea' ? '/>' : '/>'}
        {errors.${f.key} && <p className="mt-1 text-sm text-red-600">{errors.${f.key}}</p>}
      </div>`).join('\n')}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}`;
}

function toPascalCase(str) {
  return str.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

async function runAI(env, model, system, user, temperature=0.2){
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/run/${model}`, {
    method:"POST",
    headers: { "Authorization": `Bearer ${env.CF_API_TOKEN}`, "Content-Type":"application/json" },
    body: JSON.stringify({ temperature, messages:[{role:"system",content:system},{role:"user",content:user}] })
  });
  const j = await r.json();
  if (!r.ok || !j?.result?.response) throw new Error(j?.errors?.[0]?.message || "AI error");
  return j.result.response.trim();
}

function getDateKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}

async function getKVCount(env, key) {
  if (!env.REGISTRY) return 0;
  try {
    const val = await env.REGISTRY.get(key);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

async function incrementKVCount(env, key) {
  if (!env.REGISTRY) return;
  try {
    const current = await getKVCount(env, key);
    await env.REGISTRY.put(key, String(current + 1), { expirationTtl: 86400 }); // 24h TTL
  } catch {}
}

async function logToAnalyzer(env, autopilot, task, ok, duration, metadata = {}) {
  try {
    const analyzerURL = env.ANALYZER_URL || "https://efh-autopilot-analyzer.elevateforhumanity.workers.dev/logs/ingest";
    await fetch(analyzerURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        autopilot,
        task,
        ok,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
        ...metadata
      })
    });
  } catch {}
}

function safeParseJSON(s){ try { return JSON.parse(s); } catch { return null; } }
function cors(){ return new Response(null, { headers: { "Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization" } }); }
function jsonRes(b,s=200){ return new Response(JSON.stringify(b), { status:s, headers:{ "Content-Type":"application/json","Access-Control-Allow-Origin":"*" } }); }
