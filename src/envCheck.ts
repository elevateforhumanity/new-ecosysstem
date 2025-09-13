const REQUIRED = ['VITE_SENTRY_DSN'] as const  // add more as needed

function isProd() {
  return import.meta.env.MODE === 'production'
}

export function assertEnv() {
  const missing = REQUIRED.filter(k => !import.meta.env[k])
  if (missing.length) {
    const msg = `Missing required env vars: ${missing.join(', ')}`
    if (isProd()) {
      // eslint-disable-next-line no-console
      console.error(msg)
    } else {
      // eslint-disable-next-line no-console
      console.warn(msg)
    }
  }
}

{
  "terminal.integrated.profiles.linux": {
    "bash (clean)": { "path": "/bin/bash", "args": ["--noprofile","--norc","-l"] }
  },
  "terminal.integrated.defaultProfile.linux": "bash (clean)"
}
