/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_BASE: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_FEATURE_FLAG_ALPHA?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}