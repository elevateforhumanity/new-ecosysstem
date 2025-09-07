import { z } from 'zod';

// Central environment validation. Fails fast if required vars missing.
export const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  DATABASE_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  STRIPE_SECRET_KEY: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),
  LOG_LEVEL: z.string().optional(),
  VITE_API_BASE_URL: z.string().url().optional(),
  VITE_ANALYTICS_ID: z.string().optional()
});

export type AppEnv = z.infer<typeof EnvSchema>;

let cached: AppEnv | null = null;

export function loadEnv(): AppEnv {
  if (cached) return cached;
  
  // In test mode, provide sensible defaults if not set
  const envVars = { ...process.env };
  if (process.env.NODE_ENV === 'test' && !envVars.JWT_SECRET) {
    envVars.JWT_SECRET = 'test_secret_key_for_testing_minimum_16_chars';
  }
  
  const parsed = EnvSchema.safeParse(envVars);
  if (!parsed.success) {
    // Aggregate errors
    const issues = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n');
    // eslint-disable-next-line no-console
    console.error('\nEnvironment validation failed:\n' + issues + '\n');
    
    // Don't exit in test mode, throw error instead
    if (process.env.NODE_ENV === 'test') {
      throw new Error('Environment validation failed');
    }
    process.exit(1);
  }
  cached = parsed.data;
  return cached;
}

// Allow running standalone via: npm run env:check
if (import.meta.url === `file://${process.argv[1]}`) {
  loadEnv();
  // eslint-disable-next-line no-console
  console.log('✅ Environment variables validated');
}