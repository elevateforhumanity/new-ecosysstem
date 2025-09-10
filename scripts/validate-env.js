#!/usr/bin/env node
// Environment variable validation using zod
const { z } = require('zod');

// Allow skipping in CI/Vercel or via env flag
if (
  process.env.SKIP_ENV_VALIDATION === 'true' ||
  process.env.CI === 'true' ||
  process.env.VERCEL === '1'
) {
  console.log('ℹ️  Env validation skipped (CI/VERCEL/SKIP_ENV_VALIDATION).');
  process.exit(0);
}

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  STRIPE_SECRET_KEY: z.string().min(10),
  STRIPE_SUCCESS_URL: z.string().url(),
  STRIPE_CANCEL_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_KEY: z.string().min(20),
});

const result = schema.safeParse(process.env);
if (!result.success) {
  console.error('\n❌ Environment validation failed:\n');
  for (const issue of result.error.issues) {
    console.error(`- ${issue.path.join('.')}: ${issue.message}`);
  }
  console.error('\nSet the missing variables in your environment (.env.local or project settings).');
  process.exit(1);
}
console.log('✅ Environment variables validated.');
